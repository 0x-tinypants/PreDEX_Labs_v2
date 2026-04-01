import type { UITile } from "./types";
import type { RawEscrowRecord } from "./raw.types";
import { mapStateToStatus } from "./status";

/* =========================================================
   CONSTANTS
========================================================= */

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

/* =========================================================
   HELPERS
========================================================= */

/**
 * Normalize timestamp → always ms or null
 */
function normalizeTimestamp(ts?: number): number | null {
  if (ts == null) return null;
  return ts < 1e12 ? ts * 1000 : ts;
}

/**
 * Normalize address (safe lowercase)
 */
function normalizeAddress(addr?: string): string {
  return addr ? addr.toLowerCase() : "";
}

/**
 * Normalize participants:
 * - lowercase
 * - remove duplicates
 * - remove ZERO address
 */
function normalizeParticipants(list?: string[]): string[] {
  return Array.from(
    new Set(
      (list ?? [])
        .map((p) => normalizeAddress(p))
        .filter((p) => p && p !== ZERO_ADDRESS)
    )
  );
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

/**
 * Check valid non-zero address
 */
function isValidAddress(addr?: string): boolean {
  if (!addr) return false;
  return addr.toLowerCase() !== ZERO_ADDRESS;
}

/* =========================================================
   MAIN NORMALIZER
========================================================= */

export function normalizeToTile(record: RawEscrowRecord): UITile {
  /* =============================
     Identity + Participants
  ============================= */

  const creator = normalizeAddress(record.creator);
  const participants = normalizeParticipants(record.participants);

  // opponent = any non-creator participant
  const opponent =
    participants.find((p) => p !== creator) || null;

  /* =============================
     Timing
  ============================= */

  const deadline = normalizeTimestamp(record.deadline);
  const createdAt = normalizeTimestamp(record.createdAt) || 0;

  /* =============================
     Resolution Flags
  ============================= */

  const hasWinner = isValidAddress(record.winner);
  const hasProposedWinner = isValidAddress(record.proposedWinner);

  /* =============================
     Status Mapping
  ============================= */

  let status: "open" | "locked" | "proposed" | "resolved";

  if (hasWinner) {
    status = "resolved";
  } else if (hasProposedWinner) {
    status = "proposed";
  } else {
    const baseStatus = mapStateToStatus(record.state);

    if (baseStatus === "awaiting_opponent") {
      status = "open";
    } else {
      status = baseStatus as "open" | "locked" | "resolved";
    }
  }

  // 🔒 Guard: cannot be locked without opponent
  if (status === "locked" && !opponent) {
    status = "open";
  }

  /* =============================
     Resolution Fields
  ============================= */

  const proposedWinner = hasProposedWinner
    ? normalizeAddress(record.proposedWinner)
    : undefined;

  const winner = hasWinner
    ? normalizeAddress(record.winner)
    : undefined;

  /* =============================
     Financials
  ============================= */

  const stake = weiToEth(record.stake);
  const pot = stake * 2;

  /* =============================
     Debug (dev only)
  ============================= */

  if (process.env.NODE_ENV !== "production") {
  }

  /* =============================
     FINAL TILE
  ============================= */

  return {
    id: normalizeAddress(record.escrowAddress),
    escrowAddress: normalizeAddress(record.escrowAddress),

    type: record.type === "OPEN" ? "OPEN" : "P2P",

    creator,
    participants,

    status,

    createdAt,
    deadline,

    proposedWinner,
    winner,

    stake,
    pot,

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
      (t) =>
        t.escrowAddress.toLowerCase() ===
        record.escrowAddress.toLowerCase()
    );

    return {
      ...base,

      // preserve UI-only state
      proposalTimestamp: prev?.proposalTimestamp,
    };
  });
}