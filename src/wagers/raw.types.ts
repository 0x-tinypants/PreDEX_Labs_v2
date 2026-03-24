/* =========================================================
   RAW CHAIN RECORD
   Direct chain/hydration shape before normalization
========================================================= */

export type RawEscrowRecord = {
  escrowAddress: string;
  type: string;

  creator?: string;
  participants?: string[];

  partyA?: string;
  partyB?: string;

  state: number;

  createdAt?: number;
  deadline?: number;

  stake?: string;
  line?: number;
  direction?: string;

  winner?: string;

  /* =============================
   PROPOSAL STATE (CHAIN)
============================= */
  proposedWinner?: string;
  proposer?: string;
  proposalTimestamp?: number;
};