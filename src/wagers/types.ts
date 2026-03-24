/* =========================================================
   TILE TYPES — PRODUCT LAYER (LEAN)
========================================================= */

import type { RawEscrowRecord } from "./raw.types";

/* =========================================================
   TILE TYPE
========================================================= */

export type TileType = "P2P" | "OPEN";

/* =========================================================
   TILE STATUS (UI STATE MACHINE)
========================================================= */

export type TileStatus =
   | "open"
   | "locked"
   | "proposed"
   | "resolved"

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
   deadline?: number;

   /* -----------------------------------------
      Resolution Layer (forward-compatible)
   ----------------------------------------- */
   proposedWinner?: string;
   proposer?: string;
   winner?: string;
   proposalTimestamp?: number;
   /* -----------------------------------------
      Optional Metrics
   ----------------------------------------- */
stake?: number; // per side (in ETH)
pot?: number;   // total (in ETH)
   /* -----------------------------------------
      Debug
   ----------------------------------------- */
   raw?: RawEscrowRecord;
};