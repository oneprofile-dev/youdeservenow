import { ImageResponse } from "next/og";
import { getResult } from "@/lib/db";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  let productName = "Your Reward";
  let justificationSnippet = "Science has determined you deserve this.";
  let price = "";

  if (id) {
    try {
      const result = await getResult(id);
      if (result) {
        productName = result.product.name;
        price = result.product.price;
        // Keep snippet tight for visual clarity
        justificationSnippet =
          result.justification.length > 130
            ? result.justification.slice(0, 130) + "…"
            : result.justification;
      }
    } catch {
      // fall through to defaults
    }
  }

  return new ImageResponse(
    (
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
          <span style={{ color: "#C8963E" }}>{productName}</span>
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
          {`"${justificationSnippet}"`}
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
          {price && (
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
                gap: "8px",
              }}
            >
              {price} · Claim Reward →
            </div>
          )}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
