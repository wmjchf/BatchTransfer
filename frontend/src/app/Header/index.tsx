"use client";
import {
  addToast,
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Tab,
  Tabs,
} from "@heroui/react";
import classNames from "classnames";
import Image from "next/image";
import styles from "./index.module.scss";
import { usePathname } from "next/navigation";
import Link from "next/link";
import localFont from "next/font/local";
import { ConnectWallet } from "../../components/ConnectWallet";
import { useAccount, useDisconnect } from "wagmi";
import { useEffect } from "react";
import { useUserStore } from "../../store/user";
import { useBalance } from "../../abi/ntye";
import event from "../../event";
import { SwitchNetwork } from "./SwitchNetwork";
import { generateAvatarFromAddress, formatAddress } from "../../utils/format";

interface IHeader {}
const myFont = localFont({
  src: [
    {
      path: "../fonts/Poppins500.ttf",
      weight: "500",
      style: "normal",
    },
  ],
  display: "swap",
});
export const Header: React.FC<IHeader> = () => {
  const { isConnected, address } = useAccount();
  const { handleLogin } = useUserStore();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    if (isConnected && address) {
      handleLogin(address);
    }
  }, [isConnected, address]);

  return (
    <div className="sm:block hidden w-full fixed top-0 left-0 z-30">
      <div
        id="header"
        className={classNames(
          "max-w-[1200px] bg-[#ffffff] rounded-full flex mx-auto mt-4 w-full h-14 px-4 justify-center items-center",
          myFont.className
        )}
      >
        <div className="px-3 sm:px-0 flex w-full h-full max-w-[1550px] justify-between">
          <div
            className={classNames(
              "flex h-full items-center text-2xl font-bold italic"
            )}
          >
            <Image
              src="/image/logo.png"
              width={40}
              height={40}
              alt=""
              className="w-[40px] h-[40px]"
            ></Image>
          </div>
          <div className={classNames("flex h-full items-center gap-8")}>
            {isConnected ? (
              <div className="flex items-center gap-4 flex-shrink-0">
                <SwitchNetwork />
                <Dropdown placement="bottom-end">
                  <DropdownTrigger>
                    <Avatar
                      as="button"
                      className="transition-transform hover:scale-105 cursor-pointer"
                      src={
                        address ? generateAvatarFromAddress(address) : undefined
                      }
                      size="sm"
                    />
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Profile Actions" variant="flat">
                    <DropdownItem key="profile" className="h-14 gap-2">
                      <p className="font-semibold">Wallet Address</p>
                      <p className="font-semibold text-xs">
                        {address ? formatAddress(address) : ""}
                      </p>
                    </DropdownItem>
                    <DropdownItem
                      key="invite"
                      color="success"
                      onPress={() => {
// 复制链接到剪贴板
                        navigator.clipboard.writeText(`${window.location.href}?address=${address}`);
                        addToast({
                          title: "Link copied to clipboard",
                          color:"success"
                        })
                      }}
                    >
                      <div className={classNames("flex items-center gap-2",myFont.className)}><Image src="/image/share.svg" alt="share" width={20} height={20}></Image>
                      Invite Link</div>
                    </DropdownItem>
                    <DropdownItem
                      key="logout"
                      color="success"
                      onPress={() => disconnect()}
                    >
                      <div className={classNames("flex items-center gap-2",myFont.className)}>
                      <Image src="/image/disconnect.svg" alt="share" width={20} height={20}></Image>
                      Disconnect Wallet
                      </div>
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            ) : (
              <ConnectWallet>
                {(openConnectModal) => {
                  return (
                    <Button
                      color="success"
                      className="flex-shrink-0 w-[200px]"
                      onPress={openConnectModal}
                    >
                      Connect Wallet
                    </Button>
                  );
                }}
              </ConnectWallet>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
