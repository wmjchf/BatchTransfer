import "@rainbow-me/rainbowkit/styles.css";

import { getMessages } from "next-intl/server";
import PagesTopLoader from "nextjs-toploader";
import { HeroUIProvider, ToastProvider } from "@heroui/react";
import { WalletProvider } from "../rainbowkit/WalletProvider";
import "../styles/globals.css";
import "../styles/iconfont.css";
import "../styles/mixins.scss";

import type { Metadata } from "next";
import Script from "next/script";
import { Header } from "./Header";
import { IPRegion } from "../components/IPRegion";
import { Footer } from "./Footer";

export const metadata: Metadata = {
  title: "AssetsLink - Web3 asset connectivity at scale",
  keywords: ["Batch Transfer", "ERC20 Batch Transfer", "Ethereum", "EVM", "Web3"],
  description:
    "Web3 asset connectivity at scale. From ERC-20s to NFTs, we simplify access, aggregation, and interaction across the decentralized economy.",
};

async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-restoration-id="1">
      <body>
        {process.env.NEXT_PUBLIC_GA4_DEBUG === "false" && (
          <>
            <Script
              strategy="afterInteractive"
              src="https://www.googletagmanager.com/gtag/js?id=G-SZTKHJ2JTY"
            ></Script>
            <Script id="gtag-init" strategy="afterInteractive">
              {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-SZTKHJ2JTY', {
                page_path: window.location.pathname,
              });
            `}
            </Script>
          </>
        )}

        <ToastProvider placement="top-center" />

        <HeroUIProvider>
          <WalletProvider>
            <Header />
            {children}
          </WalletProvider>
        </HeroUIProvider>

        <PagesTopLoader />
        <IPRegion></IPRegion>
      </body>
    </html>
  );
}

export default RootLayout;
