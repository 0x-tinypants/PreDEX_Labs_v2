import { ref, get, set } from "firebase/database";
import { db } from "./config";

/* =========================================
   HELPERS
========================================= */
function normalizeAddress(address: string) {
  return address.toLowerCase();
}

/* =========================================
   GET METADATA (READ)
========================================= */
export async function getWagerMetadata(escrowAddress: string) {
  const key = normalizeAddress(escrowAddress);

  const snapshot = await get(ref(db, `wagers/${key}`));

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
  const key = normalizeAddress(escrowAddress);

  await set(ref(db, `wagers/${key}`), {
    ...data,
    createdAt: Date.now(),
  });
}

/* =========================================
   GET FULL TILE FOR DEEP LINK PAGE
========================================= */
export async function getWagerByAddress(escrowAddress: string) {
  const key = normalizeAddress(escrowAddress);

  const meta = await getWagerMetadata(key);

  if (!meta) return null;

  const stake = meta.amount ? parseFloat(meta.amount) : 0;
  const hasOpponent = !!meta.opponent;

  return {
    escrowAddress: key, // always normalized
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