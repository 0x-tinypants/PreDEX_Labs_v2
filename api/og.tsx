import { ImageResponse } from "@vercel/og";
import type { CSSProperties } from "react";

export const runtime = "edge";

export default async function handler(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const escrow = searchParams.get("escrow");

    if (!escrow) {
      return new ImageResponse(
        <div style={base}>Missing Wager</div>,
        { width: 1200, height: 630 }
      );
    }

    /* =========================================
       🔥 FETCH WAGER DATA
    ========================================= */
    const response = await fetch(
      "https://predex-22ce1-default-rtdb.firebaseio.com/wagers.json"
    );

    const raw = await response.json();
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;

    const wager = data?.[escrow];

    if (!wager) {
      return new ImageResponse(
        <div style={base}>Wager Not Found</div>,
        { width: 1200, height: 630 }
      );
    }

    /* =========================================
       🧠 SAFE PARSING
    ========================================= */
    const challenger = wager?.challenger || "Player A";
    const opponent = wager?.opponent || "Player B";
    const amount = wager?.amount || "—";
    const status = wager?.status || "Open";

    /* =========================================
       🎨 IMAGE UI
    ========================================= */
    return new ImageResponse(
      <div style={base}>
        <div style={card}>

          <div style={title}>PreDEX</div>

          <div style={match}>
            {challenger} vs {opponent}
          </div>

          <div style={amountStyle}>
            ${amount}
          </div>

          <div style={statusStyle}>
            {status}
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

    return new ImageResponse(
      <div style={base}>Error Generating Preview</div>,
      { width: 1200, height: 630 }
    );
  }
}

/* =========================================
   🎨 STYLES (STRICTLY TYPED)
========================================= */

const base: CSSProperties = {
  width: "1200px",
  height: "630px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#0a0a0a",
  fontFamily: "Arial",
};

const card: CSSProperties = {
  width: "900px",
  padding: "40px",
  borderRadius: "20px",
  background: "rgba(255,255,255,0.05)",
  border: "2px solid #d9ff00",
  display: "flex",
  flexDirection: "column",
  gap: "20px",
  textAlign: "center",
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

const amountStyle: CSSProperties = {
  color: "#58dd53",
  fontSize: "52px",
  fontWeight: 700,
};

const statusStyle: CSSProperties = {
  color: "#999",
  fontSize: "24px",
};