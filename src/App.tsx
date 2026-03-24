import { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import { useWagers } from "./state/useWagers";
import { useWallet } from "./state/useWallet";

import Header from "./components/Header";
import ControlBar from "./components/ControlBar";
import CreateWager from "./components/CreateWager";
import Tile from "./components/Tile";
import BottomNav from "./components/BottomNav";
import WagerPage from "./app/WagerPage";

import "./ui/base.css";
import "./ui/buttons.css";
import "./ui/layout.css";
import "./ui/nav.css";
import "./ui/responsive.css";

export default function App() {
  /* =========================================
     ROUTING CONTEXT (🔥 KEY ADD)
  ========================================= */
  const location = useLocation();
  const isWagerPage = location.pathname.startsWith("/wager");

  /* =========================================
     UI STATE
  ========================================= */
  const [showCreate, setShowCreate] = useState(false);

  /* =========================================
     WALLET (IDENTITY)
  ========================================= */
  const { address, connect } = useWallet();

  /* =========================================
     DATA + INTENT HANDLER
  ========================================= */
  const { tiles, loading, onIntent } = useWagers();

  /* =========================================
     RENDER
  ========================================= */
  return (
    <div className="app-shell">

      {/* 🔴 HIDE HEADER ON WAGER PAGE */}
      {!isWagerPage && (
        <Header
          address={address}
          onConnect={connect}
        />
      )}

      <Routes>

        {/* 🟢 HOME FEED */}
        <Route
          path="/"
          element={
            <>
              <ControlBar
                onCreateClick={() =>
                  setShowCreate((prev) => !prev)
                }
              />

              {showCreate && <CreateWager />}

              {/* TILE FEED */}
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
                      key={tile.escrowAddress}   // 🔥 FIXED
                      tile={tile}
                      viewer={address}
                      onIntent={onIntent}
                    />
                  ))}
              </div>
            </>
          }
        />

        {/* 🔗 WAGER PAGE */}
        <Route
          path="/wager/:escrowAddress"
          element={<WagerPage />}
        />

      </Routes>

      {/* 🔴 HIDE NAV ON WAGER PAGE */}
      {!isWagerPage && <BottomNav />}

    </div>
  );
}