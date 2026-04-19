import { ImageResponse } from "next/og";
import { put } from "@vercel/blob";
import type { Result } from "@/lib/db";

function OgCard({ result }: { result: Result }) {
  const { product, justification } = result;
  const snippet =
    justification.length > 130
      ? justification.slice(0, 130) + "…"
      : justification;

  return (
    <div
      style={{
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        background: "#FBF8F3",
        padding: "64px 72px",
        fontFamily: "Georgia, 'Times New Roman', serif",
      }}
    >
      {/* Top label */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "32px",
        }}
      >
        <div
          style={{
            width: "3px",
            height: "16px",
            background: "#C8963E",
            borderRadius: "2px",
          }}
        />
        <span
          style={{
            fontSize: "13px",
            fontWeight: 700,
            letterSpacing: "0.18em",
            color: "#C8963E",
            textTransform: "uppercase",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          The Science Is In · YouDeserveNow.com
        </span>
      </div>

      {/* Main headline */}
      <div
        style={{
          fontSize: "50px",
          color: "#1A1814",
          lineHeight: 1.18,
          marginBottom: "28px",
          fontFamily: "Georgia, serif",
        }}
      >
        {"Science says I deserve "}
        <span style={{ color: "#C8963E" }}>{product.name}</span>
      </div>

      {/* Justification snippet */}
      <div
        style={{
          fontSize: "21px",
          color: "#6B6560",
          lineHeight: 1.6,
          fontStyle: "italic",
          fontFamily: "Georgia, serif",
          flex: 1,
        }}
      >
        {`"${snippet}"`}
      </div>

      {/* Bottom bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid #E8E0D6",
          paddingTop: "24px",
          marginTop: "24px",
        }}
      >
        <span
          style={{
            fontSize: "22px",
            fontWeight: 700,
            color: "#1A1814",
            fontFamily: "Georgia, serif",
          }}
        >
          YouDeserveNow.com
        </span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "#1A1814",
            color: "#FBF8F3",
            padding: "10px 28px",
            borderRadius: "100px",
            fontSize: "17px",
            fontFamily: "system-ui, sans-serif",
            fontWeight: 600,
          }}
        >
          {product.price} · Claim Reward →
        </div>
      </div>
    </div>
  );
}

export async function generateAndUploadOgImage(
  result: Result
): Promise<string | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;

  try {
    const imageResponse = new ImageResponse(<OgCard result={result} />, {
      width: 1200,
      height: 630,
    });

    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const blob = await put(`og/${result.id}.png`, buffer, {
      access: "public",
      contentType: "image/png",
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    console.log(`[OG Blob] uploaded for ${result.id}: ${blob.url}`);
    return blob.url;
  } catch (err) {
    console.error(
      "[OG Blob] upload failed:",
      err instanceof Error ? err.message : err
    );
    return null;
  }
}
