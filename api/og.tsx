/** @jsxImportSource react */

import { ImageResponse } from "@vercel/og";
import { getWagerForOG } from "../lib/server/wagers";

export const config = {
  runtime: "edge",
};

export default async function handler(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return new Response("Missing id", { status: 400 });
    }

    const wager = await getWagerForOG(id);

    if (!wager) {
      return new Response("Wager not found", { status: 404 });
    }

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "#0a0a0a",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "40px",
            fontFamily: "Arial, sans-serif",
          }}
        >
          {/* HEADER */}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ color: "#dbf93a", fontSize: 28 }}>
              PreDEX
            </div>
            <div
              style={{
                color: wager.status === "LOCKED" ? "#58dd53" : "#999",
                fontSize: 18,
              }}
            >
              {wager.status}
            </div>
          </div>

          {/* STATEMENT */}
          <div
            style={{
              color: "white",
              fontSize: 42,
              lineHeight: 1.2,
              marginTop: 20,
            }}
          >
            {wager.statement || "No statement"}
          </div>

          {/* PARTICIPANTS */}
          <div style={{ marginTop: 20, color: "#ccc", fontSize: 20 }}>
            {wager.creator}
            {wager.opponent
              ? ` vs ${wager.opponent}`
              : " (Open Challenge)"}
          </div>

          {/* FOOTER */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 30,
            }}
          >
            <div style={{ color: "#aaa", fontSize: 18 }}>
              Stake: {wager.stake} ETH
            </div>

            <div
              style={{
                color: "#dbf93a",
                fontSize: 24,
                fontWeight: "bold",
              }}
            >
              Pot: {wager.pot} ETH
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (err) {
    return new Response("OG Error", { status: 500 });
  }
}