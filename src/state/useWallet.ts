import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { usePrivy, useWallets } from "@privy-io/react-auth";

export function useWallet() {
  const { login, logout, authenticated, ready: privyReady } = usePrivy();
  const { wallets } = useWallets();

  const [address, setAddress] = useState<string | undefined>();
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [ready, setReady] = useState(false); // 🔥 CRITICAL

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
     SYNC WALLET (AFTER LOGIN)
  ========================================= */
  useEffect(() => {
    const setup = async () => {
      // 🔥 WAIT FOR PRIVY TO INITIALIZE
      if (!privyReady) return;

      // 🔥 NOT LOGGED IN → CLEAR EVERYTHING
      if (!authenticated) {
        setAddress(undefined);
        setProvider(null);
        setReady(true);
        return;
      }

      // 🔥 LOGGED IN BUT NO WALLET YET
      if (wallets.length === 0) {
        setReady(true);
        return;
      }

      try {
        const wallet = wallets[0];
        const provider = await wallet.getEthersProvider();
        const signer = provider.getSigner();
        const addr = await signer.getAddress();

        setProvider(provider);
        setAddress(addr);

      } catch (err) {
        console.error("Wallet setup error:", err);
      }

      setReady(true); // 🔥 ALWAYS SET READY LAST
    };

    setup();
  }, [authenticated, wallets, privyReady]);

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

    } catch (err) {
      console.error("MetaMask error:", err);
    } finally {
      setLoading(false);
      setReady(true); // 🔥 ensure ready after manual connect
    }
  };

  /* =========================================
     DISCONNECT
  ========================================= */
  const disconnect = async () => {
    setAddress(undefined);
    setProvider(null);

    await logout();

  };

  return {
    address,
    provider,
    loading,
    authenticated,
    ready, // 🔥 NEW
    connectPrivy,
    connectMetaMask,
    disconnect,
  };
}