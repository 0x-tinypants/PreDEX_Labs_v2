/** @jsxImportSource react */
import { ImageResponse } from "@vercel/og";

export const config = {
  runtime: "edge",
};

export default function handler() {
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
          fontFamily: "Arial",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ color: "#dbf93a", fontSize: 28 }}>PreDEX</div>
          <div style={{ color: "#999", fontSize: 18 }}>OPEN</div>
        </div>

        <div style={{ color: "white", fontSize: 42 }}>
          test test test for the logs
        </div>

        <div style={{ color: "#ccc", fontSize: 20 }}>
          0xe71d...561f vs 0xa876...304b
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ color: "#aaa" }}>Stake: 0.001 ETH</div>
          <div style={{ color: "#dbf93a" }}>Pot: 0.002 ETH</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}