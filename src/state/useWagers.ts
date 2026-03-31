import { useEffect, useRef, useState, useCallback } from "react";
import { ethers } from "ethers";

import type { UITile } from "../wagers/types";

import factoryJson from "../blockchain/abis/PreDEXFactory.json";
import { hydrateEscrows } from "./hydrateEscrows";
import { mapRawEscrowsToTiles } from "../wagers/normalize";
import { getWagerMetadata } from "../services/firebase/wagers";
import escrowJson from "../blockchain/abis/PreDEXEscrow.json";

/* =========================================================
   CONFIG
========================================================= */

const RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";
const FACTORY_ADDRESS = "0x3f2dFD882503048Fe3b57DA9A9C966B05263C6Ff";

const factoryAbi = (factoryJson as any).abi;

/* =========================================================
   HOOK
========================================================= */

export function useWagers() {
  const [tiles, setTiles] = useState<UITile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* -----------------------------------------
     STABLE PROVIDER (DO NOT RECREATE)
  ----------------------------------------- */
  const providerRef = useRef<ethers.JsonRpcProvider | null>(null);

  if (!providerRef.current) {
    providerRef.current = new ethers.JsonRpcProvider(RPC_URL);
  }

  const provider = providerRef.current;

  /* -----------------------------------------
     LOAD FUNCTION (CORE PIPELINE)
  ----------------------------------------- */
  const load = useCallback(async () => {
    console.group("[useWagers] LOAD");

    try {
      setLoading(true);
      setError(null);

      /* =========================================
         1. CONNECTIVITY CHECK
      ========================================= */

      const block = await provider.getBlockNumber();
      console.log("Connected → block", block);

      /* =========================================
         2. FACTORY CONTRACT
      ========================================= */

      const factory = new ethers.Contract(
        FACTORY_ADDRESS,
        factoryAbi,
        provider
      );

      /* =========================================
         3. FETCH ESCROW ADDRESSES
      ========================================= */

      const addresses: string[] = await factory.getEscrows();

      console.log("Escrows found:", addresses.length);

      if (!addresses.length) {
        setTiles([]);
        return;
      }

      /* =========================================
         4. HYDRATE (CHAIN → RAW)
      ========================================= */

      const raw = await hydrateEscrows(addresses, provider);

      console.log("Hydrated:", raw.length);

      /* =========================================
         5. NORMALIZE (RAW → UI)
      ========================================= */

      const mapped = await Promise.all(
        mapRawEscrowsToTiles(raw, tiles).map(async (tile) => {
          const meta = await getWagerMetadata(tile.escrowAddress);

          return {
            ...tile,
            statement: meta?.statement || "",
            createdAt: meta?.createdAt || 0,
          };
        })
      );
      console.log("Tiles mapped:", mapped.length);

      const sorted = mapped.sort((a: any, b: any) => {
        return (b.createdAt || 0) - (a.createdAt || 0);
      });

      setTiles(sorted);
    } catch (err: any) {
      console.error("[useWagers] ERROR", err);
      setError(err?.message ?? "Failed to load wagers");
    } finally {
      setLoading(false);
      console.groupEnd();
    }
  }, [provider]);
  /* -----------------------------------------
     INITIAL LOAD
  ----------------------------------------- */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (cancelled) return;
      await load();
    })();

    return () => {
      cancelled = true;
    };
  }, [load]);


  const getTileByAddress = useCallback(
    async (address: string): Promise<UITile | null> => {
      try {
        console.log("[getTileByAddress] SAFE PATH:", address);

        /* =========================================
           1. GET ALL ESCROWS (SOURCE OF TRUTH)
        ========================================= */
        const factory = new ethers.Contract(
          FACTORY_ADDRESS,
          factoryAbi,
          provider
        );

        const addresses: string[] = await factory.getEscrows();

        /* =========================================
           2. FIND MATCH
        ========================================= */
        const match = addresses.find(
          (a) => a.toLowerCase() === address.toLowerCase()
        );

        if (!match) {
          console.warn("Escrow not found in factory");
          return null;
        }

        /* =========================================
           3. HYDRATE USING WORKING PATH
        ========================================= */
        const raw = await hydrateEscrows([match], provider);

        if (!raw.length) return null;

        /* =========================================
           4. FULL NORMALIZATION (MATCH MAIN PIPELINE)
        ========================================= */
        const mapped = await Promise.all(
          mapRawEscrowsToTiles(raw, []).map(async (tile) => {
            const meta = await getWagerMetadata(tile.escrowAddress);

            return {
              ...tile,
              escrowAddress: tile.escrowAddress.toLowerCase(),
              statement: meta?.statement || "",
              createdAt: meta?.createdAt || 0,
            };
          })
        );

        const tile = mapped[0];
        if (!tile) return null;

        /* =========================================
           5. INJECT INTO STATE
        ========================================= */
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
        console.error("[getTileByAddress] FAIL", err);
        return null;
      }
    },
    [provider]
  );
  /* -----------------------------------------
     PUBLIC API
  ----------------------------------------- */
  const handleIntent = useCallback(async (intent: any) => {
    console.group("[handleIntent]");
    console.log(intent);

    try {
      if (!(window as any).ethereum) {
        throw new Error("No wallet found");
      }

      const provider = new ethers.BrowserProvider(
        (window as any).ethereum
      );

      const signer = await provider.getSigner();

      /* =========================================
         RESOLVE PROPOSE
      ========================================= */
      if (intent.type === "RESOLVE_PROPOSE") {
        const contract = new ethers.Contract(
          intent.escrowAddress,
          escrowJson.abi,
          signer
        );

        const tx = await contract.proposeWinner(intent.winner);

        console.log("TX SENT:", tx.hash);

        await tx.wait();

        console.log("CONFIRMED");

        /* =========================================
           🔥 OPTIMISTIC UI UPDATE (CRITICAL)
        ========================================= */

        setTiles((prev) =>
          prev.map((t) => {
            if (t.escrowAddress !== intent.escrowAddress) return t;

            return {
              ...t,
              status: "proposed",
              proposedWinner: intent.winner,
              proposalTimestamp: Date.now(), // ✅ THIS IS THE KEY
            };
          })
        );
      }


      if (intent.type === "RESOLVE_CLAIM") {
        const contract = new ethers.Contract(
          intent.escrowAddress,
          escrowJson.abi,
          signer
        );

        const tx = await contract.finalize();

        console.log("CLAIM TX:", tx.hash);

        await tx.wait();
      }

      /* =========================================
         ACCEPT (JOIN)
      ========================================= */
      if (intent.type === "ACCEPT") {
        await joinWager(intent.escrowAddress);
      }

      /* =========================================
         REFRESH STATE (CRITICAL)
      ========================================= */
      setTimeout(() => {
        load();
      }, 500);

    } catch (err: any) {
      console.error("[handleIntent] ERROR", err);
    } finally {
      console.groupEnd();
    }
  }, [load]);

  return {
    tiles,
    loading,
    error,
    refresh: load,
    onIntent: handleIntent,
    getTileByAddress,   // 🔥 ADD THIS
  };
}

export async function joinWager(escrowAddress: string) {
  console.group("[joinWager]");
  console.log("Escrow:", escrowAddress);

  try {
    /* =========================================
       1. WALLET CHECK
    ========================================= */
    if (!(window as any).ethereum) {
      throw new Error("No wallet found");
    }

    const provider = new ethers.BrowserProvider(
      (window as any).ethereum
    );

    const signer = await provider.getSigner();
    const user = await signer.getAddress();

    console.log("User:", user);

    /* =========================================
       2. CONTRACT INSTANCE
    ========================================= */
    const contract = new ethers.Contract(
      escrowAddress,
      escrowJson.abi,
      signer
    );

    /* =========================================
       3. FETCH STAKE (CRITICAL)
    ========================================= */
    const stake: bigint = await contract.stakeAmount();

    console.log("Stake (wei):", stake.toString());
    console.log("Stake (eth):", ethers.formatEther(stake));

    if (stake <= 0n) {
      throw new Error("Invalid stake amount");
    }

    /* =========================================
       4. SEND TX (DEPOSIT)
    ========================================= */
    const tx = await contract.deposit({
      value: stake,
    });

    console.log("TX SENT:", tx.hash);

    /* =========================================
       5. WAIT CONFIRMATION
    ========================================= */
    const receipt = await tx.wait();

    console.log("CONFIRMED:", receipt.hash);

    console.groupEnd();

    return {
      success: true,
      txHash: receipt.hash,
    };

  } catch (err: any) {
    console.error("JOIN FAILED:", err);
    console.groupEnd();

    return {
      success: false,
      error: err?.message || "Join failed",
    };
  }
}