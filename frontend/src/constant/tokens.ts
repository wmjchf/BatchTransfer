import { mainnet, sepolia, bsc, bscTestnet } from "wagmi/chains";

export interface TokenInfo {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  icon?: string;
}

export interface NetworkTokens {
  [chainId: number]: TokenInfo[];
}

export const POPULAR_TOKENS: NetworkTokens = {
  // Ethereum Mainnet
  [mainnet.id]: [
    {
      symbol: "USDT",
      name: "Tether USD",
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      decimals: 6,
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      decimals: 6,
    },
  ],
  // BSC Mainnet
  [bsc.id]: [
    {
      symbol: "USDT",
      name: "Tether USD",
      address: "0x55d398326f99059fF775485246999027B3197955",
      decimals: 18,
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
      decimals: 18,
    },
  ],
  // Sepolia Testnet
  [sepolia.id]: [
    {
      symbol: "USDT",
      name: "Test USDT",
      address: "0x7169d38820dfd117c3fa1f22a697dba58d90ba06",
      decimals: 6,
    },
    {
      symbol: "USDC",
      name: "Test USDC",
      address: "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8",
      decimals: 6,
    },
  ],
  // BSC Testnet
  [bscTestnet.id]: [
    {
      symbol: "USDT",
      name: "Test USDT",
      address: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd",
      decimals: 18,
    },
    {
      symbol: "USDC",
      name: "Test USDC",
      address: "0x64544969ed7EBf5f083679233325356EbE738930",
      decimals: 18,
    },
  ],
};

export const getPopularTokensForChain = (chainId: number): TokenInfo[] => {
  return POPULAR_TOKENS[chainId] || [];
};
