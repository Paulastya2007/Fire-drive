"use client";

import type React from 'react';
import { useState } from 'react';
import Image from 'next/image';
import { storage } from '@/lib/firebase';
import { ref, getDownloadURL } from 'firebase/storage';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  FileText,
  ImageIcon,
  VideoIcon,
  FileAudio, // Changed from AudioIcon
  ArchiveIcon,
  FileQuestion,
  Download,
  Trash2,
  Eye, // Preview Icon
  Loader2, // Loading spinner
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from 'lucide-react';
import FilePreviewDialog from './FilePreviewDialog'; // Import the new component

interface FileData {
  id: string;
  name: string;
  fullPath: string;
  size: number;
  contentType: string;
  timeCreated: string;
  downloadURL?: string;
}

interface FileItemProps {
  file: FileData;
  onDelete: (file: FileData) => void;
}

function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function getFileIcon(contentType: string): React.ReactNode {
  if (contentType.startsWith('image/')) {
    return <ImageIcon className="w-8 h-8 text-blue-500" />;
  }
  if (contentType.startsWith('video/')) {
    return <VideoIcon className="w-8 h-8 text-red-500" />;
  }
  if (contentType.startsWith('audio/')) {
    return <FileAudio className="w-8 h-8 text-purple-500" />; // Changed from AudioIcon
  }
  if (contentType === 'application/pdf' || contentType.includes('text')) {
    return <FileText className="w-8 h-8 text-gray-700" />;
  }
   if (contentType.includes('zip') || contentType.includes('archive')) {
    return <ArchiveIcon className="w-8 h-8 text-orange-500" />;
  }
  return <FileQuestion className="w-8 h-8 text-gray-500" />;
}

export default function FileItem({ file, onDelete }: FileItemProps) {
  const [isLoading, setIsLoading] = useState(false);
   const [isPreviewOpen, setIsPreviewOpen] = useState(false);
   const [previewUrl, setPreviewUrl] = useState<string | null>(null);
   const [previewType, setPreviewType] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      const url = file.downloadURL || await getDownloadURL(ref(storage, file.fullPath));
      // Create a temporary link to trigger download
      const link = document.createElement('a');
      link.href = url;
      // Fetching with credentials might be needed for secured URLs, but generally not for public download URLs
      // Add '?alt=media' to force download for some file types if direct link opens in browser
      link.target = '_blank'; // Open in new tab/window can sometimes help
      link.download = file.name; // Set the desired file name
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({
        title: 'Download Started',
        description: `Downloading "${file.name}"...`,
      });
    } catch (error: any) {
      console.error("Download failed:", error);
       let description = 'Could not download the file. Please try again.';
         if (error.code === 'storage/object-not-found') {
            description = 'File not found. It might have been deleted.';
         } else if (error.code === 'storage/unauthorized') {
             description = 'You do not have permission to download this file.';
         }
      toast({
        variant: "destructive",
        title: 'Download Failed',
        description: description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = async () => {
     if (!file.contentType.startsWith('image/') && !file.contentType.startsWith('video/') && !file.contentType.startsWith('audio/') && file.contentType !== 'application/pdf' && !file.contentType.startsWith('text/')) {
         toast({
            variant: "default",
            title: 'Preview Not Available',
            description: `Preview is not supported for ${file.contentType} files.`,
         });
         return;
     }

    setIsLoading(true);
    try {
        const url = file.downloadURL || await getDownloadURL(ref(storage, file.fullPath));
        setPreviewUrl(url);
        setPreviewType(file.contentType);
        setIsPreviewOpen(true);
    } catch (error: any) {
        console.error("Preview failed:", error);
         let description = 'Could not load preview. Please try again.';
         if (error.code === 'storage/object-not-found') {
            description = 'File not found. It might have been deleted.';
         } else if (error.code === 'storage/unauthorized') {
             description = 'You do not have permission to preview this file.';
         }
        toast({
            variant: "destructive",
            title: 'Preview Failed',
            description: description,
        });
    } finally {
        setIsLoading(false);
    }
  };


  return (
     <>
        <Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-md flex flex-col h-full">
          <CardHeader className="flex flex-row items-center justify-between p-3 pb-0 space-y-0">
             <div className="flex-shrink-0">
                {getFileIcon(file.contentType)}
             </div>
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">File options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                   <DropdownMenuItem onClick={handlePreview} disabled={isLoading}>
                      <Eye className="mr-2 h-4 w-4" />
                      <span>Preview</span>
                   </DropdownMenuItem>
                   <DropdownMenuItem onClick={handleDownload} disabled={isLoading}>
                      <Download className="mr-2 h-4 w-4" />
                      <span>Download</span>
                   </DropdownMenuItem>
                   <DropdownMenuSeparator />
                   <DropdownMenuItem onClick={() => onDelete(file)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                   </DropdownMenuItem>
                </DropdownMenuContent>
             </DropdownMenu>
          </CardHeader>
          <CardContent className="p-3 pt-2 flex-grow flex flex-col justify-center">
            <CardTitle className="text-sm font-medium leading-tight truncate" title={file.name}>
              {file.name}
            </CardTitle>
            {/* Optional: Add a brief description or date */}
            {/* <CardDescription className="text-xs text-muted-foreground mt-1">
                {new Date(file.timeCreated).toLocaleDateString()}
            </CardDescription> */}
          </CardContent>
          <CardFooter className="p-3 pt-1 text-xs text-muted-foreground">
            {formatBytes(file.size)}
          </CardFooter>
           {isLoading && (
                <div className="absolute inset-0 bg-card/80 flex items-center justify-center z-10">
                   <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
            )}
        </Card>

        <FilePreviewDialog
            isOpen={isPreviewOpen}
            onClose={() => setIsPreviewOpen(false)}
            fileUrl={previewUrl}
            fileType={previewType}
            fileName={file.name}
        />
     </>
  );
}
