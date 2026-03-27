import { ethers } from "ethers";
import FactoryArtifact from "../../blockchain/abis/PreDEXFactory.json";

const FACTORY_ADDRESS = "0x3f2dFD882503048Fe3b57DA9A9C966B05263C6Ff";

export async function getFactoryContract(
  provider: ethers.BrowserProvider
) {
  const signer = await provider.getSigner();

  return new ethers.Contract(
    FACTORY_ADDRESS,
    FactoryArtifact.abi,
    signer
  );
}

export async function createEscrow(
  provider: ethers.BrowserProvider,
  params: {
    opponent: string;
    stakeEth: string;
    deadlineSecondsFromNow: number;
  }
) {
  const contract = await getFactoryContract(provider);

  const stakeAmount = ethers.parseEther(params.stakeEth);
  const now = Math.floor(Date.now() / 1000);
  const fundingDeadline = now + params.deadlineSecondsFromNow;

  const tx = await contract.createEscrow(
    params.opponent,
    stakeAmount,
    fundingDeadline,
    {
      value: stakeAmount,
    }
  );

  const receipt = await tx.wait();

  return {
    tx,
    receipt,
  };
}