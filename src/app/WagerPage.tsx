// src/app/WagerPage.tsx

import { useEffect, useMemo, useState } from "react";

import { useWagers } from "../state/useWagers";
import { useWallet } from "../state/useWallet";

import type { UITile } from "../wagers/types";

import WagerWindow from "./WagerWindow";
import "./window.css";

export default function WagerPage({ wagerId }: { wagerId: string }) {
  const { tiles, loading, onIntent, getTileByAddress } = useWagers();
  const { address, connectPrivy } = useWallet();

  const [fetchedTile, setFetchedTile] = useState<UITile | null>(null);
  const [fetching, setFetching] = useState(false);

  /* =========================================
     NORMALIZE ADDRESS
  ========================================= */
  const escrowAddress = useMemo(() => {
    return wagerId ? wagerId.trim().toLowerCase() : "";
  }, [wagerId]);

  /* =========================================
     LOCAL MATCH
  ========================================= */
  const localTile = useMemo(() => {
    if (!escrowAddress) return null;

    return (
      tiles.find(
        (t) =>
          t.escrowAddress?.toLowerCase().trim() === escrowAddress
      ) ?? null
    );
  }, [tiles, escrowAddress]);

  /* =========================================
     FETCH FALLBACK
  ========================================= */
  useEffect(() => {
    if (!escrowAddress) return;
    if (localTile) return;

    let active = true;

    const run = async () => {
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
    };

    run();

    return () => {
      active = false;
    };
  }, [escrowAddress, localTile, getTileByAddress]);

  const finalTile = localTile || fetchedTile;

  /* =========================================
     LINK / JOIN LOGIC
  ========================================= */
  const ZERO =
    "0x0000000000000000000000000000000000000000";

  const realParticipants =
    finalTile?.participants?.filter(
      (p: string) => p && p.toLowerCase() !== ZERO
    ) ?? [];

  const isLinkWager =
    finalTile && realParticipants.length < 2;
  const isCreator =
    finalTile &&
    address &&
    finalTile.creator?.toLowerCase() === address.toLowerCase();

  const isJoinable = !!isLinkWager && !!address && !isCreator;

  console.log("DEBUG WAGER PAGE");
  console.log("address:", address);
  console.log("creator:", finalTile?.creator);
  console.log("participants:", finalTile?.participants);
  console.log("isLinkWager:", isLinkWager);
  console.log("isCreator:", isCreator);
  console.log("isJoinable:", isJoinable);

  /* =========================================
     STATES
  ========================================= */

  // invalid link
  if (!escrowAddress) {
    return (
      <div className="page-center">
        <div className="empty-state">Invalid wager link</div>
      </div>
    );
  }

  // loading
  if ((loading || fetching) && !finalTile) {
    return (
      <div className="page-center">
        <div className="empty-state">Loading wager...</div>
      </div>
    );
  }

  // not found
  if (!finalTile && !fetching) {
    return (
      <div className="page-center">
        <div className="empty-state">Wager not found</div>
      </div>
    );
  }

  // login gate
  if (!address) {
    return (
      <div className="wager-page-shell">
        <div className="wager-window">
          <div className="window-header">
            <span>PreDEX</span>
          </div>

          <div className="window-body">
            <div className="window-context">
              Join this wager
            </div>

            <div className="window-actions">
              <button
                className="btn primary"
                onClick={connectPrivy}
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
        isJoinable={isJoinable}
      />
    </div>
  );
}