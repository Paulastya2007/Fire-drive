"use client";

import type React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, X } from 'lucide-react';

interface FilePreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string | null;
  fileType: string | null;
  fileName: string;
}

export default function FilePreviewDialog({ isOpen, onClose, fileUrl, fileType, fileName }: FilePreviewDialogProps) {
  const renderPreviewContent = () => {
    if (!fileUrl || !fileType) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p>Loading preview...</p>
        </div>
      );
    }

    if (fileType.startsWith('image/')) {
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={fileUrl} alt={`Preview of ${fileName}`} className="max-w-full max-h-[70vh] object-contain mx-auto" />;
    }

    if (fileType.startsWith('video/')) {
      return <video controls src={fileUrl} className="max-w-full max-h-[70vh] mx-auto">Your browser does not support the video tag.</video>;
    }

     if (fileType.startsWith('audio/')) {
      return <audio controls src={fileUrl} className="w-full mt-4">Your browser does not support the audio element.</audio>;
    }

     if (fileType === 'application/pdf') {
        // Embedding PDF - might require browser support or a library for more robustness
        // Adjust height as needed
       return <iframe src={`${fileUrl}#view=fitH`} title={`Preview of ${fileName}`} className="w-full h-[70vh] border-0" />;
     }

     if (fileType.startsWith('text/')) {
        // Fetch and display text content - Simple approach
        // For large files, consider fetching chunks or using a dedicated viewer
         return <iframe src={fileUrl} title={`Preview of ${fileName}`} className="w-full h-[70vh] border bg-secondary" />;
     }

    // Fallback for unsupported types (already handled in FileItem, but good practice)
    return (
      <div className="flex flex-col items-center justify-center h-64 text-destructive">
        <AlertCircle className="h-8 w-8 mb-4" />
        <p>Preview not available for this file type.</p>
         <p className="text-sm text-muted-foreground">({fileType})</p>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[80vw] md:max-w-[70vw] lg:max-w-[60vw] xl:max-w-[50vw] max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b flex flex-row justify-between items-center">
          <DialogTitle className="truncate pr-8" title={fileName}>{fileName}</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
            </Button>
          </DialogClose>
        </DialogHeader>
        <div className="p-4 overflow-auto flex-grow flex items-center justify-center">
           {/* Render based on file type */}
            {renderPreviewContent()}
        </div>
        {/* Optional Footer for actions like download */}
        {/* <DialogFooter className="p-4 border-t">
            <Button onClick={onClose}>Close</Button>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
}
