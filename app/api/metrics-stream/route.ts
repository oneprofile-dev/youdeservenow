import { NextRequest, NextResponse } from "next/server";
import { getKV } from "@/lib/kv";

/**
 * Server-Sent Events endpoint for real-time metric updates.
 *
 * Deduplication: a module-level cache stores the last poll result per resultId
 * for CACHE_TTL_MS. All concurrent SSE connections for the same resultId share
 * one KV fetch per interval instead of N fetches, keeping KV usage flat.
 */

const POLL_INTERVAL_MS = 5000;
const CACHE_TTL_MS = 5000;

interface MetricsCache {
  data: MetricsPayload;
  fetchedAt: number;
}

interface MetricsPayload {
  type: "metric-update";
  resultId: string;
  metrics: { likes: number; shares: number; affiliate_clicks: number };
  qualityScore: number;
  rank: number;
  timestamp: string;
}

// Module-level cache — shared across all requests in the same Node.js process
const metricsCache = new Map<string, MetricsCache>();

const ID_RE = /^[a-z0-9]{6,12}$/;

async function fetchMetrics(resultId: string, category: string | null): Promise<MetricsPayload | null> {
  const cached = metricsCache.get(resultId);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.data;
  }

  const kv = await getKV();
  if (!kv) return null;

  const [likesCount, sharesCount, clicksCount] = await Promise.all([
    kv.get<number>(`result:${resultId}:likes`).then((v) => v ?? 0),
    kv.get<number>(`result:${resultId}:shares`).then((v) => v ?? 0),
    kv.get<number>(`result:${resultId}:affiliate_clicks`).then((v) => v ?? 0),
  ]);

  const qualityScore = likesCount * 0.5 + sharesCount * 1.0 + clicksCount * 2.0;
  const sortKey = category
    ? `results:by:quality:category:${category}:zset`
    : `results:by:quality:zset`;

  const rank = (await kv.zcount(sortKey, `(${qualityScore}`, "+inf").catch(() => 0)) + 1;

  const payload: MetricsPayload = {
    type: "metric-update",
    resultId,
    metrics: { likes: likesCount, shares: sharesCount, affiliate_clicks: clicksCount },
    qualityScore,
    rank,
    timestamp: new Date().toISOString(),
  };

  metricsCache.set(resultId, { data: payload, fetchedAt: Date.now() });
  return payload;
}

export async function GET(req: NextRequest) {
  const resultId = req.nextUrl.searchParams.get("resultId");
  const category = req.nextUrl.searchParams.get("category");

  if (!resultId || !ID_RE.test(resultId)) {
    return NextResponse.json({ error: "Invalid resultId" }, { status: 400 });
  }

  const encoder = new TextEncoder();
  let isClosed = false;

  const stream = new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "connected", resultId, timestamp: new Date().toISOString() })}\n\n`
          )
        );

        const kv = await getKV();
        if (!kv) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "error", message: "DB unavailable" })}\n\n`)
          );
          controller.close();
          return;
        }

        const pollInterval = setInterval(async () => {
          if (isClosed) { clearInterval(pollInterval); return; }

          try {
            const payload = await fetchMetrics(resultId, category);
            if (payload) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
            }
          } catch (err) {
            console.error("[metrics-stream] Poll error:", err);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "error" })}\n\n`));
          }
        }, POLL_INTERVAL_MS);

        req.signal.addEventListener("abort", () => {
          isClosed = true;
          clearInterval(pollInterval);
          controller.close();
        });
      } catch (err) {
        console.error("[metrics-stream] Error:", err);
        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
