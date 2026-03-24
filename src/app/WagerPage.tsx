import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useWagers } from "../state/useWagers";
import { useWallet } from "../state/useWallet";

import type { UITile } from "../wagers/types";

import WagerWindow from "./WagerWindow";
import "./window.css";

export default function WagerPage() {
  /* =========================================
     PARAM (🔥 FIXED)
  ========================================= */
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div className="page-center">
        <div className="empty-state">Invalid wager link</div>
      </div>
    );
  }

  const escrowAddress = id; // now guaranteed string

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
  const localTile = tiles.find(
    (t) =>
      t.escrowAddress?.toLowerCase() === escrowAddress.toLowerCase()
  );

  const finalTile = localTile || fetchedTile;

  /* =========================================
     FETCH IF NOT FOUND (🔥 CLEANED)
  ========================================= */
  useEffect(() => {
    if (!escrowAddress) return;
    if (localTile) return; // already have it

    let active = true;

    async function fetchTile() {
      setFetching(true);

      try {
        const res = await getTileByAddress(escrowAddress);
        if (active && res) {
          setFetchedTile(res);
        }
      } catch (err) {
        console.error("Fetch wager failed:", err);
      } finally {
        if (active) setFetching(false);
      }
    }

    fetchTile();

    return () => {
      active = false;
    };
  }, [escrowAddress, localTile, getTileByAddress]);

  /* =========================================
     RESET ON ID CHANGE (🔥 IMPORTANT)
  ========================================= */
  useEffect(() => {
    setFetchedTile(null);
  }, [escrowAddress]);

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
        <div className="empty-state">
          {fetching ? "Fetching wager..." : "Wager not found"}
        </div>
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