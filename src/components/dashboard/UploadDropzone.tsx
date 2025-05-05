"use client";

import type React from 'react';
import { useState, useCallback } from 'react';
import { cn } from "@/lib/utils";
import { UploadCloud } from 'lucide-react';

interface UploadDropzoneProps extends React.HTMLAttributes<HTMLDivElement> {
  onDrop: (files: File[]) => void;
  children?: React.ReactNode; // Allow children to be passed
}

export default function UploadDropzone({ onDrop, children, className, ...props }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Check if the leave event target is outside the dropzone bounds
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
       return; // Still inside, maybe moving over a child element
    }
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // You can add visual feedback here if needed
    e.dataTransfer.dropEffect = 'copy'; // Show a copy cursor
    setIsDragging(true); // Ensure dragging state is true
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files && files.length > 0) {
      onDrop(files);
      e.dataTransfer.clearData(); // Clean up
    }
  }, [onDrop]);

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn(
        "relative border-2 border-dashed border-border rounded-lg transition-colors duration-200 ease-in-out w-full h-full",
        isDragging ? "border-primary bg-accent/50" : "bg-transparent hover:border-muted-foreground/50",
        className // Allow overriding classes
      )}
      {...props}
    >
       {/* Overlay shown during drag */}
       {isDragging && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg pointer-events-none">
           <UploadCloud className="w-16 h-16 text-primary mb-4 animate-pulse" />
           <p className="text-lg font-semibold text-primary">Drop files to upload</p>
        </div>
      )}
       {/* Render children normally */}
      {!isDragging && children}
      {/* Render children dimmed if dragging, but still present */}
      {isDragging && <div className="opacity-50">{children}</div>}
    </div>
  );
}
