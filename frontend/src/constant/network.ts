import { CreateConfigParameters } from "wagmi";
import { mainnet, sepolia, bsc, bscTestnet, Chain } from "wagmi/chains";

export const NETWORKLIST: CreateConfigParameters["chains"] = process.env
  .NEXT_PUBLIC_ENABLE_TESTNETS
  ? [sepolia, bscTestnet]
  : [mainnet, bsc];
