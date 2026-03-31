import { ImageResponse } from "@vercel/og";
import type { CSSProperties } from "react";

export const runtime = "edge";

export default async function handler(req: Request) {
  try {
    const url = new URL(req.url, "https://www.predexlabs.com");
    const escrow = url.searchParams.get("escrow") || "UNKNOWN";

    return new ImageResponse(
      <div style={base}>
        <div style={card}>
          <div style={title}>PreDEX</div>

          <div style={match}>
            Wager Invite
          </div>

          <div style={amount}>
            {escrow.slice(0, 6)}...{escrow.slice(-4)}
          </div>

          <div style={status}>
            Tap to View
          </div>
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (err) {
    console.error("OG ERROR:", err);
    return new Response("OG failed", { status: 500 });
  }
}

/* ========================= */

const base: CSSProperties = {
  width: "1200px",
  height: "630px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#0a0a0a",
};

const card: CSSProperties = {
  width: "900px",
  padding: "40px",
  borderRadius: "20px",
  border: "2px solid #d9ff00",
  display: "flex",
  flexDirection: "column",
  gap: "20px",
  alignItems: "center",
};

const title: CSSProperties = {
  color: "#d9ff00",
  fontSize: "48px",
  fontWeight: 700,
};

const match: CSSProperties = {
  color: "#ffffff",
  fontSize: "36px",
};

const amount: CSSProperties = {
  color: "#58dd53",
  fontSize: "42px",
};

const status: CSSProperties = {
  color: "#999",
  fontSize: "22px",
};