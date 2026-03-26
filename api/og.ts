import React from "react";
import { ImageResponse } from "@vercel/og";

export const config = {
  runtime: "edge",
};

export default function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const escrow = searchParams.get("escrow");

  return new ImageResponse(
    React.createElement(
      "div",
      {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000000",
          color: "#dbf93a",
          fontFamily: "Arial, sans-serif",
        },
      },
      [
        // TITLE
        React.createElement(
          "div",
          {
            key: "title",
            style: {
              fontSize: "64px",
              fontWeight: "700",
            },
          },
          "PreDEX Wager"
        ),

        // SUBTEXT (THIS IS WHAT YOU WERE MISSING)
        React.createElement(
          "div",
          {
            key: "sub",
            style: {
              fontSize: "28px",
              marginTop: "20px",
              opacity: 0.7,
            },
          },
          escrow ? `Escrow: ${escrow}` : "No Escrow Param"
        ),
      ]
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}