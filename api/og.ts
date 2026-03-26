import { ImageResponse } from "@vercel/og";

export const config = {
  runtime: "edge",
};

export default async function handler(req: Request) {
  let wager: any = null;

  try {
    const { searchParams } = new URL(req.url);
    const escrow = searchParams.get("escrow");

    // 🔥 Fetch ALL wagers (handles your stringified DB)
    const res = await fetch(
      "https://predex-22ce1-default-rtdb.firebaseio.com/wagers.json"
    );

    if (res.ok) {
      const raw = await res.json();
      const data = typeof raw === "string" ? JSON.parse(raw) : raw;

      if (data && typeof data === "object") {
        // ✅ Use escrow if valid
        if (escrow && data[escrow]) {
          wager = data[escrow];
        } else {
          // ✅ fallback to first available wager
          const firstKey = Object.keys(data)[0];
          if (firstKey) wager = data[firstKey];
        }
      }
    }
  } catch {
    wager = null;
  }

  // 🧱 FALLBACK
  if (!wager) {
    return new ImageResponse(
      {
        type: "div",
        props: {
          style: centerStyle("#d9ff00"),
          children: "PreDEX Wager",
        },
      },
      { width: 1200, height: 630 }
    );
  }

  // 🧠 DATA
  const creator = wager.creator || "Unknown";
  const opponent = wager.opponent || "Open";
  const amount = Number(wager.amount || 0);
  const pot = wager.opponent ? amount * 2 : amount;
  const statement = wager.statement || "No statement provided";
  const status = wager.opponent ? "LOCKED" : "OPEN";

  // 🖼️ MAIN IMAGE
  return new ImageResponse(
    {
      type: "div",
      props: {
        style: containerStyle,
        children: [
          text(`${creator} vs ${opponent}`, 60, 800),
          text(statement, 40, 400, 0.85),
          {
            type: "div",
            props: {
              style: rowStyle,
              children: [
                text(`Pot: $${pot}`, 36),
                text(status, 36),
              ],
            },
          },
        ],
      },
    },
    { width: 1200, height: 630 }
  );
}

/* ================================
   🎨 STYLES (clean + reusable)
================================ */

const containerStyle = {
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  background: "black",
  color: "white",
  padding: 60,
};

const rowStyle = {
  display: "flex",
  justifyContent: "space-between",
};

const centerStyle = (color: string) => ({
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "black",
  color,
  fontSize: 48,
  fontWeight: 700,
});

/* ================================
   🧩 ELEMENT HELPERS
================================ */

function text(
  content: string,
  size: number,
  weight: number = 400,
  opacity: number = 1
) {
  return {
    type: "div",
    props: {
      style: {
        fontSize: size,
        fontWeight: weight,
        opacity,
      },
      children: content,
    },
  };
}