"use client";
import React from "react";
import Image from "next/image";
import classNames from "classnames";
import localFont from "next/font/local";
import { Button, Link } from "@heroui/react";
import { usePathname } from "next/navigation";

const myFont = localFont({
  src: [
    {
      path: "../fonts/Poppins700.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/Poppins500.ttf",
      weight: "500",
      style: "normal",
    },
  ],
  display: "swap",
});

export const Footer = () => {
  const pathname = usePathname();
  if (pathname.includes("restrict")) {
    return;
  }
  return (
    <div className="w-full py-16 bg-[#141534]">
      <div className="relative w-full">
        <div className="max-w-[1200px] w-full mx-auto px-3 sm:px-0">
          <div className="w-full flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex gap-4 items-center">
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
              <span
                className={classNames(
                  myFont.className,
                  "text-white text-2xl font-bold"
                )}
              >
                The Next Ten Years of Ethereum
              </span>
            </div>
          </div>
          <div className="mt-8 pt-8 flex items-center justify-between">
            <span className={classNames(myFont.className, "text-white")}>
              © 2025 NTYE. All Rights Reserved.
            </span>
            <div className="flex items-center gap-6">
              <Link href="https://x.com/NextTYETH" target="_blank">
                <svg
                  id="twitterx"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#ffffff"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                >
                  <path d="M18.9,1.2h3.7l-8,9.2L24,22.8h-7.4l-5.8-7.6l-6.6,7.6H0.5L9.1,13L0,1.2h7.6l5.2,6.9L18.9,1.2z M17.6,20.6h2L6.5,3.2H4.3 L17.6,20.6z"></path>
                </svg>
              </Link>
              <Link href="https://github.com/NextTYETH" target="_blank">
                <Image
                  src="/image/social/github-white.svg"
                  alt="x"
                  width={32}
                  height={32}
                ></Image>
              </Link>
              <Link href="https://etherscan.io/" target="_blank">
                <Image
                  src="/image/social/etherscan.svg"
                  alt="x"
                  width={32}
                  height={32}
                ></Image>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
