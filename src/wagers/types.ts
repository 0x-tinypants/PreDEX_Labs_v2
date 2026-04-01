/* =========================================================
   TILE TYPES — PRODUCT LAYER (EXPANDED + CLEAN)
========================================================= */

import type { RawEscrowRecord } from "./raw.types";

/* =========================================================
   TILE TYPE
========================================================= */

export type TileType =
  | "P2P"
  | "OPEN"
  | "LINK"; // 🔥 NEW

/* =========================================================
   TILE STATUS (UI STATE MACHINE)
========================================================= */

export type TileStatus =
  | "open"                // waiting for opponent
  | "awaiting_opponent"  // 🔥 LINK specific (clearer intent)
  | "locked"             // both funded
  | "proposed"
  | "resolved";

/* =========================================================
   CORE UI TILE
========================================================= */

export type UITile = {
  /* -----------------------------------------
     Identity
  ----------------------------------------- */
  id: string;
  escrowAddress: string;
  type: TileType;
  statement?: string;

  /* -----------------------------------------
     Participants
  ----------------------------------------- */
  creator: string;
  participants: string[];

  /* -----------------------------------------
     State
  ----------------------------------------- */
  status: TileStatus;

  /* -----------------------------------------
     Timing
  ----------------------------------------- */
  createdAt?: number;
deadline: number | null;
  /* -----------------------------------------
     Resolution Layer
  ----------------------------------------- */
  proposedWinner?: string;
  proposer?: string;
  winner?: string;
  proposalTimestamp?: number;

  /* -----------------------------------------
     Financials
  ----------------------------------------- */
  stake?: number; // per side (ETH)
  pot?: number;   // total (ETH)

  /* -----------------------------------------
     LINK SUPPORT (🔥 NEW)
  ----------------------------------------- */
  isTemp?: boolean; // identifies temp Firebase wagers

  /* -----------------------------------------
     Debug / Raw
  ----------------------------------------- */
  raw?: RawEscrowRecord;
};