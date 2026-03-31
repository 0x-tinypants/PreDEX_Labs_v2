// src/app/WagerWindow.tsx

import Tile from "../components/Tile";

type Props = {
  tile: any;
  viewer?: string;
  onIntent?: any;
  onConnect?: () => void;
  isJoinable?: boolean;
};

export default function WagerWindow({
  tile,
  viewer,
  onIntent,
  onConnect,
  isJoinable = false,
}: Props) {
  if (!tile) return null;

  const viewerAddress = viewer?.toLowerCase();

  const isCreator =
    viewerAddress &&
    tile.creator?.toLowerCase() === viewerAddress;

  const isParticipant =
    viewerAddress &&
    (
      isCreator ||
      tile.participants?.some(
        (p: string) => p.toLowerCase() === viewerAddress
      )
    );

const showJoinCTA = isJoinable;

  return (
    <div className="wager-window">

      {/* HEADER */}
      <div className="window-header">
        <span>PreDEX Wager</span>
        <div className="window-controls">
          <span>—</span>
          <span>□</span>
          <span>✕</span>
        </div>
      </div>

      {/* BODY */}
      <div className="window-body">

        {/* CONTEXT */}
        {!isParticipant && !showJoinCTA && (
          <div className="window-context">
            ⚠ You’ve been challenged
          </div>
        )}

        {showJoinCTA && (
          <div className="window-context">
            Join this wager
          </div>
        )}

        {/* TILE (PRIMARY SURFACE) */}
        <Tile
          tile={tile}
          viewer={viewer}
          onIntent={onIntent}
          onConnect={onConnect}
          mode="focus"
        />

        {/* JOIN CTA */}
        {showJoinCTA && (
          <div className="window-actions">
            <button
              className="btn primary"
              onClick={() =>
                onIntent?.({
                  type: "JOIN_WAGER",
                  escrowAddress: tile.escrowAddress,
                })
              }
            >
              Accept Wager
            </button>
          </div>
        )}

      </div>
    </div>
  );
}