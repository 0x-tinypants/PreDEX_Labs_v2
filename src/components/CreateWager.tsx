// src/components/CreateWager.tsx

import { useState } from "react";
import { ethers } from "ethers";
import { createEscrow } from "../services/contracts/factory";
import { createWagerMetadata } from "../services/firebase/wagers";

export default function CreateWager({ wallet }: any) {
  const { provider } = wallet;

  const [type, setType] = useState<"P2P" | "OPEN">("P2P");
  const [statement, setStatement] = useState("");
  const [deadline, setDeadline] = useState("");
  const [opponent, setOpponent] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      if (!statement || !deadline || !opponent || !amount) {
        alert("Please fill all fields");
        return;
      }

      if (!provider) {
        alert("No wallet connected");
        return;
      }

      const deadlineTimestamp = Math.floor(
        new Date(deadline).getTime() / 1000
      );

      setLoading(true);
      console.log("🚀 Creating wager...");

      /* =========================================
         CREATE ESCROW
      ========================================= */
      const { receipt } = await createEscrow(provider, {
        opponent,
        stakeEth: amount,
        deadlineSecondsFromNow:
          deadlineTimestamp - Math.floor(Date.now() / 1000),
      });

      console.log("✅ TX CONFIRMED:", receipt.hash);

      const signer = await provider.getSigner();

      /* =========================================
         EXTRACT ESCROW ADDRESS
      ========================================= */
      let escrowAddress: string | null = null;

      for (const log of receipt.logs) {
        try {
          const iface = new ethers.Interface([
            "event EscrowCreated(address indexed escrow, address indexed partyA, address indexed partyB, uint256 stakeAmount, uint256 fundingDeadline)"
          ]);

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
        } catch {}
      }

      if (!escrowAddress) {
        console.error("❌ Failed to extract escrow address");
        alert("Wager created but metadata failed");
        return;
      }

      console.log("🎯 Escrow Address:", escrowAddress);

      /* =========================================
         FIREBASE WRITE
      ========================================= */
      await createWagerMetadata(escrowAddress, {
        statement,
        creator: await signer.getAddress(),
        opponent,
        amount,
      });

      console.log("🔥 Firebase write complete");

      /* RESET */
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
            className={`btn ${type === "OPEN" ? "btn-active" : ""}`}
            onClick={() => setType("OPEN")}
          >
            OPEN
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
          placeholder="0x..."
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