import { http, createConfig } from "wagmi";
import { defineChain } from "viem";
import {
  mainnet,
  sepolia,
  polygon,
  arbitrum,
  optimism,
  base,
  bsc,
  avalanche,
  fantom,
  gnosis,
} from "wagmi/chains";
import { metaMask } from "wagmi/connectors";

// Define Etherlink testnet
export const etherlinkTestnet = defineChain({
  id: 128123,
  name: "Etherlink Testnet",
  nativeCurrency: {
    name: "Tez",
    symbol: "XTZ",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://node.ghostnet.etherlink.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "Etherlink Explorer",
      url: "https://testnet-explorer.etherlink.com",
    },
  },
  testnet: true,
});

// Define Etherlink mainnet
export const etherlinkMainnet = defineChain({
  id: 42793,
  name: "Etherlink Mainnet",
  nativeCurrency: {
    name: "Tez",
    symbol: "XTZ",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://node.mainnet.etherlink.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "Etherlink Explorer",
      url: "https://explorer.etherlink.com",
    },
  },
  testnet: false,
});

export const config = createConfig({
  chains: [
    etherlinkTestnet,
    etherlinkMainnet,
    mainnet,
    sepolia,
    polygon,
    arbitrum,
    optimism,
    base,
    bsc,
    avalanche,
    fantom,
    gnosis,
  ],
  connectors: [
    metaMask({
      dappMetadata: {
        name: "PropChain",
      },
    }),
  ],
  transports: {
    [etherlinkTestnet.id]: http(),
    [etherlinkMainnet.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [base.id]: http(),
    [bsc.id]: http(),
    [avalanche.id]: http(),
    [fantom.id]: http(),
    [gnosis.id]: http(),
  },
});
