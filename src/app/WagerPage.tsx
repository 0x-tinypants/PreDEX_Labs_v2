import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useWagers } from "../state/useWagers";
import { useWallet } from "../state/useWallet";

import type { UITile } from "../wagers/types";

import WagerWindow from "./WagerWindow";
import "./window.css";

export default function WagerPage() {
  /* =========================================
     PARAM
  ========================================= */
  const { escrowAddress } = useParams<{ escrowAddress: string }>();

  /* =========================================
     STATE
  ========================================= */
  const { tiles, loading, onIntent, getTileByAddress } = useWagers();
  const { address, connect } = useWallet();

  const [fetchedTile, setFetchedTile] = useState<UITile | null>(null);
  const [fetching, setFetching] = useState(false);

  /* =========================================
     GUARD
  ========================================= */
  if (!escrowAddress) {
    return (
      <div className="page-center">
        <div className="empty-state">Invalid wager link</div>
      </div>
    );
  }

  /* =========================================
     FIND IN LOCAL STATE
  ========================================= */
  const tile = tiles.find(
    (t) =>
      t.escrowAddress?.toLowerCase() === escrowAddress.toLowerCase()
  );

  const finalTile = tile || fetchedTile;

  /* =========================================
     FETCH IF NOT FOUND (🔥 KEY)
  ========================================= */
  useEffect(() => {
    if (!tile && escrowAddress && !fetching) {
      setFetching(true);

      getTileByAddress(escrowAddress)
        .then((res) => {
          if (res) setFetchedTile(res);
        })
        .finally(() => setFetching(false));
    }
  }, [tile, escrowAddress, fetching, getTileByAddress]);

  /* =========================================
     LOADING STATE
  ========================================= */
  if (loading && !finalTile) {
    return (
      <div className="page-center">
        <div className="empty-state">Loading wager...</div>
      </div>
    );
  }

  /* =========================================
     FETCHING STATE (DEEP LINK)
  ========================================= */
  if (!finalTile) {
    return (
      <div className="page-center">
        <div className="empty-state">Fetching wager...</div>
      </div>
    );
  }

  /* =========================================
     RENDER
  ========================================= */
  return (
    <div className="wager-page-shell">
      <WagerWindow
        tile={finalTile}
        viewer={address}
        onIntent={onIntent}
        onConnect={connect}
      />
    </div>
  );
}