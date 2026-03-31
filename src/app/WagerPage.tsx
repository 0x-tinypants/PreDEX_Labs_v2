import { useEffect, useMemo, useState } from "react";
import { useParams, useLocation } from "react-router-dom";

import { useWagers } from "../state/useWagers";
import { useWallet } from "../state/useWallet";

import type { UITile } from "../wagers/types";

import WagerWindow from "./WagerWindow";
import "./window.css";

const PENDING_WAGER_PATH_KEY = "predex_pending_wager_path";

export default function WagerPage() {
  const { id } = useParams<{ id?: string }>();
  const location = useLocation();

  const { tiles, loading, onIntent, getTileByAddress } = useWagers();
  const { address, connectPrivy } = useWallet();

  const [fetchedTile, setFetchedTile] = useState<UITile | null>(null);
  const [fetching, setFetching] = useState(false);

  /* =========================================
     NORMALIZED ADDRESS
  ========================================= */
  const escrowAddress = useMemo(() => {
    if (!id) return "";
    return id.trim().toLowerCase();
  }, [id]);

  /* =========================================
     LOCAL MATCH (STRICT NORMALIZATION)
  ========================================= */
  const localTile = useMemo(() => {
    if (!escrowAddress) return null;

    return (
      tiles.find(
        (t) =>
          t.escrowAddress &&
          t.escrowAddress.toLowerCase().trim() === escrowAddress
      ) ?? null
    );
  }, [tiles, escrowAddress]);

  const finalTile = localTile || fetchedTile;

  /* =========================================
     FETCH IF NOT FOUND LOCALLY
  ========================================= */
  useEffect(() => {
    if (!escrowAddress) return;
    if (localTile) return;

    let active = true;

    async function run() {
      setFetching(true);

      try {
        const res = await getTileByAddress(escrowAddress);
        if (active) setFetchedTile(res ?? null);
      } catch (err) {
        console.error("Fetch wager failed:", err);
        if (active) setFetchedTile(null);
      } finally {
        if (active) setFetching(false);
      }
    }

    run();

    return () => {
      active = false;
    };
  }, [escrowAddress, localTile, getTileByAddress]);

  /* =========================================
     PRESERVE PATH (LOGIN FLOW)
  ========================================= */
  useEffect(() => {
    if (!escrowAddress) return;

    const fullPath = `${location.pathname}${location.search}${location.hash}`;
    sessionStorage.setItem(PENDING_WAGER_PATH_KEY, fullPath);
  }, [escrowAddress, location]);

  useEffect(() => {
    if (!address || !escrowAddress) return;

    const saved = sessionStorage.getItem(PENDING_WAGER_PATH_KEY);
    const current = `${location.pathname}${location.search}${location.hash}`;

    if (saved === current) {
      sessionStorage.removeItem(PENDING_WAGER_PATH_KEY);
    }
  }, [address, escrowAddress, location]);

  /* =========================================
     CONNECT HANDLER
  ========================================= */
  async function handleConnectPrivy() {
    if (escrowAddress) {
      const fullPath = `${location.pathname}${location.search}${location.hash}`;
      sessionStorage.setItem(PENDING_WAGER_PATH_KEY, fullPath);
    }

    try {
      await connectPrivy();
    } catch (err) {
      console.error("Privy connect failed:", err);
    }
  }

  /* =========================================
     STATES
  ========================================= */

  // Invalid link
  if (!escrowAddress) {
    return (
      <div className="page-center">
        <div className="empty-state">Invalid wager link</div>
      </div>
    );
  }

  // Loading (block early "not found")
  if ((loading || fetching) && !finalTile) {
    return (
      <div className="page-center">
        <div className="empty-state">Loading wager...</div>
      </div>
    );
  }

  // Not found (ONLY after tiles are loaded)
  if (!finalTile && !fetching && tiles.length > 0) {
    return (
      <div className="page-center">
        <div className="empty-state">Wager not found</div>
      </div>
    );
  }

  // Not connected
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
                onClick={handleConnectPrivy}
              >
                Continue with Google
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================
     SUCCESS
  ========================================= */
  return (
    <div className="wager-page-shell">
      <WagerWindow
        tile={finalTile}
        viewer={address}
        onIntent={onIntent}
      />
    </div>
  );
}