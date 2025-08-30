"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";

import { config } from "./wagmi";

const queryClient = new QueryClient();

interface IWalletProvider {
  children?: React.ReactNode;
}

export const WalletProvider = (props: IWalletProvider) => {
  const { children } = props;

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider locale="en">{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
