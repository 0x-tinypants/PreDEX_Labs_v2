import { useState, useEffect } from "react";
import { ethers } from "ethers";

import { Web3Auth } from "@web3auth/modal";
import { WEB3AUTH_NETWORK } from "@web3auth/base";

/* =========================================
   CONFIG
========================================= */
const clientId = "BNbBnIObbC4CnFsKD-ImRpQ1Mq1GqbqoCZM1C11wteK8-9uBWTjJk8n_lFe3TEEfNIrmpjNWGyEPsO0kyHqVRW8";

export function useWallet() {
  const [address, setAddress] = useState<string | undefined>();
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [walletType, setWalletType] = useState<"metamask" | "web3auth" | null>(null);
  const [loading, setLoading] = useState(false);
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);

  /* =========================================
     INIT WEB3AUTH
  ========================================= */
  useEffect(() => {
    const init = async () => {
      try {
        const web3authInstance = new Web3Auth({
          clientId,
          web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
        });


        await web3authInstance.init();

        setWeb3auth(web3authInstance);

        // ✅ restore session if exists
        if (web3authInstance.connected && web3authInstance.provider) {
          const provider = new ethers.BrowserProvider(web3authInstance.provider as any);
          const signer = await provider.getSigner();
          const address = await signer.getAddress();

          setProvider(provider);
          setAddress(address);
          setWalletType("web3auth");

          console.log("🔁 Web3Auth restored:", address);
        }
      } catch (err) {
        console.error("Web3Auth init error:", err);
      }
    };

    init();
  }, []);

  /* =========================================
     CONNECT METAMASK
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
      const address = await signer.getAddress();

      setProvider(provider);
      setAddress(address);
      setWalletType("metamask");

      localStorage.setItem("wallet_type", "metamask");

      console.log("✅ MetaMask connected:", address);
    } catch (err) {
      console.error("MetaMask error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
     CONNECT WEB3AUTH (GOOGLE, ETC)
  ========================================= */
  const connectWeb3Auth = async () => {
    setLoading(true);

    try {
      if (!web3auth) throw new Error("Web3Auth not initialized");

      const web3authProvider = await web3auth.connect();

      // 👉 ADD THIS EXACT LINE
      (window as any).web3authProvider = web3authProvider;

      const user = await web3auth.getUserInfo();
      console.log("Web3Auth User:", user);

      if (!web3authProvider) {
        throw new Error("No provider returned");
      }

      const provider = new ethers.BrowserProvider(web3authProvider as any);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      setProvider(provider);
      setAddress(address);
      setWalletType("web3auth");

      localStorage.setItem("wallet_type", "web3auth");

      console.log("✅ Web3Auth connected:", address);
    } catch (err) {
      console.error("Web3Auth error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
     AUTO RECONNECT (METAMASK ONLY)
  ========================================= */
  useEffect(() => {
    const reconnect = async () => {
      try {
        const type = localStorage.getItem("wallet_type");

        if (type !== "metamask") return;
        if (!(window as any).ethereum) return;

        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const accounts = await provider.listAccounts();

        if (!accounts.length) return;

        const signer = await provider.getSigner();
        const address = await signer.getAddress();

        setProvider(provider);
        setAddress(address);
        setWalletType("metamask");

        console.log("🔁 MetaMask restored:", address);
      } catch (err) {
        console.error("Reconnect error:", err);
      }
    };

    reconnect();
  }, []);

  /* =========================================
     ACCOUNT CHANGE LISTENER
  ========================================= */
  useEffect(() => {
    const eth = (window as any).ethereum;
    if (!eth) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (!accounts.length) {
        disconnect();
        return;
      }

      setAddress(accounts[0]);
      console.log("🔄 Account switched:", accounts[0]);
    };

    eth.on("accountsChanged", handleAccountsChanged);

    return () => {
      eth.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, []);

  /* =========================================
     DISCONNECT
  ========================================= */
  const disconnect = () => {
    setAddress(undefined);
    setProvider(null);
    setWalletType(null);
    localStorage.removeItem("wallet_type");

    console.log("❌ Wallet disconnected");
  };

  /* =========================================
     RETURN
  ========================================= */
  return {
    address,
    provider,
    walletType,
    loading,
    connectMetaMask,
    connectWeb3Auth,
    disconnect,
  };
}