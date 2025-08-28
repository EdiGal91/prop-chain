/**
 * Application configuration for the frontend
 */

export const APP_CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:3000",
} as const;

export const CONTRACTS = {
  PROPERTY_TOKENIZATION: "0x72B7147007cdC356eA801d4218dAC2fe0E9ed8C8",
} as const;

export const NETWORKS = {
  ETHERLINK_TESTNET: {
    chainId: 128123,
    name: "Etherlink Testnet",
    rpcUrl: "https://node.ghostnet.etherlink.com",
    blockExplorer: "https://testnet.explorer.etherlink.com",
  },
} as const;
