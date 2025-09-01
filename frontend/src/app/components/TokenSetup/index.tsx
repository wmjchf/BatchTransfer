"use client";
import { Input, RadioGroup, Radio, Button, Chip } from "@heroui/react";
import classNames from "classnames";
import localFont from "next/font/local";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useCommonStore } from "../../../store/common";
import { getPopularTokensForChain, TokenInfo } from "../../../constant/tokens";

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
  const [selectedToken, setSelectedToken] = useState<TokenInfo | null>(null);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const { setTokenInfo } = useCommonStore();
  const { chain } = useAccount();
  
  const popularTokens = chain ? getPopularTokensForChain(chain.id) : [];

  useEffect(() => {
    setTokenInfo({ tokenType, tokenAddress, decimals: 18 });
  }, [tokenType, tokenAddress]);

  useEffect(() => {
    if (selectedToken) {
      setTokenInfo({ tokenType:"erc20", tokenAddress:selectedToken.address, decimals: selectedToken.decimals });
    }
  }, [selectedToken]);

  const handleTokenSelect = (token: TokenInfo) => {
    setSelectedToken(token);
    setTokenAddress(token.address);
    setShowCustomInput(false);
  };

  const handleCustomInput = () => {
    setSelectedToken(null);
    setTokenAddress("");
    setShowCustomInput(true);
  };

  const handleTokenTypeChange = (value: TokenType) => {
    setTokenType(value);
    if (value === "native") {
      setSelectedToken(null);
      setTokenAddress("");
      setShowCustomInput(false);
    }
  };
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
        onValueChange={(value) => handleTokenTypeChange(value as TokenType)}
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
        <div className="flex flex-col gap-4">
          {/* 常用代币选择 */}
          {popularTokens.length > 0 && (
            <div className="flex flex-col gap-3">
              <span className={classNames(myFont.className, "text-sm font-medium text-gray-600")}>
                Popular Tokens
              </span>
              <div className="flex flex-wrap gap-2">
                {popularTokens.map((token) => (
                  <Chip
                    key={token.address}
                    size="md"
                    variant={selectedToken?.address === token.address ? "solid" : "bordered"}
                    color={selectedToken?.address === token.address ? "primary" : "default"}
                    className={classNames(
                      myFont.className,
                      "cursor-pointer transition-all duration-200 hover:scale-105",
                      selectedToken?.address === token.address ? "ring-2 ring-blue-500 ring-offset-1" : ""
                    )}
                    onClick={() => handleTokenSelect(token)}
                  >
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{token.symbol}</span>
                      <span className={classNames("text-xs",{
                        "text-gray-500": selectedToken?.address !== token.address,
                        "text-white": selectedToken?.address === token.address
                      })}>({token.name})</span>
                    </div>
                  </Chip>
                ))}
                <Chip
                  size="md"
                  variant={showCustomInput ? "solid" : "bordered"}
                  color={showCustomInput ? "secondary" : "default"}
                  className={classNames(
                    myFont.className,
                    "cursor-pointer transition-all duration-200 hover:scale-105",
                    showCustomInput ? "ring-2 ring-purple-500 ring-offset-1" : ""
                  )}
                  onClick={handleCustomInput}
                >
                  Custom Address
                </Chip>
              </div>
            </div>
          )}

          {/* 选中的代币信息显示 */}
          {selectedToken && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex flex-col gap-1">
                <span className={classNames(myFont.className, "text-sm font-medium text-blue-800")}>
                  Selected Token: {selectedToken.symbol}
                </span>
                <span className={classNames(myFont.className, "text-xs text-blue-600 break-all")}>
                  Contract Address: {selectedToken.address}
                </span>
                <span className={classNames(myFont.className, "text-xs text-blue-600")}>
                  Decimals: {selectedToken.decimals}
                </span>
              </div>
            </div>
          )}

          {/* 自定义输入框 */}
          {(showCustomInput || (popularTokens.length === 0)) && (
            <div className="flex flex-col gap-2">
              <span className={classNames(myFont.className, "text-sm font-medium text-gray-600")}>
                {popularTokens.length === 0 ? "Enter Token Contract Address" : "Custom Token Address"}
              </span>
              <Input
                placeholder="Enter ERC20 token contract address"
                value={tokenAddress}
                onValueChange={(value) => {
                  setTokenAddress(value);
                  if (value !== selectedToken?.address) {
                    setSelectedToken(null);
                  }
                }}
                classNames={{
                  input: classNames(myFont.className),
                  inputWrapper: "border-gray-300"
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
