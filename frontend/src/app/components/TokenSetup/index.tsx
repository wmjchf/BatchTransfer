"use client";
import { Input, RadioGroup, Radio } from "@heroui/react";
import classNames from "classnames";
import localFont from "next/font/local";
import { useState } from "react";
import { useAccount } from "wagmi";

const myFont = localFont({
  src: [
    {
      path: "../../fonts/Poppins700.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../fonts/Poppins500.ttf",
      weight: "500",
      style: "normal",
    },
  ],
  display: "swap",
});

type TokenType = "native" | "erc20";

export const TokenSetup = () => {
  const [tokenType, setTokenType] = useState<TokenType>("native");
  const [tokenAddress, setTokenAddress] = useState("");
const {chain} = useAccount();
  return (
    <div className="w-full flex flex-col gap-6 border-[1px] border-solid border-gray-200 rounded-md p-4">
      <div className="flex flex-col gap-3">
        <span
          className={classNames(myFont.className, "text-2xl font-semibold")}
        >
          Token Setup
        </span>
        <span className={classNames(myFont.className)}>
          {tokenType === "native" 
            ? "Select native token for transfer" 
            : "Enter the ERC20 token contract address you want to send"
          }
        </span>
      </div>
      
      <RadioGroup
        value={tokenType}
        onValueChange={(value) => setTokenType(value as TokenType)}
        orientation="horizontal"
        className="flex gap-6"
      >
        <Radio value="native" className={classNames(myFont.className)}>
         {chain?.nativeCurrency?.symbol||"Native Token"} 
        </Radio>
        <Radio value="erc20" className={classNames(myFont.className)}>
          ERC20 Token
        </Radio>
      </RadioGroup>

      {tokenType === "erc20" && (
        <Input
          placeholder="Enter the token contract address"
          color="success"
          value={tokenAddress}
          onValueChange={setTokenAddress}
        />
      )}
    </div>
  );
};
