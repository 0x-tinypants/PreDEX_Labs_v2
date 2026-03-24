import { useState } from "react";
import type { UITile } from "../wagers/types";
import "./tile.css";

type Props = {
  tile: UITile;
  viewer?: string;
  onIntent?: (intent: any) => void;
  mode?: "feed" | "focus";
  onConnect?: () => void;
};

export default function Tile({
  tile,
  viewer,
  onIntent,
  onConnect,
  mode = "feed",
}: Props) {
  const {
    escrowAddress,
    type,
    creator,
    participants,
    status,
    deadline,
    proposedWinner,
    winner,
  } = tile;

  const isFocus = mode === "focus";

  /* =========================================
     HELPERS
  ========================================= */

  const short = (addr?: string) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "—";

  const formatEth = (value?: number) => {
    if (!value) return "—";
    return `${value.toFixed(3)} ETH`;
  };

  const opponent = participants?.find((p) => p !== creator);

  const isParticipant =
    !!viewer &&
    participants?.some(
      (p) => p.toLowerCase() === viewer.toLowerCase()
    );

  const isOpen = status === "open";
  const isLocked = status === "locked";
  const isProposed = status === "proposed";
  const isResolved = status === "resolved";

  const isExpired = deadline && Date.now() >= deadline;

  const [expanded, setExpanded] = useState(false);

  const inviteLink = `${window.location.origin}/wager/${tile.escrowAddress}`;


  /* =========================================
     PERMISSIONS
  ========================================= */

  const canAccept =
    !opponent ? viewer !== creator : viewer === opponent;

  const canPropose =
    isLocked && isExpired && isParticipant;

  const canClaim =
    isProposed &&
    !!viewer &&
    viewer.toLowerCase() === proposedWinner?.toLowerCase();

  /* =========================================
     INTENTS
  ========================================= */

  const emitIntent = (side: "yes" | "no") => {
    if (!onIntent) return;

    onIntent({
      type: "ACCEPT",
      escrowAddress,
      side,
      wagerType: type,
    });
  };

  const emitResolve = (winner: string) => {
    if (!onIntent) return;

    onIntent({
      type: "RESOLVE_PROPOSE",
      escrowAddress,
      winner,
    });
  };

  const emitClaim = () => {
    if (!onIntent) return;

    onIntent({
      type: "RESOLVE_CLAIM",
      escrowAddress,
    });
  };

  /* =========================================
     ACTION LABEL
  ========================================= */

  const getActionLabel = () => {
    if (isOpen) return "Choose Side";
    if (isLocked && !isExpired) return "Waiting for Result";
    if (isLocked && isExpired) return "Select Winner";
    if (isProposed) return "Finalizing";
    if (isResolved) return "Complete";
    return "";
  };

  /* =========================================
     ACTION RENDER (FEED MODE ONLY)
  ========================================= */

  const renderActions = () => {
    if (isOpen) {
      return (
        <div className="tile-actions">
          <button
            className="tile-btn yes"
            disabled={!canAccept}
            onClick={() => emitIntent("yes")}
          >
            YES
          </button>

          <button
            className="tile-btn no"
            disabled={!canAccept}
            onClick={() => emitIntent("no")}
          >
            NO
          </button>
        </div>
      );
    }

    if (isLocked && !isExpired) {
      return (
        <div className="tile-actions">
          <button className="tile-btn pending" disabled>
            Waiting...
          </button>
        </div>
      );
    }

    if (isLocked && isExpired) {
      return (
        <div className="tile-actions-wrapper">
          <div className="tile-actions">
            <button
              className="tile-btn yes"
              disabled={!canPropose}
              onClick={() => emitResolve(creator)}
            >
              YES
            </button>

            <button
              className="tile-btn no"
              disabled={!canPropose}
              onClick={() => emitResolve(opponent!)}
            >
              NO
            </button>
          </div>

          <div className="tile-action-ids">
            <span>{short(creator)}</span>
            <span>{short(opponent)}</span>
          </div>
        </div>
      );
    }

    if (isProposed) {
      return (
        <div className="tile-actions claim-state">
          <div className="tile-sub">
            Winner confirmed • You can claim
          </div>

          {canClaim ? (
            <button className="tile-btn claim" onClick={emitClaim}>
              CLAIM
            </button>
          ) : (
            <button className="tile-btn pending" disabled>
              Awaiting Claim
            </button>
          )}
        </div>
      );
    }

    if (isResolved) {
      return (
        <div className="tile-actions single">
          <button className="tile-btn result" disabled>
            🏆 {short(winner)}
          </button>
        </div>
      );
    }

    return null;
  };

  /* =========================================
     TIME
  ========================================= */

  const getTimeRemaining = () => {
    if (!deadline) return "—";

    const diff = deadline - Date.now();

    if (diff <= 0) return "Expired";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff / (1000 * 60)) % 60);

    return `${hours}h ${minutes}m`;
  };

  const statement = tile.statement || "";
  /* =========================================
     RENDER
  ========================================= */

  return (
    <div className="tile">

      {/* HEADER */}
      <div className="tile-row tile-header">
        <span className={`status ${status}`}>
          {status.toUpperCase()}
        </span>

        <span className="type">{type}</span>

        <span className="time">{getTimeRemaining()}</span>
      </div>

      {/* MAIN */}
      <div className="tile-main">
        <div className="matchup">
          {short(creator)} vs {short(opponent)}
        </div>

        <div className="statement">{statement}</div>
      </div>

      {/* 🔥 ACTION BLOCK */}
      <div className="tile-action-block">
        {isFocus ? (

          !viewer ? (
            <div
              className="focus-cta connect"
              onClick={onConnect}
            >
              Connect Wallet to Join
            </div>
          ) : !isParticipant ? (
            <div
              className="focus-cta accept"
              onClick={() =>
                onIntent?.({
                  type: "ACCEPT",
                  escrowAddress,
                })
              }
            >
              Accept Wager
            </div>
          ) : (
            <div className="focus-cta neutral">
              You're in this wager
            </div>
          )

        ) : (

          <>
            <div className="tile-action-label">
              {getActionLabel()}
            </div>

            {renderActions()}
          </>

        )}

      </div>

      {/* FOOTER */}
      <div className="tile-row tile-footer">
        <div className="meta">
          <span>By {short(creator)}</span>
          <span className="dot">•</span>
          <span>{formatEth(tile.stake)} stake</span>
          <span className="dot">•</span>
          <span>{formatEth(tile.pot)} pot</span>
        </div>

        <button
          className={`expand ${expanded ? "open" : ""}`}
          onClick={() => setExpanded((p) => !p)}
        >
          ▼
        </button>

        <button
          className="invite-icon"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(inviteLink);
              alert("Invite link copied ✅");
            } catch (err) {
              console.error("Copy failed:", err);
              alert("Copy failed — check console");
            }
          }}
        >
          🔗
        </button>
      </div>

      {expanded && (
        <div className="tile-expanded">

          {/* DESCRIPTION (FULL) */}
          {statement && (
            <div className="expanded-description">
              {statement}
            </div>
          )}

          {/* ROW 1 — ESCROW */}
          <div className="expanded-row">
            <div className="label">ESCROW</div>
            <a
              href={`https://sepolia.etherscan.io/address/${escrowAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="link"
            >
              {short(escrowAddress)} ↗
            </a>
          </div>

          {/* ROW 2 — CREATOR */}
          <div className="expanded-row">
            <div className="label">CREATOR</div>
            <span>{short(creator)}</span>
          </div>

          {/* ROW 3 — OPPONENT */}
          <div className="expanded-row">
            <div className="label">OPPONENT</div>
            <span>{short(opponent)}</span>
          </div>

          {/* ROW 4 — STATUS */}
          <div className="expanded-row">
            <div className="label">STATUS</div>
            <span>{status.toUpperCase()}</span>
          </div>

          {/* ROW 5 — STAKE */}
          <div className="expanded-row">
            <div className="label">STAKE</div>
            <span>{formatEth(tile.stake)}</span>
          </div>

          {/* ROW 6 — POT */}
          <div className="expanded-row">
            <div className="label">POT</div>
            <span>{formatEth(tile.pot)}</span>
          </div>

          {/* ROW 7 — DEADLINE */}
          <div className="expanded-row">
            <div className="label">DEADLINE</div>
            <span>{getTimeRemaining()}</span>
          </div>

          {/* ROW 8 — WINNER */}
          {winner && (
            <div className="expanded-row">
              <div className="label">WINNER</div>
              <span>🏆 {short(winner)}</span>
            </div>
          )}

        </div>
      )}
    </div>
  );
}