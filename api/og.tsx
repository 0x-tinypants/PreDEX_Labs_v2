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
      const res = await fetch(
        "https://predex-22ce1-default-rtdb.firebaseio.com/wagers.json"
      );

      if (res.ok) {
        const raw = await res.json();

        const parsed =
          typeof raw === "string" ? JSON.parse(raw) : raw;

        if (parsed && typeof parsed === "object") {
          if (escrowParam && parsed[escrowParam]) {
            wager = parsed[escrowParam];
          } else {
            const firstKey = Object.keys(parsed)[0];
            wager = parsed[firstKey];
          }
        }
      }
    } catch {
      wager = null;
    }

    // fallback
    if (!wager) {
      return new ImageResponse(
        {
          type: "div",
          props: {
            style: {
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "black",
              color: "#d9ff00",
              fontSize: 48,
              fontWeight: 700,
            },
            children: "PreDEX Wager",
          },
        },
        { width: 1200, height: 630 }
      );
    }

    const creator = wager.creator || "Unknown";
    const opponent = wager.opponent || "Open";
    const amount = Number(wager.amount || 0);
    const hasOpponent = !!wager.opponent;

    const pot = hasOpponent ? amount * 2 : amount;
    const statement = wager.statement || "No statement provided";
    const status = hasOpponent ? "LOCKED" : "OPEN";

    return new ImageResponse(
      {
        type: "div",
        props: {
          style: {
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background: "black",
            color: "white",
            padding: 60,
          },
          children: [
            {
              type: "div",
              props: {
                style: { fontSize: 60, fontWeight: 800 },
                children: `${creator} vs ${opponent}`,
              },
            },
            {
              type: "div",
              props: {
                style: { fontSize: 40, opacity: 0.85 },
                children: statement,
              },
            },
            {
              type: "div",
              props: {
                style: {
                  display: "flex",
                  justifyContent: "space-between",
                },
                children: [
                  {
                    type: "div",
                    props: {
                      style: { fontSize: 36 },
                      children: `Pot: $${pot}`,
                    },
                  },
                  {
                    type: "div",
                    props: {
                      style: { fontSize: 36 },
                      children: status,
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      { width: 1200, height: 630 }
    );
  } catch {
    return new ImageResponse(
      {
        type: "div",
        props: {
          style: {
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "black",
            color: "#d9ff00",
            fontSize: 48,
            fontWeight: 700,
          },
          children: "PreDEX Wager",
        },
      },
      { width: 1200, height: 630 }
    );
  }
}