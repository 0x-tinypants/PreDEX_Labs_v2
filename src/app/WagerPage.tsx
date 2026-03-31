import { useEffect, useMemo, useState } from "react";
import { useParams, useLocation } from "react-router-dom";

import { useWagers } from "../state/useWagers";
import { useWallet } from "../state/useWallet";

import type { UITile } from "../wagers/types";

import WagerWindow from "./WagerWindow";
import "./window.css";

const PENDING_WAGER_PATH_KEY = "predex_pending_wager_path";

export default function WagerPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  const { tiles, loading, onIntent, getTileByAddress } = useWagers();
  const { address, connectPrivy } = useWallet();

  const [fetchedTile, setFetchedTile] = useState<UITile | null>(null);
  const [fetching, setFetching] = useState(false);

  const escrowAddress = useMemo(() => {
    return id?.toLowerCase() ?? "";
  }, [id]);

  const localTile = useMemo(() => {
    if (!escrowAddress) return null;

    return (
      tiles.find(
        (t) => t.escrowAddress?.toLowerCase() === escrowAddress
      ) ?? null
    );
  }, [tiles, escrowAddress]);

  const finalTile = localTile || fetchedTile;

  useEffect(() => {
    if (!escrowAddress) return;

    setFetchedTile(null);
  }, [escrowAddress]);

  useEffect(() => {
    if (!escrowAddress) return;
    if (localTile) return;

    let active = true;

    async function fetchTile() {
      setFetching(true);

      try {
        const res = await getTileByAddress(escrowAddress);
        if (active) {
          setFetchedTile(res ?? null);
        }
      } catch (err) {
        console.error("Fetch wager failed:", err);
        if (active) {
          setFetchedTile(null);
        }
      } finally {
        if (active) {
          setFetching(false);
        }
      }
    }

    fetchTile();

    return () => {
      active = false;
    };
  }, [escrowAddress, localTile, getTileByAddress]);

  useEffect(() => {
    if (!escrowAddress) return;

    const fullPath = `${location.pathname}${location.search}${location.hash}`;
    sessionStorage.setItem(PENDING_WAGER_PATH_KEY, fullPath);
  }, [escrowAddress, location.pathname, location.search, location.hash]);

  useEffect(() => {
    if (!address) return;
    if (!escrowAddress) return;

    const savedPath = sessionStorage.getItem(PENDING_WAGER_PATH_KEY);
    const currentPath = `${location.pathname}${location.search}${location.hash}`;

    if (savedPath === currentPath) {
      sessionStorage.removeItem(PENDING_WAGER_PATH_KEY);
    }
  }, [address, escrowAddress, location.pathname, location.search, location.hash]);

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

  if (!id) {
    return (
      <div className="page-center">
        <div className="empty-state">Invalid wager link</div>
      </div>
    );
  }

  if ((loading || fetching) && !finalTile) {
    return (
      <div className="page-center">
        <div className="empty-state">Loading wager...</div>
      </div>
    );
  }

  if (!finalTile && !fetching) {
    return (
      <div className="page-center">
        <div className="empty-state">Wager not found</div>
      </div>
    );
  }

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