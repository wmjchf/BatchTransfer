import {
  useWriteContract,
  useConfig,
  useAccount,
  useReadContract,
} from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { Address } from "viem";
import { NTYEABI } from "../constant/ntye";
import { useState } from "react";
import event from "../event";
import { addToast } from "@heroui/react";

export const useMintPrice = () => {
  const { data: mintPrice, refetch } = useReadContract({
    address: process.env.NEXT_PUBLIC_NTYE_CONTRACT as Address,
    abi: NTYEABI,
    functionName: "mintPrice",
  });
  return { mintPrice: mintPrice as number | undefined, refetch };
};

export const useMintByNFT = () => {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { writeContractAsync, isError } = useWriteContract();
  const { mintPrice } = useMintPrice();
  const config = useConfig();
  const { address } = useAccount();

  const handleMintByNFT = async (
    tokenIds: bigint[],
    quantity: bigint,
    refAddress?: string
  ) => {
    if (!mintPrice) return;
    try {
      if (tokenIds.length === 0 || !quantity) {
        throw new Error("Missing required parameters");
      }
      // 如果没有提供refAddress，使用零地址
      const finalRefAddress =
        refAddress || "0x0000000000000000000000000000000000000000";
      setIsPending(true);
      const hash = await writeContractAsync({
        abi: NTYEABI,
        address: process.env.NEXT_PUBLIC_NTYE_CONTRACT as Address,
        functionName: "mintByNFT",
        args: [tokenIds, quantity, finalRefAddress as Address],
        value: BigInt(mintPrice as number) * quantity * BigInt(tokenIds.length),
        gas: BigInt(5000000),
      });
      const receipt = await waitForTransactionReceipt(config as any, {
        hash,
      });
      event.emit("mintSuccess");
      return { hash, receipt };
    } catch (error) {
      addToast({
        title: (error as { details: string }).details,
        color: "danger",
      });
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return {
    handleMintByNFT,
    isPending,
    isError,
  };
};

export const useMint = () => {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { writeContractAsync, isError } = useWriteContract();
  const { mintPrice } = useMintPrice();
  const config = useConfig();

  const handleMint = async (quantity: bigint, refAddress?: string) => {
    if (!mintPrice) return;
    try {
      if (!quantity) {
        throw new Error("Missing required parameters");
      }
      // 如果没有提供refAddress，使用零地址
      const finalRefAddress =
        refAddress || "0x0000000000000000000000000000000000000000";
      setIsPending(true);
      const hash = await writeContractAsync({
        abi: NTYEABI,
        address: process.env.NEXT_PUBLIC_NTYE_CONTRACT as Address,
        functionName: "mint",
        args: [quantity, finalRefAddress as Address],
        value: BigInt(mintPrice as number) * quantity,
        gas: BigInt(5000000),
      });
      const receipt = await waitForTransactionReceipt(config as any, {
        hash,
      });
      event.emit("mintSuccess");
      return { hash, receipt };
    } catch (error) {
      addToast({
        title: (error as { details: string }).details,
        color: "danger",
      });
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return {
    handleMint,
    isPending,
    isError,
  };
};

export const useBalance = () => {
  const { address } = useAccount();
  const { data: balance, refetch } = useReadContract({
    address: process.env.NEXT_PUBLIC_NTYE_CONTRACT as Address,
    abi: NTYEABI,
    functionName: "balanceOf",
    args: [address],
  });
  return { balance, refetch };
};

export const useNFTUseCount = (nftId: number = 1) => {
  const { data: count, refetch } = useReadContract({
    address: process.env.NEXT_PUBLIC_NTYE_CONTRACT as Address,
    abi: NTYEABI,
    functionName: "tokenIdMinted",
    args: [nftId],
  });
  console.log(count, "rewrewrewrwerew");
  return { count: count as number | undefined, refetch };
};

export const useMintTotalSupply = () => {
  const { data: totalSupply, refetch } = useReadContract({
    address: process.env.NEXT_PUBLIC_NTYE_CONTRACT as Address,
    abi: NTYEABI,
    functionName: "totalSupply",
  });
  return { totalSupply: totalSupply as number | undefined, refetch };
};

export const useMintByNFTEndTime = () => {
  const { data: mintByNFTEndTime, refetch } = useReadContract({
    address: process.env.NEXT_PUBLIC_NTYE_CONTRACT as Address,
    abi: NTYEABI,
    functionName: "mintByNFTEndTime",
  });
  return { mintByNFTEndTime: mintByNFTEndTime as number | undefined, refetch };
};

export const useMintEndTime = () => {
  const { data: mintEndTime, refetch } = useReadContract({
    address: process.env.NEXT_PUBLIC_NTYE_CONTRACT as Address,
    abi: NTYEABI,
    functionName: "mintEndTime",
  });
  return { mintEndTime: mintEndTime as number | undefined, refetch };
};
