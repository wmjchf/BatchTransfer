"use client";
import { 
  Button, 
  Card, 
  CardBody, 
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
import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { PreviewData, IPreviewDataRef } from "./PreviewData";
import localFont from "next/font/local";
import classNames from "classnames";
import { useSearchParams } from "next/navigation";
import { useCommonStore } from "../../../store/common";
import { useBatchTransferETH, useCalculateFee } from "../../../abi/batchTransfter";
import { parseEventLogs } from "viem";
import { BATCH_TRANSFER_ABI } from "../../../constant/batchTransfer";

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

interface UploadProps {
  onFileUpload?: (data: any[]) => void;
}

export const Upload = ({ onFileUpload }: UploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [transferRecords, setTransferRecords] = useState<TransferItem[]>([]);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewDataRef = useRef<IPreviewDataRef>(null);
  const { handleBatchTransferETH,isPending } = useBatchTransferETH();
  const { tokenInfo } = useCommonStore();
  const p = useSearchParams();
  const refAddress = p.get("address");
  const { fee } = useCalculateFee(transferRecords.length);
  // 支持的文件类型
  const acceptedFileTypes = [
    "text/csv" // .csv
  ];

  // 验证文件类型
  const validateFile = (file: File): boolean => {
    const isValidType = acceptedFileTypes.includes(file.type) || 
                       file.name.endsWith('.csv');
    
    if (!isValidType) {
      setError("Please upload CSV files only");
      return false;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      setError("File size cannot exceed 10MB");
      return false;
    }

    return true;
  };

  // 解析 Excel/CSV 文件
  const parseFile = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          
          // 解析 CSV
          const text = data as string;
          const lines = text.split('\n').filter(line => line.trim());
          const result = lines.map(line => {
            const [address, amount] = line.split(',').map(item => item.trim());
            return { address, amount: parseFloat(amount) || 0 };
          });
          resolve(result);
        } catch (error) {
          reject(new Error("File parsing failed"));
        }
      };

      reader.onerror = () => reject(new Error("File reading failed"));

      reader.readAsText(file);
    });
  };

  // 处理文件上传
  const handleFileUpload = async (file: File) => {
    setError("");
    setIsUploading(true);

    if (!validateFile(file)) {
      setIsUploading(false);
      return;
    }

    try {
      const data = await parseFile(file);
      const validData = data.filter(item => item.address && item.amount);
      
      // 将数据转换为转账记录格式，每次上传替换所有数据
      const newRecords: TransferItem[] = validData.map((item, index) => ({
        id: `${Date.now()}-${index}`,
        address: item.address,
        amount: Number(item.amount),
        isValid: true,
        status: "pending"
      }));
      
      setTransferRecords(newRecords); // Replace all data
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "File processing failed");
    } finally {
      setIsUploading(false);
    }
  };

  // 拖拽事件处理
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  // 文件选择处理
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  // 点击上传区域
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // 删除转账记录
  const handleRemoveRecord = (id: string) => {
    setTransferRecords(transferRecords.filter(record => record.id !== id));
  };

  // 清空所有记录
  const handleClearAll = () => {
    setTransferRecords([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 预览所有数据
  const hanldeTransfer = async () => {
    if(!fee){
      return;
    }
    
    
    try {
      let result:any = null;
      if(tokenInfo?.tokenType === "native"){
        result = await handleBatchTransferETH(
          transferRecords.map(item => ({ 
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
      const updatedTransferList = transferRecords.map((item)=>{
        const transferDetailLog = transferDetailLogs.find((log:any)=>log.to === item.address);
        return {
          ...item,
          status: (transferDetailLog?.success ? "success" : "failed") as TransferStatus
        }
      });
      
      setTransferRecords(updatedTransferList.filter(item=>item.status === "failed"));
      
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
      const failedList = transferRecords.map(item => ({
        ...item,
        status: "failed" as TransferStatus
      }));
      setTransferRecords(failedList);
      
      addToast({
        title: "Batch transfer failed",
        color: "danger",
      });
    }
  };

  // 下载CSV模板
  const downloadCSVTemplate = () => {
    const csvContent = `Address,Amount
0x1234567890123456789012345678901234567890,100
0x0987654321098765432109876543210987654321,200
0xabcdefabcdefabcdefabcdefabcdefabcdefabcd,50.5`;
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'batch_transfer_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 计算总金额
  const totalAmount = transferRecords.reduce((sum, record) => sum + record.amount, 0);


  return (
    <div className="h-full flex flex-col gap-4">
      {/* 上传区域 */}
      <Card>
        <CardBody className="p-4">
          <div className="flex flex-col gap-4">
            {/* 拖拽上传区域 */}
            <div className="flex gap-3">
              <div
                className={`flex-1 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all duration-200 ${
                  isDragging 
                    ? "border-blue-400 bg-blue-50" 
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onClick={handleUploadClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {isUploading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                    <p className={classNames(myFont.className, "text-gray-600 text-sm")}>Processing file...</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <Image 
                      src="/image/book.svg" 
                      alt="Upload" 
                      width={24} 
                      height={24}
                      className="opacity-60"
                    />
                    <div className="text-left">
                      <p className={classNames(myFont.className, "text-gray-700 font-medium text-sm")}>
                        Click to upload or drag CSV file
                      </p>
                      <p className={classNames(myFont.className, "text-gray-500 text-xs")}>
                        Supports CSV format, max 10MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Template Download */}
            <div className="flex items-center gap-2">
              <span className={classNames(myFont.className, "text-sm text-gray-500")}>
                Download Template:
              </span>
              <Button
                variant="light"
                size="sm"
                onPress={downloadCSVTemplate}
                className={classNames(myFont.className, "text-primary")}
              >
                📄 batch_transfer_template.csv
              </Button>
            </div>

            {/* Action Buttons */}
            {/* {transferRecords.length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="bordered"
                  color="danger"
                  size="sm"
                  onPress={handleClearAll}
                  className={classNames(myFont.className)}
                >
                  Clear All
                </Button>
                <Button
                  color="success"
                  size="sm"
                  onPress={handlePreviewAll}
                  className={classNames(myFont.className)}
                >
                  Preview ({transferRecords.length})
                </Button>
              </div>
            )} */}
          </div>
        </CardBody>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardBody className="py-3">
            <p className="text-red-600 text-sm">{error}</p>
          </CardBody>
        </Card>
      )}

            {/* Transfer Records List */}
      {transferRecords.length > 0 && (
        <Card className="flex-1">
          <CardBody className="p-0">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h3 className={classNames(myFont.className, "font-semibold")}>
                  Transfer List ({transferRecords.length} items)
                </h3>
                <div className="flex items-center gap-2">
                  <Chip color="primary" variant="flat" className={classNames(myFont.className,'relative top-[1px]')}>
                    Total: {totalAmount.toFixed(6)}
                  </Chip>
                  <Button color="success" size="sm" radius="full" className="w-full"  onPress={hanldeTransfer} isLoading={isPending}>
                    <span className={classNames(myFont.className)}>Batch Transfer</span>
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="h-[calc(100vh-424px)] overflow-y-auto">
              <Table 
                aria-label="Transfer records list"
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
                  {transferRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <Tooltip content={record.address}>
                          <span className="font-mono text-sm">
                            {`${record.address.slice(0, 6)}...${record.address.slice(-4)}`}
                          </span>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {record.amount}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="sm"
                          color={
                            record.status === "success" 
                              ? "success" 
                              : record.status === "failed" 
                              ? "danger" 
                              : "default"
                          }
                          variant="flat"
                          className={classNames(myFont.className)}
                        >
                          {record.status === "pending" ? "Pending" : 
                           record.status === "success" ? "Success" : "Failed"}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Button
                          isIconOnly
                          size="sm"
                          color="danger"
                          variant="light"
                          onPress={() => handleRemoveRecord(record.id)}
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
      {transferRecords.length === 0 && (
        <Card className="flex-1">
          <CardBody className="flex flex-col items-center justify-center gap-4 p-8">
            <div className="text-6xl opacity-20">📁</div>
            <div className="text-center">
              <h3 className={classNames(myFont.className, "font-semibold text-gray-600 mb-2")}>
                No Transfer Records
              </h3>
              <p className={classNames(myFont.className, "text-sm text-gray-500")}>
                Please upload a CSV file to batch import transfer addresses
              </p>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Data Preview Modal */}
      <PreviewData ref={previewDataRef} />
    </div>
  );
};
