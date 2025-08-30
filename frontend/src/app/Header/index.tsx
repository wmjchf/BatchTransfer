"use client";
import {
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width=".63em"
              height="1em"
              fill="none"
              className="text-[35px] opacity-85 hover:opacity-100"
              viewBox="0 0 115 182"
            >
              <path
                fill="#F0CDC2"
                stroke="#1616B4"
                d="M57.505 181v-45.16L1.641 103.171z"
              ></path>
              <path
                fill="#C9B3F5"
                stroke="#1616B4"
                d="M57.69 181v-45.16l55.865-32.669z"
              ></path>
              <path
                fill="#88AAF1"
                stroke="#1616B4"
                d="M57.506 124.615V66.979L1 92.28z"
              ></path>
              <path
                fill="#C9B3F5"
                stroke="#1616B4"
                d="M57.69 124.615V66.979l56.506 25.302z"
              ></path>
              <path
                fill="#F0CDC2"
                stroke="#1616B4"
                d="M1 92.281 57.505 1v65.979z"
              ></path>
              <path
                fill="#B8FAF6"
                stroke="#1616B4"
                d="M114.196 92.281 57.691 1v65.979z"
              ></path>
            </svg>
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
                      src={address ? generateAvatarFromAddress(address) : undefined}
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
                    <DropdownItem key="logout" color="danger" onPress={() => disconnect()}>
                      Disconnect Wallet
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            ) : (
              <ConnectWallet>
                {(openConnectModal) => {
                  return (
                    <Button
                      color="danger"
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
