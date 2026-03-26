import { getWagerForOG } from "../src/lib/server/wagers";

export default async function handler(req: any, res: any) {
  const escrow = req.query.escrow;

  console.log("WAGER API HIT:", escrow);

  if (!escrow) {
    return res.status(400).json({ error: "Missing escrow" });
  }

  try {
    const wager = await getWagerForOG(escrow);

    console.log("WAGER RESULT:", wager);

    return res.status(200).json(wager);
  } catch (e: any) {
    console.error("WAGER ERROR:", e);
    return res.status(500).json({
      error: "Failed to fetch wager",
      message: e.message,
    });
  }
}