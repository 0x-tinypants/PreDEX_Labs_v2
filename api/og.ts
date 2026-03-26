import React from "react";
import { ImageResponse } from "@vercel/og";

export const config = {
  runtime: "edge",
};

export default function handler() {
  return new ImageResponse(
    React.createElement(
      "div",
      {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000000",
          color: "#dbf93a",
          fontSize: "64px",
          fontWeight: "700",
          fontFamily: "Arial, sans-serif",
        },
      },
      "PreDEX Wager"
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}