import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { useWagers } from "../state/useWagers";
import { useWallet } from "../state/useWallet";

export default function WagerEntryPage() {
  const { id } = useParams<{ id?: string }>();

  const { tiles, onIntent } = useWagers();
  const { address, connectPrivy } = useWallet();

  const [tile, setTile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);

  const escrowAddress = useMemo(() => {
    if (!id) return "";
    return id.toLowerCase().trim();
  }, [id]);

  /* =========================================
     LOAD FROM GLOBAL STATE (NO FETCH)
  ========================================= */
  useEffect(() => {
  if (!escrowAddress) return;

  // wait until tiles are actually loaded
  if (!tiles || tiles.length === 0) {
    setLoading(true);
    return;
  }

  const found = tiles.find((t: any) => {
    const addr = (t.escrowAddress || t.address || "").toLowerCase();
    return addr === escrowAddress.toLowerCase();
  });

  if (found) {
    setTile(found);
  } else {
    setTile(null);
  }

  // loading is DONE once tiles are loaded
  setLoading(false);

}, [tiles, escrowAddress]);

  /* =========================================
     ACCEPT HANDLER
  ========================================= */
  async function handleAccept() {
    if (!tile) return;

    try {
      setAccepting(true);

      await onIntent({
        type: "ACCEPT",
        escrowAddress: tile.escrowAddress,
      });

      window.location.href = "/";
    } catch (err) {
      console.error(err);
    } finally {
      setAccepting(false);
    }
  }

  /* =========================================
     STATES
  ========================================= */

  if (!escrowAddress) {
    return <div className="page-center">Invalid link</div>;
  }

  if (loading) {
    return <div className="page-center">Loading wager...</div>;
  }

  if (!tile) {
    return <div className="page-center">Wager not found</div>;
  }

  /* =========================================
     UI
  ========================================= */

  return (
    <div className="entry-page">
      <div className="entry-card">
        <h2>You’ve been challenged ⚡</h2>

        <div className="entry-info">
          <p>
            <strong>Wager:</strong> {tile.statement || "No description"}
          </p>
          <p>
            <strong>Stake:</strong> {tile.stakeEth || "—"} ETH
          </p>
        </div>

        {!address && (
          <button className="btn primary" onClick={connectPrivy}>
            Continue with Google
          </button>
        )}

        {address && (
          <button
            className="btn primary"
            onClick={handleAccept}
            disabled={accepting}
          >
            {accepting ? "Accepting..." : "Accept Wager"}
          </button>
        )}
      </div>
    </div>
  );
}