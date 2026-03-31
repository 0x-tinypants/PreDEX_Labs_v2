import { ImageResponse } from "@vercel/og";
import React from "react";

export const runtime = "edge";

export default async function handler(req: Request) {
  try {
    const url = new URL(req.url, "https://www.predexlabs.com");
    const escrow = url.searchParams.get("escrow") || "UNKNOWN";

    return new ImageResponse(
      React.createElement(
        "div",
        {
          style: {
            width: "1200px",
            height: "630px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "#0a0a0a",
          },
        },
        React.createElement(
          "div",
          {
            style: {
              width: "900px",
              padding: "40px",
              borderRadius: "20px",
              border: "2px solid #d9ff00",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "20px",
            },
          },
          React.createElement(
            "div",
            {
              style: {
                color: "#d9ff00",
                fontSize: "48px",
                fontWeight: 700,
              },
            },
            "PreDEX"
          ),

          React.createElement(
            "div",
            {
              style: {
                color: "#ffffff",
                fontSize: "36px",
              },
            },
            "Wager Invite"
          ),

          React.createElement(
            "div",
            {
              style: {
                color: "#58dd53",
                fontSize: "40px",
              },
            },
            `${escrow.slice(0, 6)}...${escrow.slice(-4)}`
          ),

          React.createElement(
            "div",
            {
              style: {
                color: "#999",
                fontSize: "22px",
              },
            },
            "Tap to View"
          )
        )
      ),
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