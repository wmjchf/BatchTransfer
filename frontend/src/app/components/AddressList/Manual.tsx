"use client";
import { 
  Button, 
  Card, 
  CardBody, 
  Input, 
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  Chip,
  addToast
} from "@heroui/react";
import { useState, useRef } from "react";
import classNames from "classnames";
import localFont from "next/font/local";
import { PreviewData, IPreviewDataRef } from "./PreviewData";
import { useSearchParams } from "next/navigation";
import { useBatchTransferETH, useCalculateFee } from "../../../abi/batchTransfter";
import { parseEventLogs } from "viem";
import { BATCH_TRANSFER_ABI } from "../../../constant/batchTransfer";
import { useCommonStore } from "../../../store/common";

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

type TransferStatus = "pending" | "success" | "failed";

interface TransferItem {
  id: string;
  address: string;
  amount: number;
  isValid?: boolean;
  status: TransferStatus;
}

export const Manual = () => {
  const [transferList, setTransferList] = useState<TransferItem[]>([]);
  const [newAddress, setNewAddress] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [errors, setErrors] = useState<{address?: string; amount?: string}>({});
  const previewDataRef = useRef<IPreviewDataRef>(null);
  const p = useSearchParams();
  const refAddress = p.get("address");
  const { fee } = useCalculateFee(transferList.length);
  const { handleBatchTransferETH,isPending } = useBatchTransferETH();
  const { tokenInfo } = useCommonStore();
  // Validate Ethereum address
  const validateAddress = (address: string): boolean => {
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    return ethAddressRegex.test(address);
  };

  // Validate amount
  const validateAmount = (amount: number): boolean => {
    const num = amount;
    return !isNaN(num) && num > 0;
  };

  // Add new transfer item
  const handleAddTransfer = () => {
    const newErrors: {address?: string; amount?: string} = {};
    
    // Validate address
    if (!newAddress.trim()) {
      newErrors.address = "Address cannot be empty";
    } else if (!validateAddress(newAddress.trim())) {
      newErrors.address = "Please enter a valid Ethereum address";
    }
    
    // Validate amount
    if (!newAmount.trim()) {
      newErrors.amount = "Amount cannot be empty";
    } else if (!validateAmount(Number(newAmount.trim()))) {
      newErrors.amount = "Please enter a valid amount";
    }
    
    setErrors(newErrors);
    
    // If there are errors, don't add
    if (Object.keys(newErrors).length > 0) {
      return;
    }
    
    // Check if address already exists
    const addressExists = transferList.some(item => 
      item.address.toLowerCase() === newAddress.trim().toLowerCase()
    );
    
    if (addressExists) {
      setErrors({ address: "This address already exists" });
      return;
    }
    
    // Add new item
    const newItem: TransferItem = {
      id: Date.now().toString(),
      address: newAddress.trim(),
      amount: Number(newAmount.trim()),
      isValid: true,
      status: "pending"
    };
    
    setTransferList([...transferList, newItem]);
    setNewAddress("");
    setNewAmount("");
    setErrors({});
  };

  // Remove transfer item
  const handleRemoveTransfer = (id: string) => {
    setTransferList(transferList.filter(item => item.id !== id));
  };

  // Clear all items
  const handleClearAll = () => {
    setTransferList([]);
  };

  // Handle batch transfer
  const hanldeTransfer = async () => {
    if(!fee){
      return;
    }
    
    try {
      let result:any = null;
      if(tokenInfo?.tokenType === "native"){
        result = await handleBatchTransferETH(
          transferList.map(item => ({ 
            to: item.address, 
            amount: BigInt(item.amount * 10 ** 18 ) 
          })),
          BigInt(totalAmount * 10 ** 18 ),
          fee,
          refAddress as string
        );
      }
      

      const receipt = result.receipt;
      
      const logs = parseEventLogs({
        abi: BATCH_TRANSFER_ABI,
        logs: receipt.logs,
      });
      
      const transferDetailLogs = logs.filter((log:any)=>log.eventName === 'TransferDetail').map((log:any)=>({
        batchIndex: log.args.batchIndex,
        to: log.args.to,
        amount: log.args.amount,
        success: log.args.success,
        failureReason: log.args.failureReason
      }));
      
      // Update status based on transaction results
      const updatedTransferList = transferList.map((item,index)=>{
        const transferDetailLog = transferDetailLogs.find((log:any)=>log.to === item.address);
        return {
          ...item,
          status: (transferDetailLog?.success ? "success" : "failed") as TransferStatus
        }
      });
      
      setTransferList(updatedTransferList.filter(item=>item.status === "failed"));
      
      const failedTransfers = updatedTransferList.filter(item => item.status === "failed");
      const successfulTransfers = updatedTransferList.filter(item => item.status === "success");
      
      if(failedTransfers.length > 0){
        addToast({
          title: `${failedTransfers.length} transfers failed, ${successfulTransfers.length} transfers succeeded`,
          color: "warning",
        });
      } else {
        addToast({
          title: `All ${successfulTransfers.length} transfers succeeded!`,
          color: "success",
        });
      }
    } catch (error) {
      // Set all items to failed status on error
      const failedList = transferList.map(item => ({
        ...item,
        status: "failed" as TransferStatus
      }));
      setTransferList(failedList);
      
      addToast({
        title: "Batch transfer failed",
        color: "danger",
      });
    }
  };

  // Calculate total amount
  const totalAmount = transferList.reduce((sum, item) => {
    if (item.isValid && validateAmount(item.amount)) {
      return sum + item.amount;
    }
    return sum;
  }, 0);

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Input Area */}
      <Card>
        <CardBody className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  label="Recipient Address"
                  placeholder="0x1234567890123456789012345678901234567890"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  isInvalid={!!errors.address}
                  errorMessage={errors.address}
                  classNames={{
                    input: "font-mono text-sm",
                    label: classNames(myFont.className)
                  }}
                />
              </div>
              <div className="w-32">
                <Input
                  label="Amount"
                  placeholder="100"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  isInvalid={!!errors.amount}
                  errorMessage={errors.amount}
                  classNames={{
                    label: classNames(myFont.className)
                  }}
                />
              </div>
              <Button
                color="success"
                onPress={handleAddTransfer}
                className="self-end"
              >
                <span className={classNames(myFont.className)}> Add</span>
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Transfer List */}
      {transferList.length > 0 && (
        <Card className="flex-1">
          <CardBody className="p-0">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h3 className={classNames(myFont.className, "font-semibold")}>
                  Transfer List ({transferList.length} items)
                </h3>
                <div className="flex items-center gap-2">
                <Chip color="primary" variant="flat" className={classNames(myFont.className)}>
                  Total: {totalAmount.toFixed(6)}
                </Chip>
                <Button color="success" isLoading={isPending} size="sm" radius="full" className="w-full"  onPress={hanldeTransfer}>
                    <span className={classNames(myFont.className)}>Batch Transfer</span>
                  </Button>
                </div>
                
              </div>
            </div>
            
            <div className="h-[calc(100vh-390px)] overflow-y-auto">
              <Table 
                aria-label="Transfer list"
                removeWrapper
                classNames={{
                  th: "bg-gray-50",
                }}
              >
                <TableHeader>
                  <TableColumn className={classNames(myFont.className)}>Address</TableColumn>
                  <TableColumn className={classNames(myFont.className)}>Amount</TableColumn>
                  <TableColumn className={classNames(myFont.className)}>Status</TableColumn>
                  <TableColumn className={classNames(myFont.className)}>Action</TableColumn>
                </TableHeader>
                <TableBody>
                  {transferList.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Tooltip content={item.address}>
                          <span className="font-mono text-sm">
                            {`${item.address.slice(0, 6)}...${item.address.slice(-4)}`}
                          </span>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {item.amount}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="sm"
                          color={
                            item.status === "success" 
                              ? "success" 
                              : item.status === "failed" 
                              ? "danger" 
                              : "default"
                          }
                          variant="flat"
                          className={classNames(myFont.className)}
                        >
                          {item.status === "pending" ? "Pending" : 
                           item.status === "success" ? "Success" : "Failed"}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Button
                          isIconOnly
                          size="sm"
                          color="danger"
                          variant="light"
                          onPress={() => handleRemoveTransfer(item.id)}
                        >
                          ✕
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Empty State */}
      {transferList.length === 0 && (
        <Card className="flex-1">
          <CardBody className="flex flex-col items-center justify-center gap-4 p-8">
            <div className="text-6xl opacity-20">📝</div>
            <div className="text-center">
              <h3 className={classNames(myFont.className, "font-semibold text-gray-600 mb-2")}>
                No Transfer Records
              </h3>
              <p className={classNames(myFont.className, "text-sm text-gray-500")}>
                Please enter recipient address and amount above to add transfer records
              </p>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Data Preview Modal */}
      <PreviewData ref={previewDataRef} />
    </div>
  );
};