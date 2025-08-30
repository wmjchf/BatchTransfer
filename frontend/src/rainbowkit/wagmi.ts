import { NETWORKLIST } from "./../constant/network";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { mainnet, sepolia, bsc, bscTestnet } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "webify",
  projectId: "d1f6f05b749ec6d832c8951abeca3038",
  chains: NETWORKLIST,
  ssr: true,
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [bsc.id]: http(),
    [bscTestnet.id]: http(),
  },
});
