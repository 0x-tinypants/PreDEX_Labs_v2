import { ImageResponse } from "@vercel/og";

export const runtime = "edge";

export default async function handler(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const escrow = searchParams.get("escrow") || "unknown";

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
            color: "#d9ff00",
            fontSize: "42px",
            fontFamily: "Arial",
          },
        },
        `PreDEX Wager: ${escrow}`
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (err) {
    return new Response("OG image error", { status: 500 });
  }
}