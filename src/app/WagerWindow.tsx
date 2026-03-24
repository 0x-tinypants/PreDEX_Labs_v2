import Tile from "../components/Tile";

type Props = {
  tile: any;
  viewer?: string;
  onIntent?: any;
  onConnect?: () => void;
};

export default function WagerWindow({
  tile,
  viewer,
  onIntent,
  onConnect,
}: Props) {
  const isParticipant =
    viewer &&
    (viewer.toLowerCase() === tile.creator.toLowerCase() ||
      tile.participants?.some(
        (p: string) => p.toLowerCase() === viewer.toLowerCase()
      ));

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
        {!isParticipant && (
          <div className="window-context">
            ⚠ You’ve been challenged
          </div>
        )}

        {/* TILE (🔥 NOW PRIMARY ACTION SURFACE) */}
        <Tile
          tile={tile}
          viewer={viewer}
          onIntent={onIntent}
          onConnect={onConnect}
          mode="focus"
        />

      </div>
    </div>
  );
}