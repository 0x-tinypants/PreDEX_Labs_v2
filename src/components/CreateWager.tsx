// src/components/CreateWager.tsx

import { useState } from "react";
import { ethers } from "ethers";
import factoryJson from "../blockchain/abis/PreDEXFactory.json";
import { createWagerMetadata } from "../services/firebase/wagers";

/* =========================================
   GLOBAL TYPE
========================================= */
declare global {
  interface Window {
    ethereum?: any;
  }
}

/* =========================================
   CONFIG
========================================= */
const FACTORY_ADDRESS = "0x3f2dFD882503048Fe3b57DA9A9C966B05263C6Ff";

export default function CreateWager() {
  /* =========================================
     STATE
  ========================================= */
  const [type, setType] = useState<"P2P" | "OPEN">("P2P");
  const [statement, setStatement] = useState("");
  const [deadline, setDeadline] = useState("");
  const [opponent, setOpponent] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  /* =========================================
     SUBMIT
  ========================================= */
  const handleSubmit = async () => {
    try {
      if (!window.ethereum) {
        alert("MetaMask not detected");
        return;
      }

      if (!statement || !deadline || !opponent || !amount) {
        alert("Please fill all fields");
        return;
      }

      const deadlineTimestamp = Math.floor(
        new Date(deadline).getTime() / 1000
      );

      setLoading(true);
      console.log("🚀 Creating wager...");

      /* =========================================
         CONNECT
      ========================================= */
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      /* =========================================
         CONTRACT
      ========================================= */
      const factory = new ethers.Contract(
        FACTORY_ADDRESS,
        factoryJson.abi,
        signer
      );

      /* =========================================
         CREATE ESCROW
      ========================================= */
      const tx = await factory.createEscrow(
        opponent,
        ethers.parseEther(amount),
        deadlineTimestamp,
        {
          value: ethers.parseEther(amount),
        }
      );

      console.log("⏳ Waiting for confirmation...");
      const receipt = await tx.wait();

      console.log("✅ TX CONFIRMED:", receipt.hash);

      /* =========================================
         🔥 EXTRACT ESCROW ADDRESS (CLEAN)
      ========================================= */

      let escrowAddress: string | null = null;

      for (const log of receipt.logs) {
        try {
          const parsed = factory.interface.parseLog(log);

          if (!parsed) continue;

          console.log("🧠 EVENT:", parsed.name);
          console.log("🧠 ARGS:", parsed.args);

          // 🔥 EXPECTED: factory emits escrow address
          // We grab FIRST valid address from args
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

        } catch (e) {
          // ignore unrelated logs
        }
      }

      if (!escrowAddress) {
        console.error("❌ Failed to extract escrow address");
        alert("Wager created but metadata failed");
        return;
      }

      console.log("🎯 Escrow Address:", escrowAddress);

      /* =========================================
         🔥 WRITE TO FIREBASE (CRITICAL)
      ========================================= */
      await createWagerMetadata(escrowAddress, {
        statement,
        creator: await signer.getAddress(),
        opponent,
        amount,
      });

      console.log("🔥 Firebase write complete");

      /* =========================================
         RESET FORM
      ========================================= */
      setStatement("");
      setDeadline("");
      setOpponent("");
      setAmount("");

      /* =========================================
         TEMP REFRESH (NEXT STEP WE REMOVE)
      ========================================= */
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

  /* =========================================
     UI
  ========================================= */
  return (
    <div className="create-wager-panel">

      {/* TYPE */}
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

      {/* STATEMENT */}
      <div className="cw-section">
        <p>Wager</p>
        <input
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          placeholder="I beat you this weekend..."
        />
      </div>

      {/* DEADLINE */}
      <div className="cw-section">
        <p>Deadline</p>
        <input
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
      </div>

      {/* OPPONENT */}
      <div className="cw-section">
        <p>Opponent</p>
        <input
          value={opponent}
          onChange={(e) => setOpponent(e.target.value)}
          placeholder="0x..."
        />
      </div>

      {/* AMOUNT */}
      <div className="cw-section">
        <p>Amount (ETH)</p>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.01"
        />
      </div>

      {/* SUBMIT */}
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