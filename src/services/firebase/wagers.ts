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