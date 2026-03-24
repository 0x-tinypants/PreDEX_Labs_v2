import { ref, get } from "firebase/database";
import { db } from "../../services/firebase/config";

export async function getWagerForOG(escrowAddress: string) {
  const snapshot = await get(ref(db, `wagers/${escrowAddress}`));

  if (!snapshot.exists()) return null;

  const meta = snapshot.val();

  const stake = meta.amount ? parseFloat(meta.amount) : 0;
  const hasOpponent = !!meta.opponent;

  return {
    escrowAddress,
    statement: meta.statement || "",
    creator: meta.creator,
    opponent: meta.opponent || null,
    stake,
    pot: hasOpponent ? stake * 2 : stake,
    status: hasOpponent ? "LOCKED" : "OPEN",
  };
}