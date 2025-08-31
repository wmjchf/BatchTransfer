"use client";
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";
import React,{useState, forwardRef, useImperativeHandle} from "react";

export interface IPreviewDataRef{
    open: (data: any[]) => void;
    close: () => void;
}

interface IPreviewDataProps{
   ref: React.RefObject<IPreviewDataRef>;
}
export const PreviewData = forwardRef<IPreviewDataRef, IPreviewDataProps>((props, ref) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [previewData, setPreviewData] = useState<any[]>([]);
    useImperativeHandle(ref, () => ({
        open: (data) => {
            setIsModalOpen(true);
            setPreviewData(data);
        },
        close: () => setIsModalOpen(false),
    }));
  return (
    <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3>Transfer Preview</h3>
          </ModalHeader>
          <ModalBody>
            <Table aria-label="Data preview table">
              <TableHeader>
                <TableColumn>ADDRESS</TableColumn>
                <TableColumn>AMOUNT</TableColumn>
              </TableHeader>
              <TableBody>
                {previewData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono text-sm">
                      {item.address || 'N/A'}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {item.amount || 0}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ModalBody>
          <ModalFooter>
            {/* <Button 
              color="danger" 
              variant="light" 
              onPress={handleCancelUpload}
            >
              Cancel
            </Button>
            <Button 
              color="primary" 
              onPress={handleConfirmUpload}
            >
              Confirm Upload
            </Button> */}
          </ModalFooter>
        </ModalContent>
      </Modal>
  );
});