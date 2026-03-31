import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { PrivyProvider } from "@privy-io/react-auth";

const sepoliaChain = {
  id: 11155111,
  name: "Sepolia",
  nativeCurrency: {
    name: "Sepolia ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.sepolia.org"],
    },
  },
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PrivyProvider
      appId="cmndt4zu500dk0cl55gexmma7"
      config={{
        embeddedWallets: {
          createOnLogin: "all-users",
        },
        defaultChain: sepoliaChain,
        supportedChains: [sepoliaChain],
      }}
    >
      <App />
    </PrivyProvider>
  </React.StrictMode>
);