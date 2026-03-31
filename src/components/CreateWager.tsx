// src/components/CreateWager.tsx

import { useState } from "react";
import { ethers } from "ethers";
import { createEscrow } from "../services/contracts/factory";
import { createWagerMetadata } from "../services/firebase/wagers";

export default function CreateWager({ wallet }: any) {
  const { provider } = wallet;

  const [type, setType] = useState<"P2P" | "LINK">("P2P");
  const [statement, setStatement] = useState("");
  const [deadline, setDeadline] = useState("");
  const [opponent, setOpponent] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      if (!statement || !deadline || !amount) {
        alert("Please fill all required fields");
        return;
      }

      if (type === "P2P" && !opponent) {
        alert("Opponent required for P2P wager");
        return;
      }

      if (!provider) {
        alert("No wallet connected");
        return;
      }

      const deadlineTimestamp = Math.floor(
        new Date(deadline).getTime() / 1000
      );

      const secondsFromNow =
        deadlineTimestamp - Math.floor(Date.now() / 1000);

      if (secondsFromNow <= 0) {
        alert("Deadline must be in the future");
        return;
      }

      setLoading(true);

      const signer = await provider.getSigner();
      const creatorAddress = await signer.getAddress();

      /* =========================================
         🔥 UNIFIED ESCROW CREATION (P2P + LINK)
      ========================================= */

      const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

      const finalOpponent =
        type === "LINK" ? ZERO_ADDRESS : opponent;

      const { receipt } = await createEscrow(provider, {
        opponent: finalOpponent,
        stakeEth: amount,
        deadlineSecondsFromNow: secondsFromNow,
      });

      /* =========================================
         EXTRACT ESCROW ADDRESS
      ========================================= */
      let escrowAddress: string | null = null;

      const iface = new ethers.Interface([
        "event EscrowCreated(address indexed escrow, address indexed partyA, address indexed partyB, uint256 stakeAmount, uint256 fundingDeadline)",
      ]);

      for (const log of receipt.logs) {
        try {
          const parsed = iface.parseLog(log);
          if (!parsed) continue;

          const values = Object.values(parsed.args);

          for (const val of values) {
            if (
              typeof val === "string" &&
              val.startsWith("0x") &&
              val.length === 42
            ) {
              escrowAddress = val;
              break;
            }
          }

          if (escrowAddress) break;
        } catch {
          continue;
        }
      }

      if (!escrowAddress) {
        alert("Escrow created but address extraction failed");
        return;
      }

      /* =========================================
         FIREBASE WRITE (KEYED BY REAL ADDRESS)
      ========================================= */

      await createWagerMetadata(escrowAddress, {
        statement,
        creator: creatorAddress,
        opponent: type === "LINK" ? undefined : opponent,
        amount,
        type,
        status: type === "LINK" ? "awaiting_opponent" : "pending",
        createdAt: Date.now(),
      });

      /* =========================================
         LINK GENERATION (ONLY FOR LINK)
      ========================================= */

      if (type === "LINK") {
const link = `${window.location.origin}/?wager=${escrowAddress}`;

        console.log("🔗 SHARE LINK:", link);
        prompt("Share this link:", link);
      }

      /* =========================================
         RESET
      ========================================= */

      setStatement("");
      setDeadline("");
      setOpponent("");
      setAmount("");

      setTimeout(() => {
        window.location.reload();
      }, 800);

    } catch (err) {
      console.error("❌ Error creating wager:", err);
      alert("Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-wager-panel">
      <div className="cw-section">
        <p>Type</p>
        <div className="cw-row">
          <button
            className={`btn ${type === "P2P" ? "btn-active" : ""}`}
            onClick={() => setType("P2P")}
          >
            P2P
          </button>
          <button
            className={`btn ${type === "LINK" ? "btn-active" : ""}`}
            onClick={() => setType("LINK")}
          >
            LINK
          </button>
        </div>
      </div>

      <div className="cw-section">
        <p>Wager</p>
        <input
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          placeholder="I beat you this weekend..."
        />
      </div>

      <div className="cw-section">
        <p>Deadline</p>
        <input
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
      </div>

      <div className="cw-section">
        <p>Opponent</p>
        <input
          value={opponent}
          onChange={(e) => setOpponent(e.target.value)}
          placeholder={
            type === "LINK"
              ? "Generated via link"
              : "0x..."
          }
          disabled={type === "LINK"}
        />
      </div>

      <div className="cw-section">
        <p>Amount (ETH)</p>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.01"
        />
      </div>

      <button
        className="btn btn-create"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "CREATING..." : "CREATE WAGER"}
      </button>
    </div>
  );
}