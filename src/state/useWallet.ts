import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useNavigate } from "react-router-dom";

const PENDING_WAGER_PATH_KEY = "predex_pending_wager_path";

export function useWallet() {
  const { login, logout, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const navigate = useNavigate();

  const [address, setAddress] = useState<string | undefined>();
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  /* =========================================
     CONNECT (GOOGLE)
  ========================================= */
  const connectPrivy = async () => {
    if (loading) return;

    setLoading(true);

    try {
      await login({
        loginMethods: ["google"],
      });
    } catch (err) {
      console.error("Privy login error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
     SYNC WALLET (AFTER LOGIN ONLY)
  ========================================= */
  useEffect(() => {
    const setup = async () => {
      if (!authenticated || wallets.length === 0) return;

      const wallet = wallets[0];
      const provider = await wallet.getEthersProvider();
      const signer = provider.getSigner();
      const addr = await signer.getAddress();

      setProvider(provider);
      setAddress(addr);

      console.log("✅ wallet ready:", addr);

      /* =========================================
         🔥 REDIRECT BACK TO WAGER IF NEEDED
      ========================================= */
      const pendingPath = sessionStorage.getItem(PENDING_WAGER_PATH_KEY);

      if (pendingPath) {
        console.log("🔁 restoring pending wager path:", pendingPath);

        sessionStorage.removeItem(PENDING_WAGER_PATH_KEY);

        // IMPORTANT: replace so history is clean
        navigate(pendingPath, { replace: true });
      }
    };

    setup();
  }, [authenticated, wallets, navigate]);

  /* =========================================
     METAMASK (OPTIONAL)
  ========================================= */
  const connectMetaMask = async () => {
    setLoading(true);

    try {
      if (!(window as any).ethereum) {
        throw new Error("MetaMask not installed");
      }

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      await provider.send("eth_requestAccounts", []);

      const signer = await provider.getSigner();
      const addr = await signer.getAddress();

      setProvider(provider);
      setAddress(addr);

      console.log("✅ MetaMask connected:", addr);
    } catch (err) {
      console.error("MetaMask error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
     DISCONNECT
  ========================================= */
  const disconnect = async () => {
    setAddress(undefined);
    setProvider(null);

    await logout();

    console.log("❌ Wallet disconnected");
  };

  return {
    address,
    provider,
    loading,
    connectPrivy,
    connectMetaMask,
    disconnect,
  };
}