import React from "react";
import { ImageResponse } from "@vercel/og";

export const config = {
  runtime: "edge",
};

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const escrow = url.searchParams.get("escrow");

  let wager: any = null;

  // ✅ SAFE FETCH (no hardcoded domain)
  if (escrow) {
    try {
      const base = url.origin;

      const res = await fetch(
        `${base}/api/wager?escrow=${escrow}`,
        {
          // prevent hanging
          cache: "no-store",
        }
      );

      if (res.ok) {
        wager = await res.json();
      }
    } catch (e) {
      console.log("OG fetch error:", e);
    }
  }

  // ✅ DATA MAPPING
  const title = wager
    ? `${short(wager.creator)} vs ${short(wager.opponent)}`
    : "PreDEX Wager";

  const amount = wager ? `$${wager.pot}` : "";
  const statement = wager?.statement || "";
  const status = wager?.status || "";

  return new ImageResponse(
    React.createElement(
      "div",
      {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#000000",
          color: "#dbf93a",
          fontFamily: "Arial, sans-serif",
          padding: "40px",
          textAlign: "center",
        },
      },
      [
        // TITLE
        React.createElement(
          "div",
          {
            key: "title",
            style: {
              fontSize: "56px",
              fontWeight: "700",
            },
          },
          title
        ),

        // AMOUNT
        React.createElement(
          "div",
          {
            key: "amount",
            style: {
              fontSize: "40px",
              marginTop: "20px",
            },
          },
          amount
        ),

        // STATEMENT
        React.createElement(
          "div",
          {
            key: "statement",
            style: {
              fontSize: "24px",
              marginTop: "20px",
              opacity: 0.8,
              maxWidth: "900px",
            },
          },
          statement
        ),

        // STATUS
        React.createElement(
          "div",
          {
            key: "status",
            style: {
              fontSize: "20px",
              marginTop: "30px",
              opacity: 0.6,
            },
          },
          status
        ),
      ]
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

// ✅ helper
function short(addr?: string | null) {
  if (!addr) return "Open";
  return addr.slice(0, 6);
}