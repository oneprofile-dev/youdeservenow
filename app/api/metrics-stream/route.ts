import { NextRequest, NextResponse } from "next/server";
import { getKV } from "@/lib/kv";

/**
 * Server-Sent Events (SSE) endpoint for real-time metric updates
 *
 * Usage:
 * ```
 * const eventSource = new EventSource('/api/metrics-stream?resultId=xyz');
 * eventSource.addEventListener('metric-update', (e) => {
 *   const data = JSON.parse(e.data);
 *   console.log(data); // { resultId, metric, value, qualityScore, rank }
 * });
 * ```
 */
export async function GET(req: NextRequest) {
  const resultId = req.nextUrl.searchParams.get("resultId");
  const category = req.nextUrl.searchParams.get("category");

  if (!resultId) {
    return NextResponse.json({ error: "resultId required" }, { status: 400 });
  }

  // Set up SSE response headers
  const responseHeaders = new Headers({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no", // Disable buffering for Nginx
  });

  // Create a readable stream
  const encoder = new TextEncoder();
  let isClosed = false;

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send initial connection message
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "connected",
              resultId,
              timestamp: new Date().toISOString(),
            })}\n\n`
          )
        );

        const kv = await getKV();
        if (!kv) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", message: "DB unavailable" })}\n\n`
            )
          );
          controller.close();
          return;
        }

        // Poll for metric updates every 5 seconds
        const pollInterval = setInterval(async () => {
          if (isClosed) {
            clearInterval(pollInterval);
            return;
          }

          try {
            // Get current metrics
            const likesCount = (await kv.get<number>(`result:${resultId}:likes`)) || 0;
            const sharesCount = (await kv.get<number>(`result:${resultId}:shares`)) || 0;
            const clicksCount = (await kv.get<number>(`result:${resultId}:affiliate_clicks`)) || 0;

            // Calculate quality score
            const qualityScore = likesCount * 0.5 + sharesCount * 1.0 + clicksCount * 2.0;

            // Get rank in category or overall
            const sortKey = category
              ? `results:by:quality:category:${category}:zset`
              : `results:by:quality:zset`;

            // Get rank (number of items with higher score)
            const rank =
              (await kv.zcount(
                sortKey,
                `(${qualityScore}`,
                "+inf" // Items with score > current
              )) + 1; // +1 because zcount is 0-indexed

            // Send update
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "metric-update",
                  resultId,
                  metrics: {
                    likes: likesCount,
                    shares: sharesCount,
                    affiliate_clicks: clicksCount,
                  },
                  qualityScore,
                  rank,
                  timestamp: new Date().toISOString(),
                })}\n\n`
              )
            );
          } catch (error) {
            console.error("[metrics-stream] Poll error:", error);
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: "error" })}\n\n`)
            );
          }
        }, 5000);

        // Clean up on client disconnect
        req.signal.addEventListener("abort", () => {
          isClosed = true;
          clearInterval(pollInterval);
          controller.close();
        });
      } catch (error) {
        console.error("[metrics-stream] Error:", error);
        controller.close();
      }
    },
  });

  return new NextResponse(stream, { headers: responseHeaders });
}
