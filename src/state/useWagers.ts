import { useEffect, useRef, useState, useCallback } from "react";
import { ethers } from "ethers";

import type { UITile } from "../wagers/types";

import factoryJson from "../blockchain/abis/PreDEXFactory.json";
import escrowJson from "../blockchain/abis/PreDEXEscrow.json";

import { hydrateEscrows } from "./hydrateEscrows";
import { mapRawEscrowsToTiles } from "../wagers/normalize";
import { getWagerMetadata } from "../services/firebase/wagers";

import { useWallet } from "./useWallet";

/* =========================================================
   CONFIG
========================================================= */

const RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";
const FACTORY_ADDRESS = "0x84c5E2fD349e95E0395A8aeEDe16555EcE149958";

const factoryAbi = (factoryJson as any).abi;

/* =========================================================
   HOOK
========================================================= */

export function useWagers() {
  const [tiles, setTiles] = useState<UITile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { provider: walletProvider } = useWallet();

  const providerRef = useRef<ethers.JsonRpcProvider | null>(null);

  if (!providerRef.current) {
    providerRef.current = new ethers.JsonRpcProvider(RPC_URL);
  }

  const provider = providerRef.current;

  /* =========================================================
     LOAD
  ========================================================= */

  const load = useCallback(async () => {
    console.group("[useWagers] LOAD");

    try {
      setLoading(true);
      setError(null);

      const block = await provider.getBlockNumber();
      console.log("Connected → block", block);

      const factory = new ethers.Contract(
        FACTORY_ADDRESS,
        factoryAbi,
        provider
      );

      const addresses: string[] = await factory.getEscrows();

      if (!addresses.length) {
        setTiles([]);
        return;
      }

      const raw = await hydrateEscrows(addresses, provider);

      const mapped = await Promise.all(
        mapRawEscrowsToTiles(raw, []).map(async (tile) => {
          const meta = await getWagerMetadata(tile.escrowAddress);

          return {
            ...tile,
            statement: meta?.statement || "",
            createdAt: meta?.createdAt || 0,
          };
        })
      );

      const sorted = mapped.sort(
        (a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0)
      );

      setTiles(sorted);

    } catch (err: any) {
      console.error("[useWagers] ERROR", err);
      setError(err?.message ?? "Failed to load wagers");
    } finally {
      setLoading(false);
      console.groupEnd();
    }
  }, [provider]);

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!cancelled) await load();
    })();

    return () => {
      cancelled = true;
    };
  }, [load]);

  /* =========================================================
     GET SINGLE TILE
  ========================================================= */

  const getTileByAddress = useCallback(
    async (address: string): Promise<UITile | null> => {
      try {
        const clean = address.toLowerCase().trim();


        if (clean.startsWith("temp_")) {
          console.error("❌ Temp wagers are deprecated");
          return null;
        }
        /* =========================================
           ON-CHAIN FLOW
        ========================================= */

        const factory = new ethers.Contract(
          FACTORY_ADDRESS,
          factoryAbi,
          provider
        );

        const addresses: string[] = await factory.getEscrows();

        const match = addresses.find(
          (a) => a.toLowerCase() === clean
        );

        if (!match) return null;

        const rawAll = await hydrateEscrows(addresses, provider);

        const raw = rawAll.filter(
          (r: any) =>
            r.escrowAddress.toLowerCase() === match.toLowerCase()
        );

        if (!raw.length) return null;

        let tile = mapRawEscrowsToTiles(raw, [])[0];

        const meta = await getWagerMetadata(tile.escrowAddress);

        tile = {
          ...tile,
          escrowAddress: tile.escrowAddress.toLowerCase(),
          statement: meta?.statement || "",
          createdAt: meta?.createdAt || 0,
        };

        setTiles((prev) => {
          const exists = prev.some(
            (t) =>
              t.escrowAddress.toLowerCase() ===
              tile.escrowAddress.toLowerCase()
          );

          if (exists) return prev;

          return [tile, ...prev];
        });

        return tile;

      } catch (err) {
        console.error("[getTileByAddress] ERROR:", err);
        return null;
      }
    },
    [provider]
  );

  /* =========================================================
     JOIN WAGER
  ========================================================= */

  /* =========================================================
   JOIN WAGER
========================================================= */

  const joinWager = async (escrowAddress: string) => {
    console.group("[JOIN_WAGER]");
    console.log("👉 Incoming escrow:", escrowAddress);

    try {
      // 🔒 prevent double execution
      if ((window as any).__JOINING) {
        console.log("⛔ Already joining — skipping duplicate call");
        return;
      }
      (window as any).__JOINING = true;

      if (!walletProvider) {
        throw new Error("Wallet not connected");
      }

      const signer = await walletProvider.getSigner();
      const user = await signer.getAddress();

      console.log("👤 Active wallet:", user);


      // ❌ TEMP FLOW REMOVED — ALL WAGERS MUST BE REAL ESCROWS NOW
      if (escrowAddress.startsWith("temp_")) {
        throw new Error("Invalid wager: temp IDs are no longer supported");
      }
      /* =========================================
         NORMAL FLOW (EXISTING ESCROW)
      ========================================= */

      console.log("🔁 Joining existing escrow");

      const contract = new ethers.Contract(
        escrowAddress,
        escrowJson.abi,
        signer
      );

      const stake = await contract.stakeAmount();
      console.log("💵 Stake amount:", stake.toString());

      const tx = await contract.deposit({ value: stake });
      console.log("📤 TX:", tx.hash);

      await tx.wait();
      console.log("✅ Joined successfully");

      return { success: true };

    } catch (err: any) {
      console.error("❌ JOIN FAILED:", err);
      return { success: false, error: err?.message };
    } finally {
      (window as any).__JOINING = false;
      console.groupEnd();
    }
  };

  /* =========================================================
     INTENTS
  ========================================================= */

  const handleIntent = useCallback(async (intent: any) => {
    try {
      if (intent.type === "JOIN_WAGER") {
        const res = await joinWager(intent.escrowAddress);

        if (res?.success) {
          // 🔥 slight delay so wallet UI finishes cleanly
          setTimeout(() => {
            window.location.href = `/?highlight=${intent.escrowAddress}`;
          }, 800);
        }
      }

      if (intent.type === "RESOLVE_PROPOSE") {
        if (!walletProvider) throw new Error("Wallet not connected");

        const signer = await walletProvider.getSigner();

        const contract = new ethers.Contract(
          intent.escrowAddress,
          escrowJson.abi,
          signer
        );

        const tx = await contract.proposeWinner(intent.winner);
        await tx.wait();
      }

      if (intent.type === "RESOLVE_CLAIM") {
        if (!walletProvider) throw new Error("Wallet not connected");

        const signer = await walletProvider.getSigner();

        const contract = new ethers.Contract(
          intent.escrowAddress,
          escrowJson.abi,
          signer
        );

        const tx = await contract.finalize();
        await tx.wait();
      }

      setTimeout(load, 500);

    } catch (err) {
      console.error("[handleIntent] ERROR", err);
    }
  }, [walletProvider, load]);

  return {
    tiles,
    loading,
    error,
    refresh: load,
    onIntent: handleIntent,
    getTileByAddress,
  };
}