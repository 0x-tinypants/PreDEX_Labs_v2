import Tile from "./Tile";
import { useWagers } from "../state/useWagers";

export default function TileFeed() {
  const { tiles } = useWagers();   // 👈 THIS IS THE KEY

  return (
    <div className="tile-feed">
      {tiles.map((tile) => (
        <Tile key={tile.escrowAddress} tile={tile} />
      ))}
    </div>
  );
}