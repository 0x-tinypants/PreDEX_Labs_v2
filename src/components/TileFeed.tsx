import { useEffect, useState } from "react";
import Tile from "./Tile";
import { useWagers } from "../state/useWagers";
import { useWallet } from "../state/useWallet";

export default function TileFeed() {
  const { provider } = useWallet();

  const { tiles } = useWagers(provider);

  // derive viewer address (safe)
  const [viewer, setViewer] = useState<string | undefined>();

  useEffect(() => {
    const loadViewer = async () => {
      try {
        if (!provider) return;

        const signer = await provider.getSigner();
        const address = await signer.getAddress();

        setViewer(address.toLowerCase());
      } catch (err) {
        console.error("Failed to get viewer address", err);
      }
    };

    loadViewer();
  }, [provider]);

  return (
    <div className="tile-feed">
      {tiles.map((tile) => (
        <Tile
          key={tile.escrowAddress}
          tile={tile}
          viewer={viewer}
        />
      ))}
    </div>
  );
}