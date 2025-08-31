"use client";
import { Button, Card, CardBody, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/react";
import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { PreviewData, IPreviewDataRef } from "./PreviewData";

interface UploadProps {
  onFileUpload?: (data: any[]) => void;
}

export const Upload = ({ onFileUpload }: UploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewDataRef = useRef<IPreviewDataRef>(null);
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
      setUploadedFile(file);
      previewDataRef.current?.open(data.filter(item => item.address && item.amount));
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

  // 重置状态
  const resetState = () => {
    setUploadedFile(null);
    setError("");
    setPreviewData([]);
    setIsModalOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Download CSV template
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



  return (
    <div className="h-full flex flex-col gap-4">
      {/* 上传区域 */}
      <Card 
        className={`flex-1 cursor-pointer transition-all duration-200 ${
          isDragging 
            ? "border-2 border-dashed border-blue-400 bg-blue-50" 
            : "border-2 border-dashed border-gray-300 hover:border-gray-400"
        }`}
        isPressable
        onPress={handleUploadClick}
      >
        <CardBody
          className="flex flex-col items-center justify-center gap-4 p-8"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="text-gray-600">Processing file...</p>
            </>
          ) : (
            <>
              <Image 
                src="/image/book.svg" 
                alt="Upload" 
                width={80} 
                height={80}
                className="opacity-60"
              />
            </>
          )}
        </CardBody>
      </Card>

      {/* 错误信息 */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardBody className="py-3">
            <p className="text-red-600 text-sm">{error}</p>
          </CardBody>
        </Card>
      )}

      {/* 模板下载区域 */}
      <Card className="bg-green-50 border-green-200">
        <CardBody className="py-3">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-green-800">Download Template Files:</h4>
          </div>
          <div className="flex gap-3">
            <Button
              color="success"
              variant="bordered"
              size="sm"
              onPress={downloadCSVTemplate}
              className="w-full"
            >
              📄 Download CSV Template
            </Button>
          </div>
        </CardBody>
      </Card>



      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* 数据预览模态框 */}
      <PreviewData ref={previewDataRef} />
    </div>
  );
};
