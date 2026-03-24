import type { UITile } from "./types";
import type { RawEscrowRecord } from "./raw.types";
import { mapStateToStatus } from "./status";

/* =========================================================
   HELPERS
========================================================= */

function normalizeTimestamp(ts?: number): number | undefined {
   if (ts == null) return undefined;
   return ts < 1e12 ? ts * 1000 : ts;
}

/**
 * Convert wei → ETH (safe for UI)
 */
function weiToEth(value?: string | bigint | number): number {
   if (value == null) return 0;

   try {
      const numeric =
         typeof value === "string"
            ? Number(value)
            : Number(value);

      return numeric / 1e18;
   } catch {
      return 0;
   }
}

/* =========================================================
   MAIN NORMALIZER
========================================================= */

export function normalizeToTile(record: RawEscrowRecord): UITile {
   /* =============================
      Identity + Participants
   ============================= */

   const participants = record.participants ?? [];
   const creator = record.creator ?? "";

   /* =============================
      State
   ============================= */

   const status = mapStateToStatus(record.state);

   /* =============================
      Timing
   ============================= */

   const deadline = normalizeTimestamp(record.deadline);
   const createdAt = normalizeTimestamp(record.createdAt);

   /* =============================
      Resolution Logic (CRITICAL)
   ============================= */

   const proposedWinner =
      status === "proposed" ? record.proposedWinner : undefined;

   const finalWinner =
      status === "resolved"
         ? record.winner ?? record.proposedWinner
         : undefined;

   /* =============================
      Financials
   ============================= */

   const stakeEth = weiToEth(record.stake);
   const potEth = stakeEth * 2;

   /* =============================
      Debug (dev only)
   ============================= */

   if (process.env.NODE_ENV !== "production") {
      console.log("🧠 NORMALIZED TILE", {
         escrow: record.escrowAddress,
         state: record.state,
         status,
         stakeEth,
         potEth,
         winner: record.winner,
         proposedWinner,
         finalWinner,
      });
   }

   /* =============================
      FINAL TILE
   ============================= */

   return {
      /* Identity */
      id: record.escrowAddress,
      escrowAddress: record.escrowAddress,
      type: record.type === "OPEN" ? "OPEN" : "P2P",

      /* Participants */
      creator,
      participants,

      /* State */
      status,

      /* Timing */
      createdAt,
      deadline,

      /* Resolution */
      proposedWinner,
      winner: finalWinner,

      /* Financials */
      stake: stakeEth,
      pot: potEth,

      /* Debug */
      raw: record,
   };
}

/* =========================================================
   ARRAY NORMALIZER
========================================================= */

export function mapRawEscrowsToTiles(
   records: RawEscrowRecord[],
   prevTiles: UITile[] = []
): UITile[] {
   return records.map((record) => {
      const base = normalizeToTile(record);

      const prev = prevTiles.find(
         (t) => t.escrowAddress === record.escrowAddress
      );

      return {
         ...base,

         /* Preserve transient UI state */
         proposalTimestamp: prev?.proposalTimestamp,
      };
   });
}