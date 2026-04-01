import { useState, useEffect } from "react";

import { useWagers } from "./state/useWagers";
import { useWallet } from "./state/useWallet";

import Header from "./components/Header";
import ControlBar from "./components/ControlBar";
import CreateWager from "./components/CreateWager";
import Tile from "./components/Tile";
import BottomNav from "./components/BottomNav";
import WagerPage from "./app/WagerPage";
import LoginGate from "./components/LoginGate";

import "./ui/tokens.css";
import "./ui/themes/retro.css";
import "./ui/themes/dark.css";

import "./ui/base.css";
import "./ui/buttons.css";
import "./ui/layout.css";
import "./ui/nav.css";

export default function App() {
  /* =========================================
     THEME INIT
  ========================================= */
  useEffect(() => {
    const saved =
      (localStorage.getItem("theme") as "retro" | "dark") || "retro";

    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  /* =========================================
     ROUTING (LINK FLOW)
  ========================================= */
  const [wagerId, setWagerId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("wager");

    if (id) {
      setWagerId(id);
    }
  }, []);

  const isWagerFlow = !!wagerId;

  /* =========================================
     UI STATE
  ========================================= */
  const [showCreate, setShowCreate] = useState(false);

  /* =========================================
     WALLET
  ========================================= */
  const wallet = useWallet();
  const {
    address,
    authenticated,
    ready,
    connectMetaMask,
    connectPrivy,
  } = wallet;

  /* =========================================
   AUTO FUND ON LOGIN (ONE-TIME PER SESSION)
========================================= */
  const [funded, setFunded] = useState(false);

  useEffect(() => {
    if (!authenticated || !address || funded) return;

    const run = async () => {
      try {
        await fetch("/api/fund-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ address }),
        });

        setFunded(true);
      } catch (err) {
        console.error("Funding failed", err);
      }
    };

    run();
  }, [authenticated, address, funded]);

  /* =========================================
     DATA
  ========================================= */
  const { tiles, loading, onIntent } = useWagers(wallet.provider);

  /* =========================================
     HARD BLOCK (WAIT FOR WALLET INIT)
  ========================================= */
  if (!ready) {
    return (
      <div className="app-root">
        <div className="app-shell">
          <div className="centered-auth">
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================
     HOME VIEW
  ========================================= */
  const Home = (
    <>
      <ControlBar
        onCreateClick={() =>
          setShowCreate((prev) => !prev)
        }
      />

      {showCreate && <CreateWager wallet={wallet} />}

      <div className="tile-feed">
        {loading && <div>Loading...</div>}

        {!loading && tiles.length === 0 && (
          <div className="empty-state">
            No wagers found
          </div>
        )}

        {!loading &&
          tiles.map((tile) => (
            <Tile
              key={tile.escrowAddress}
              tile={tile}
              viewer={address}
              onIntent={onIntent}
            />
          ))}
      </div>
    </>
  );

  /* =========================================
     RENDER
  ========================================= */
  return (
    <div className="app-root">
      <div className="app-shell">

        {/* HEADER (LOGIN BUTTONS LIVE HERE) */}
        <Header
          address={address}
          onConnectMetaMask={connectMetaMask}
          onConnectPrivy={connectPrivy}
        />

        {/* 🔥 CORRECT WAGER FLOW */}
        {isWagerFlow ? (
          !(authenticated && address) ? (
            <LoginGate
              onGoogle={connectPrivy}
              onMetaMask={connectMetaMask}
            />
          ) : (
            <WagerPage wagerId={wagerId!} />
          )
        ) : (
          Home
        )}

        {!isWagerFlow && <BottomNav />}
      </div>
    </div>
  );
}