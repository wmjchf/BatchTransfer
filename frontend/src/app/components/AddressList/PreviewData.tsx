"use client";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import classNames from "classnames";
import localFont from "next/font/local";
import React, { useState, forwardRef, useImperativeHandle } from "react";

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

export interface IPreviewDataRef {
  open: (data: any[]) => void;
  close: () => void;
}

interface IPreviewDataProps {
  ref: React.RefObject<IPreviewDataRef>;
}
export const PreviewData = forwardRef<IPreviewDataRef, IPreviewDataProps>(
  (props, ref) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [previewData, setPreviewData] = useState<any[]>([]);
    useImperativeHandle(ref, () => ({
      open: (data) => {
        setIsModalOpen(true);
        setPreviewData(data);
      },
      close: () => setIsModalOpen(false),
    }));
    const hanldeTransfer = () => {
      setIsModalOpen(false);
    };
    return (
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3 className={classNames(myFont.className)}>Transfer Preview</h3>
          </ModalHeader>
          <ModalBody>
            <Table aria-label="Data preview table">
              <TableHeader>
                <TableColumn>
                  <span className={classNames(myFont.className)}>ADDRESS</span>
                </TableColumn>
                <TableColumn>
                  <span className={classNames(myFont.className)}>AMOUNT</span>
                </TableColumn>
              </TableHeader>
              <TableBody>
                {previewData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell
                      className={classNames(
                        "font-mono text-sm",
                        myFont.className
                      )}
                    >
                      {item.address || "N/A"}
                    </TableCell>
                    <TableCell
                      className={classNames(
                        "font-mono text-sm",
                        myFont.className
                      )}
                    >
                      {item.amount || 0}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ModalBody>
          <ModalFooter>
            
            <Button 
              color="success" 
              onPress={hanldeTransfer}
            >
             <span className={classNames(myFont.className)}> Confirm Transfer</span>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }
);
