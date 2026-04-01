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

  const short = (addr?: string) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "—";

  const formatEth = (value?: number) => {
    if (!value) return "—";
    return `${value.toFixed(3)} ETH`;
  };

  const opponent = participants?.find(
    (p) => p.toLowerCase() !== creator.toLowerCase()
  );

  const isLinkMode = !opponent;

  const isParticipant =
    !!viewer &&
    participants?.some(
      (p) => p.toLowerCase() === viewer.toLowerCase()
    );

  const isOpen = status === "open";
  const isLocked = status === "locked";
  const isProposed = status === "proposed";
  const isResolved = status === "resolved";

  const isExpired = !!deadline && Date.now() >= deadline;

  const [expanded, setExpanded] = useState(false);

  const inviteLink = `${window.location.origin}/api/share/${tile.escrowAddress}`;

  const canAccept =
    isOpen &&
    !!viewer &&
    (
      isLinkMode
        ? viewer.toLowerCase() !== creator.toLowerCase()
        : viewer.toLowerCase() === opponent?.toLowerCase()
    );

  const canPropose =
    isLocked && isExpired && isParticipant;

  const canClaim =
    isProposed &&
    !!viewer &&
    viewer.toLowerCase() === proposedWinner?.toLowerCase();

  const emitJoin = () => {
    if (!onIntent) return;

    onIntent({
      type: "JOIN_WAGER",
      escrowAddress,
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

  const getActionLabel = () => {
    if (isOpen) return "Accpect or Decline";
    if (isLocked && !isExpired) return "Event Pending";
    if (isLocked && isExpired && opponent) return "Select Winner";
    if (isProposed) return "Awaiting Claim";
    if (isResolved) return "Complete";
    return "";
  };

  const renderActions = () => {
    if (isOpen) {
      return (
        <div className="tile-actions">
          <button
            className="tile-btn yes"
            disabled={!canAccept}
            onClick={emitJoin}
          >
            YES
          </button>

          <button
            className="tile-btn no"
            disabled={!canAccept}
            onClick={emitJoin}
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
            Waiting for Event
          </button>
        </div>
      );
    }

    if (isLocked && isExpired && opponent) {
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
              onClick={() => emitResolve(opponent)}
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
            Winner proposed • Awaiting claim
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

  const getTimeRemaining = () => {
    if (!deadline) return "—";

    const diff = deadline - Date.now();

    if (diff <= 0) {
      if (opponent) return "Event Started";
      return "Expired";
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff / (1000 * 60)) % 60);

    return `${hours}h ${minutes}m`;
  };

  const statement = tile.statement || "";

  return (
    <div className="tile">
      <div className="tile-row tile-header">
        <span className={`status ${status}`}>
          {(() => {
            if (isOpen) return "OPEN";
            if (isLocked && !isExpired) return "LOCKED";
            if (isLocked && isExpired) return "LIVE";
            if (isProposed) return "FINALIZING";
            if (isResolved) return "COMPLETE";
            return status.toUpperCase();
          })()}
        </span>

        <span className="type">{type}</span>

        <span className="time">
          {(() => {
            if (!deadline) return "—";

            if (isExpired) {
              return opponent ? "Event Started" : "Expired";
            }

            const diff = deadline - Date.now();
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff / (1000 * 60)) % 60);

            return `${hours}h ${minutes}m`;
          })()}
        </span>
      </div>

      <div className="tile-main">
        <div className="matchup">
          {short(creator)} vs {opponent ? short(opponent) : "Open"}
        </div>

        <div className="statement">{statement}</div>
      </div>

      <div className="tile-action-block">
        {isFocus ? (
          !viewer ? (
            <div
              className="focus-cta connect"
              onClick={onConnect}
            >
              Connect Wallet to Join
            </div>
          ) : !isParticipant && canAccept ? (
            <div
              className="focus-cta accept"
              onClick={emitJoin}
            >
              Accept Wager
            </div>
          ) : !isParticipant ? (
            <div className="focus-cta neutral">
              Not eligible to accept
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
          {statement && (
            <div className="expanded-description">
              {statement}
            </div>
          )}

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

          <div className="expanded-row">
            <div className="label">CREATOR</div>
            <span>{short(creator)}</span>
          </div>

          <div className="expanded-row">
            <div className="label">OPPONENT</div>
            <span>{short(opponent)}</span>
          </div>

          <div className="expanded-row">
            <div className="label">STATUS</div>
            <span>{status.toUpperCase()}</span>
          </div>

          <div className="expanded-row">
            <div className="label">STAKE</div>
            <span>{formatEth(tile.stake)}</span>
          </div>

          <div className="expanded-row">
            <div className="label">POT</div>
            <span>{formatEth(tile.pot)}</span>
          </div>

          <div className="expanded-row">
            <div className="label">DEADLINE</div>
            <span>{getTimeRemaining()}</span>
          </div>

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