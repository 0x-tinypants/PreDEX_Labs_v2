import { ref, get, set } from "firebase/database";
import { db } from "./config";

/* =========================================
   GET METADATA (READ)
========================================= */
export async function getWagerMetadata(escrowAddress: string) {
  const snapshot = await get(ref(db, `wagers/${escrowAddress}`));

  if (snapshot.exists()) {
    return snapshot.val();
  }

  return null;
}

/* =========================================
   CREATE METADATA (WRITE)
========================================= */
export async function createWagerMetadata(
  escrowAddress: string,
  data: {
    statement: string;
    creator: string;
    opponent?: string;
    amount?: string;
  }
) {
  await set(ref(db, `wagers/${escrowAddress}`), {
    ...data,
    createdAt: Date.now(),
  });
}


/* =========================================
   GET FULL TILE FOR DEEP LINK PAGE
========================================= */
export async function getWagerByAddress(escrowAddress: string) {
  const meta = await getWagerMetadata(escrowAddress);

  if (!meta) return null;

  const stake = meta.amount ? parseFloat(meta.amount) : 0;
  const hasOpponent = !!meta.opponent;

  return {
    escrowAddress,
    type: "P2P",
    creator: meta.creator,
    participants: [meta.creator, meta.opponent].filter(Boolean),
    status: hasOpponent ? "locked" : "open",
    deadline: Date.now() + 24 * 60 * 60 * 1000,
    proposedWinner: null,
    winner: null,
    statement: meta.statement || "",
    stake,
    pot: hasOpponent ? stake * 2 : stake,
  };
}