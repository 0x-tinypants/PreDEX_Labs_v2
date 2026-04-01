import { ethers } from "ethers";
import escrowJson from "../blockchain/abis/PreDEXEscrow.json";
import type { RawEscrowRecord } from "../wagers/raw.types";

const escrowAbi = (escrowJson as any).abi;

/* =========================================================
   HYDRATE ESCROWS
   Chain → RawEscrowRecord[]
========================================================= */

export async function hydrateEscrows(
  addresses: string[],
  provider: ethers.JsonRpcProvider
): Promise<RawEscrowRecord[]> {
  console.group("[hydrateEscrows]");

  const results = await Promise.all(
    addresses.map(async (address): Promise<RawEscrowRecord | null> => {
      try {
        console.groupCollapsed(`Escrow ${address}`);

        const contract = new ethers.Contract(address, escrowAbi, provider);

        /* =========================================
           PARALLEL READS
        ========================================= */

        const [
          partyA,
          partyB,
          stateRaw,
          fundingDeadline,
          winnerRaw,
          proposedWinnerRaw,
          stakeRaw,
        ] = await Promise.all([
          contract.partyA(),
          contract.partyB(),
          contract.state(),
          contract.fundingDeadline(),
          contract.winner().catch(() => null),
          contract.proposedWinner().catch(() => null),
          contract.stakeAmount().catch(() => null), // ✅ FIXED
        ]);
       
        /* =========================================
           NORMALIZE VALUES
        ========================================= */

        const creator = String(partyA);
        const opponent = String(partyB);

        const participants = [creator, opponent];

        const winner =
          winnerRaw && winnerRaw !== ethers.ZeroAddress
            ? String(winnerRaw)
            : undefined;

        const proposedWinner =
          proposedWinnerRaw && proposedWinnerRaw !== ethers.ZeroAddress
            ? String(proposedWinnerRaw)
            : undefined;
        /* =========================================
           BUILD RAW RECORD
        ========================================= */

        const record: RawEscrowRecord = {
          escrowAddress: address,
          type: "P2P",

          creator,
          participants,

          partyA: creator,
          partyB: opponent,

          state: Number(stateRaw),
          deadline: Number(fundingDeadline),

          winner,
          proposedWinner, // ✅ ADD THIS
          stake: stakeRaw.toString(),
        };

        console.groupEnd();

        return record;
      } catch (err) {
        console.error(`✖ Failed to hydrate ${address}`, err);
        console.groupEnd();
        return null;
      }
    })
  );

  /* =========================================
     FILTER NULLS
  ========================================= */

  const filtered = results.filter(
    (r): r is RawEscrowRecord => r !== null
  );

  console.groupEnd();

  return filtered;
}