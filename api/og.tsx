import { ImageResponse } from "@vercel/og";

export const runtime = "edge";

export default async function handler(req: Request) {
  try {
    /* =========================================
       GET PARAM
    ========================================= */
    const { searchParams } = new URL(req.url);
    const escrowRaw = searchParams.get("escrow");

    if (!escrowRaw) {
      return new Response("Missing escrow", { status: 400 });
    }

    const escrow = escrowRaw.toLowerCase();

    /* =========================================
       FETCH WAGER
    ========================================= */
    const res = await fetch(
      `https://predex-22ce1-default-rtdb.firebaseio.com/wagers/${escrow}.json`
    );

    if (!res.ok) {
      return new Response("Wager not found", { status: 404 });
    }

    const wager = await res.json();

    /* =========================================
       HELPERS
    ========================================= */
    const short = (addr?: string) =>
      addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "Unknown";

    const creator = short(wager?.creator);
    const opponent = short(wager?.opponent);
    const statement = wager?.statement || "You've been challenged";
    const amount = wager?.amount || "0";
    const status = wager?.opponent ? "LOCKED" : "OPEN";

    /* =========================================
       RETURN IMAGE (THIS IS THE KEY)
    ========================================= */
    return new ImageResponse(
      (
        <div
          style={{
            width: "1200px",
            height: "630px",
            background: "#0a0a0a",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "Arial",
          }}
        >
          <div
            style={{
              width: "720px",
              background: "#111",
              border: "3px solid #444",
              padding: "40px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              color: "#ffffff",
            }}
          >
            {/* HEADER */}
            <div style={{ fontSize: 20, opacity: 0.7 }}>
              PreDEX Wager
            </div>

            {/* MATCHUP */}
            <div style={{ fontSize: 36, fontWeight: "bold" }}>
              {creator} vs {opponent}
            </div>

            {/* STATEMENT */}
            <div style={{ fontSize: 24 }}>
              {statement}
            </div>

            {/* FOOTER */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 20,
                opacity: 0.85,
              }}
            >
              <span>Pot: ${amount}</span>
              <span>{status}</span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          "Content-Type": "image/png",
        },
      }
    );
  } catch (err) {
    return new Response("OG image error", { status: 500 });
  }
}