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
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div className="page-center">
        <div className="empty-state">Invalid wager link</div>
      </div>
    );
  }

  const escrowAddress = id.toLowerCase();

  /* =========================================
     STATE
  ========================================= */
  const { tiles, loading, onIntent, getTileByAddress } = useWagers();

  const {
    address,
    connectWeb3Auth,
    connectMetaMask,
  } = useWallet();

  const [fetchedTile, setFetchedTile] = useState<UITile | null>(null);
  const [fetching, setFetching] = useState(false);

  /* =========================================
     FIND LOCAL
  ========================================= */
  const localTile = tiles.find(
    (t) =>
      t.escrowAddress?.toLowerCase() === escrowAddress
  );

  const finalTile = localTile || fetchedTile;

  /* =========================================
     FETCH IF NEEDED
  ========================================= */
  useEffect(() => {
    if (!escrowAddress) return;
    if (localTile) return;

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
     RESET ON CHANGE
  ========================================= */
  useEffect(() => {
    setFetchedTile(null);
  }, [escrowAddress]);

  /* =========================================
     LOADING
  ========================================= */
  if (loading && !finalTile) {
    return (
      <div className="page-center">
        <div className="empty-state">Loading wager...</div>
      </div>
    );
  }

  /* =========================================
     NOT FOUND
  ========================================= */
  if (!finalTile && !fetching) {
    return (
      <div className="page-center">
        <div className="empty-state">Wager not found</div>
      </div>
    );
  }

  /* =========================================
     🔥 AUTH GATE (CORE FLOW)
  ========================================= */
  if (!address) {
    return (
      <div className="wager-page-shell">
        <div className="wager-window">

          <div className="window-header">
            <span>PreDEX</span>
          </div>

          <div className="window-body">

            <div className="window-context">
              You’ve been invited to a wager
            </div>

            <div className="window-actions">
              <button
                className="btn primary"
                onClick={connectWeb3Auth}
              >
                Continue with Web3
              </button>

              <button
                className="btn secondary"
                onClick={connectMetaMask}
              >
                Use MetaMask
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  }

  /* =========================================
     RENDER (INSIDE APP)
  ========================================= */
  return (
    <div className="wager-page-shell">
      <WagerWindow
        tile={finalTile}
        viewer={address}
        onIntent={onIntent}
        onConnect={connectMetaMask}
      />
    </div>
  );
}