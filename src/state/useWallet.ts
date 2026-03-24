import { useEffect, useState } from "react";
import { ethers } from "ethers";

export function useWallet() {
  const [address, setAddress] = useState<string | undefined>();
  const [provider, setProvider] = useState<ethers.BrowserProvider>();

  const connect = async () => {
    if (!(window as any).ethereum) {
      alert("Install MetaMask");
      return;
    }

    const provider = new ethers.BrowserProvider(
      (window as any).ethereum
    );

    await provider.send("eth_requestAccounts", []);

    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    setProvider(provider);
    setAddress(address);
  };

  return {
    address,
    provider,
    connect,
  };
}