import {
    useWriteContract,
    useConfig,
    useReadContract,
  } from "wagmi";
  import { waitForTransactionReceipt } from "@wagmi/core";
  import { Address } from "viem";
  import { BATCH_TRANSFER_ABI } from "../constant/batchTransfer";
  import { useState } from "react";
  import { addToast } from "@heroui/react";

  export interface Transfer {
    to: string;
    amount: bigint;
  }
  
  export const useCalculateFee = (transferCount: number) => {
    const { data: fee, refetch } = useReadContract({
      address: process.env.NEXT_PUBLIC_NTYE_CONTRACT as Address,
      abi: BATCH_TRANSFER_ABI,
      functionName: "calculateFee",
      args: [transferCount],
    });
    return { fee: fee as bigint | undefined, refetch };
  };
  
  export const useBatchTransferETH = () => {
    const [isPending, setIsPending] = useState(false);
    const { writeContractAsync, isError } = useWriteContract();
    const config = useConfig();
  
    const handleBatchTransferETH = async (
      transfer: Transfer[],
      totalAmount: bigint,
      fee: bigint,
      refAddress?: string
    ) => {
     
      try {
        if (!transfer) {
          throw new Error("Missing required parameters");
        }
        // 如果没有提供refAddress，使用零地址
        const finalRefAddress =
          refAddress || "0x0000000000000000000000000000000000000000";
        setIsPending(true);
        const hash = await writeContractAsync({
          abi: BATCH_TRANSFER_ABI,
          address: process.env.NEXT_PUBLIC_NTYE_CONTRACT as Address,
          functionName: "batchTransferETH",
          args: [transfer, finalRefAddress as Address],
          value: totalAmount + fee,
          gas: BigInt(5000000),
        });
        const receipt = await waitForTransactionReceipt(config as any, {
          hash,
        });
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
      handleBatchTransferETH,
      isPending,
      isError,
    };
  };
  