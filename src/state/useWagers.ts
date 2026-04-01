import { useEffect, useRef, useState, useCallback } from "react";
import { ethers } from "ethers";

import type { UITile } from "../wagers/types";

import factoryJson from "../blockchain/abis/PreDEXFactory.json";
import escrowJson from "../blockchain/abis/PreDEXEscrow.json";

import { hydrateEscrows } from "./hydrateEscrows";
import { mapRawEscrowsToTiles } from "../wagers/normalize";
import { getWagerMetadata } from "../services/firebase/wagers";

/* =========================================================
   CONFIG
========================================================= */

const RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";
const FACTORY_ADDRESS = "0x84c5E2fD349e95E0395A8aeEDe16555EcE149958";

const factoryAbi = (factoryJson as any).abi;

/* =========================================================
   HOOK
========================================================= */

export function useWagers(walletProvider: any) {
  const [tiles, setTiles] = useState<UITile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      // 🔁 hydrate raw escrow data from chain
      const raw = await hydrateEscrows(addresses, provider);

      // 🔁 normalize ONCE (source of truth)
      const baseTiles = mapRawEscrowsToTiles(raw, []);

      // 🔁 enrich with firebase metadata ONLY
      const enriched = await Promise.all(
        baseTiles.map(async (tile) => {
          const meta = await getWagerMetadata(tile.escrowAddress);

          return {
            ...tile,
            statement: meta?.statement || "",
            createdAt: meta?.createdAt || 0,
          };
        })
      );

      // 🔁 sort newest first
      const sorted = enriched.sort(
        (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
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

  const joinWager = async (escrowAddress: string) => {
    console.group("[JOIN_WAGER]");

    try {
      if ((window as any).__JOINING) return;
      (window as any).__JOINING = true;

      if (!walletProvider) {
        throw new Error("Wallet not connected");
      }

      const signer = await walletProvider.getSigner();

      const contract = new ethers.Contract(
        escrowAddress,
        escrowJson.abi,
        signer
      );

      const stake = await contract.stakeAmount();

      const tx = await contract.deposit({ value: stake });
      await tx.wait();

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

      console.group("🔥 INTENT DEBUG");

      console.log("intent.type:", intent?.type);
      console.log("escrow:", intent?.escrowAddress);
      console.log("walletProvider exists:", !!walletProvider);

      try {
        if (walletProvider) {
          const signer = await walletProvider.getSigner();
          const addr = await signer.getAddress();
          console.log("active wallet:", addr);
        } else {
          console.log("active wallet: NONE");
        }
      } catch (e) {
        console.log("wallet error:", e);
      }

      console.groupEnd();

      if (intent.type === "JOIN_WAGER") {
        const res = await joinWager(intent.escrowAddress);

        if (res?.success) {
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