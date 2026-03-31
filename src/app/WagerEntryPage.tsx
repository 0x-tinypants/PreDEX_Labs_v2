import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { useWagers } from "../state/useWagers";
import { useWallet } from "../state/useWallet";

export default function WagerEntryPage() {
  const { id } = useParams<{ id?: string }>();

  const { getTileByAddress, onIntent } = useWagers();
  const { address, connectPrivy } = useWallet();

  const [tile, setTile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);

  const escrowAddress = useMemo(() => {
    if (!id) return "";
    return id.toLowerCase().trim();
  }, [id]);

  /* =========================================
     LOAD WAGER
  ========================================= */
  useEffect(() => {
    if (!escrowAddress) return;

    async function load() {
      setLoading(true);
      const t = await getTileByAddress(escrowAddress);
      setTile(t);
      setLoading(false);
    }

    load();
  }, [escrowAddress, getTileByAddress]);

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

      // redirect to app after accept
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
          <p><strong>Wager:</strong> {tile.statement || "No description"}</p>
          <p><strong>Stake:</strong> {tile.stakeEth || "—"} ETH</p>
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