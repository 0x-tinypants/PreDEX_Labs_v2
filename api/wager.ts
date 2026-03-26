import { getWagerForOG } from "../src/lib/server/wagers";

export default async function handler(req: any, res: any) {
  const escrow = req.query.escrow;

  if (!escrow) {
    return res.status(400).json({ error: "Missing escrow" });
  }

  try {
    const wager = await getWagerForOG(escrow);
    return res.status(200).json(wager);
  } catch (e) {
    return res.status(500).json({ error: "Failed to fetch wager" });
  }
}