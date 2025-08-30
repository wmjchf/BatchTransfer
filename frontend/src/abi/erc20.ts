import {
  useWriteContract,
  useConfig,
  useAccount,
  useReadContract,
} from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { Address } from "viem";
import { ERC20ABI } from "../constant/erc20";
import { useState } from "react";

export const useApprove = (tokenAddr: string) => {
  const [isPending, setIsPending] = useState(false);
  const { writeContractAsync, isError } = useWriteContract();
  const config = useConfig();

  const handleApprove = async (amount: bigint, tradeContract: string) => {
    try {
      if (!amount) {
        return;
      }

      const hash = await writeContractAsync({
        abi: ERC20ABI,
        address: tokenAddr as Address,
        functionName: "approve",
        args: [tradeContract, amount],
        gas: BigInt(300000),
      });
      setIsPending(true);
      await waitForTransactionReceipt(config as any, {
        hash,
      });
      setIsPending(false);
      return hash;
    } catch (error) {}
  };

  return {
    handleApprove,
    isPending,
    isError,
  };
};

export const useAllowance = (tokenAddr: string, tradeContract: string) => {
  const handleData = (data: unknown) => {
    return data ? Number(data) / 10 ** 18 : 0;
  };
  const { address } = useAccount();
  const { data, error, isPending, refetch } = useReadContract({
    abi: ERC20ABI,
    address: tokenAddr as Address,
    functionName: "allowance",
    args: [address, tradeContract],
  });
  return {
    allowance: handleData(data),
    handleData,
    refetch,
  };
};
