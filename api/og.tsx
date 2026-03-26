import { ImageResponse } from "@vercel/og";

export const config = {
  runtime: "edge",
};

export default async function handler(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const escrowParam = searchParams.get("escrow");

    let wager: any = null;

    try {
      // 🔥 ALWAYS fetch full wagers (because DB is stringified)
      const res = await fetch(
        "https://predex-22ce1-default-rtdb.firebaseio.com/wagers.json"
      );

      if (res.ok) {
        const raw = await res.json();

        // 🔥 CRITICAL FIX
        const parsed =
          typeof raw === "string" ? JSON.parse(raw) : raw;

        if (parsed && typeof parsed === "object") {
          // ✅ Try exact escrow match
          if (escrowParam && parsed[escrowParam]) {
            wager = parsed[escrowParam];
          } else {
            // ✅ fallback to first key
            const firstKey = Object.keys(parsed)[0];
            wager = parsed[firstKey];
          }
        }
      }
    } catch (e) {
      console.log("FETCH ERROR:", e);
      wager = null;
    }

    // ❌ ONLY show fallback if truly no data
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
              color: "#d9ff00",
              fontSize: 48,
              fontWeight: 700,
            }}
          >
            DEBUG FALLBACK 123
          </div>
        ),
        { width: 1200, height: 630 }
      );
    }

    // ✅ DATA
    const creator = wager.creator || "Unknown";
    const opponent = wager.opponent || "Open";
    const amount = Number(wager.amount || 0);
    const hasOpponent = !!wager.opponent;

    const pot = hasOpponent ? amount * 2 : amount;
    const statement = wager.statement || "No statement provided";
    const status = hasOpponent ? "LOCKED" : "OPEN";

    // ✅ RENDER REAL CARD
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

          <div style={{ fontSize: 40, opacity: 0.85 }}>
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
  } catch (err) {
    console.log("TOP LEVEL ERROR:", err);

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
            color: "#d9ff00",
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