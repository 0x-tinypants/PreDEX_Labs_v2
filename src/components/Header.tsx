import { useEffect, useState } from "react";
import logo from "../assets/logo.png";

type Props = {
  address?: string;
  onConnectMetaMask: () => void;
  onConnectPrivy: () => void;
};

export default function Header({
  address,
  onConnectMetaMask,
  onConnectPrivy,
}: Props) {
  const short = (addr?: string) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

  const [theme, setTheme] = useState<"retro" | "dark">("retro");
  const [showWalletModal, setShowWalletModal] = useState(false);

  useEffect(() => {
    const saved = (localStorage.getItem("theme") as "retro" | "dark") || "retro";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  const toggleTheme = () => {
    const next = theme === "retro" ? "dark" : "retro";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <>
      <div className="header">
        <div className="header-left">
          <img src={logo} alt="logo" className="logo" />
          <span className="brand">PreDEX Labs</span>
        </div>

        <div className="header-center">
          <button className="btn" onClick={toggleTheme}>
            {theme === "retro" ? "🌙 Dark" : "🖥 Retro"}
          </button>
        </div>

        <div className="header-right">
          <button
            className="btn-connect"
            onClick={() => {
              if (address) return;
              setShowWalletModal(true);
            }}
          >
            {address ? `🟢 ${short(address)}` : "Connect"}
          </button>
        </div>
      </div>

      {showWalletModal && (
        <div className="modal-backdrop">
          <div className="modal-window">
            <div className="modal-title">Select Wallet</div>

            <div className="modal-body">
              <button
                className="btn"
                onClick={() => {
                  onConnectMetaMask();
                  setShowWalletModal(false);
                }}
              >
                🦊 MetaMask
              </button>

              <button
                className="btn"
                onClick={() => {
                  onConnectPrivy();
                  setShowWalletModal(false);
                }}
              >
                🌐 Google
              </button>
            </div>

            <div className="modal-footer">
              <button
                className="btn"
                onClick={() => setShowWalletModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}