"use client";

import type React from 'react';
import { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { storage, db } from '@/lib/firebase';
import { ref, uploadBytesResumable, getMetadata } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { UploadCloud, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input'; // Using Input for file selection

interface UploadButtonProps {
  onUploadSuccess: (file: File) => void;
}

export default function UploadButton({ onUploadSuccess }: UploadButtonProps) {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && user) {
      handleUpload(file);
    }
    // Reset file input to allow uploading the same file again
     if (fileInputRef.current) {
       fileInputRef.current.value = '';
     }
  };

  const handleUpload = (file: File) => {
    if (!user) {
         toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to upload files." });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    const filePath = `userFiles/${user.uid}/${Date.now()}_${file.name}`; // More unique path
    const fileRef = ref(storage, filePath);
    const uploadTask = uploadBytesResumable(fileRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        // Progress function
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        // Error function
        console.error("Upload failed:", error);
         let description = 'An unexpected error occurred during upload.';
         if (error.code) {
             switch (error.code) {
                 case 'storage/unauthorized':
                     description = 'Permission denied. Please check your storage rules.';
                     break;
                 case 'storage/canceled':
                     description = 'Upload canceled.';
                     break;
                 case 'storage/unknown':
                 default:
                      description = `Upload error: ${error.message}`;
                      break;
             }
         }
        setUploadError(description);
        setIsUploading(false);
         toast({
             variant: "destructive",
             title: 'Upload Failed',
             description: description,
           });
      },
      async () => {
        // Complete function
        try {
            const metadata = await getMetadata(fileRef);

             // Add file metadata to Firestore
            await addDoc(collection(db, 'files'), {
                userId: user.uid,
                name: file.name,
                fullPath: metadata.fullPath,
                size: metadata.size,
                contentType: metadata.contentType || 'application/octet-stream', // Default if undefined
                timeCreated: metadata.timeCreated,
                 createdAt: serverTimestamp(), // Use server timestamp
            });

             toast({
                 title: 'Upload Successful',
                 description: `"${file.name}" uploaded successfully.`,
                 action: <CheckCircle className="text-green-500" />,
             });
             onUploadSuccess(file); // Notify parent component

        } catch (dbError: any) {
             console.error("Error saving file metadata:", dbError);
             setUploadError('File uploaded, but failed to save metadata.');
              toast({
                variant: "destructive",
                title: 'Metadata Error',
                description: 'File uploaded, but failed to save details. Please try refreshing.',
              });
        } finally {
             setIsUploading(false);
             setUploadProgress(100); // Ensure progress bar shows complete
             // Optional: Reset progress after a delay
             setTimeout(() => setUploadProgress(0), 2000);
        }
      }
    );
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
       {/* Hidden file input */}
       <Input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            aria-hidden="true"
        />
       {/* Visible Button */}
      <Button onClick={triggerFileInput} disabled={isUploading}>
        {isUploading ? (
            <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
            </>
        ) : (
             <>
                <UploadCloud className="mr-2 h-4 w-4" />
                Upload File
             </>
        )}
      </Button>

       {/* Optional: Display progress bar during upload */}
       {isUploading && uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full mt-2">
                <Progress value={uploadProgress} className="w-full h-2" />
                 <p className="text-xs text-muted-foreground text-center mt-1">{Math.round(uploadProgress)}%</p>
            </div>
       )}
        {/* Optional: Display error message inline */}
        {uploadError && !isUploading && (
             <p className="text-xs text-destructive mt-1 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" /> {uploadError}
             </p>
        )}
    </>
  );
}
