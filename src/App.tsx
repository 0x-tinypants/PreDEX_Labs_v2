import { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import { useWagers } from "./state/useWagers";
import { useWallet } from "./state/useWallet";

import Header from "./components/Header";
import ControlBar from "./components/ControlBar";
import CreateWager from "./components/CreateWager";
import Tile from "./components/Tile";
import BottomNav from "./components/BottomNav";
import WagerPage from "./app/WagerPage";

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
     ROUTING CONTEXT
  ========================================= */
  const location = useLocation();
  const isWagerPage = location.pathname.startsWith("/wager");

  /* =========================================
     UI STATE
  ========================================= */
  const [showCreate, setShowCreate] = useState(false);

  /* =========================================
     WALLET
  ========================================= */
  const wallet = useWallet();
  const { address, connectMetaMask, connectPrivy } = wallet;

  /* =========================================
     DATA
  ========================================= */
  const { tiles, loading, onIntent } = useWagers();

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

        {!isWagerPage && (
          <Header
            address={address}
            onConnectMetaMask={connectMetaMask}
            onConnectPrivy={connectPrivy}
          />
        )}

        <Routes>
          <Route path="/" element={Home} />
          <Route path="/wager/:id" element={<WagerPage />} />

          {/* 🔥 SPA SAFETY NET (prevents Vercel 404 issues) */}
          <Route path="*" element={<WagerPage />} />
        </Routes>

        {!isWagerPage && <BottomNav />}
      </div>
    </div>
  );
}