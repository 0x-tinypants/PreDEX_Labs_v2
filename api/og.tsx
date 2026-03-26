import React from "react";
import { ImageResponse } from "@vercel/og";

export const config = {
  runtime: "edge",
};

export default async function handler(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let escrow = searchParams.get("escrow");

    let wager: any = null;

    try {
      // 🔥 STEP 1 — If no escrow, grab one automatically
      if (!escrow) {
        const listRes = await fetch(
          "https://predex-22ce1-default-rtdb.firebaseio.com/wagers.json"
        );

        if (listRes.ok) {
          const all = await listRes.json();

          if (all) {
            const keys = Object.keys(all);
            if (keys.length > 0) {
              escrow = keys[0]; // 👈 auto-select real wager
            }
          }
        }
      }

      // 🔥 STEP 2 — Fetch specific wager
      if (escrow) {
        const res = await fetch(
          `https://predex-22ce1-default-rtdb.firebaseio.com/wagers/${escrow}.json`
        );

        if (res.ok) {
          wager = await res.json();
        }
      }
    } catch {
      wager = null;
    }

    // ✅ FALLBACK UI (only if DB truly empty)
    if (!wager) {
      return new ImageResponse(
        (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "black",
              color: "white",
              fontSize: 48,
              fontWeight: 700,
            }}
          >
            PreDEX Wager
          </div>
        ),
        { width: 1200, height: 630 }
      );
    }

    // ✅ SAFE DATA EXTRACTION
    const creator = wager?.creator || "Unknown";
    const opponent = wager?.opponent || "Open";
    const amount = Number(wager?.amount || 0);
    const hasOpponent = !!wager?.opponent;

    const pot = hasOpponent ? amount * 2 : amount;
    const statement = wager?.statement || "No statement provided";
    const status = hasOpponent ? "LOCKED" : "OPEN";

    // ✅ MAIN OG IMAGE
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background: "black",
            color: "white",
            padding: 60,
          }}
        >
          <div style={{ fontSize: 60, fontWeight: 800 }}>
            {creator} vs {opponent}
          </div>

          <div style={{ fontSize: 40, opacity: 0.8 }}>
            {statement}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ fontSize: 36 }}>Pot: ${pot}</div>
            <div style={{ fontSize: 36 }}>{status}</div>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  } catch {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "black",
            color: "white",
            fontSize: 48,
            fontWeight: 700,
          }}
        >
          PreDEX Wager
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }
}