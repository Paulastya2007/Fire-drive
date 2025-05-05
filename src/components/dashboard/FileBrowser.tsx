"use client";

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { storage, db } from '@/lib/firebase';
import { ref, listAll, getDownloadURL, getMetadata, deleteObject } from 'firebase/storage';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import FileItem from './FileItem';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Folder, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import UploadDropzone from './UploadDropzone';

interface FileData {
  id: string; // Firestore document ID
  name: string;
  fullPath: string;
  size: number;
  contentType: string;
  timeCreated: string;
  downloadURL?: string; // Optional for direct download link caching
}

export default function FileBrowser() {
  const { user } = useAuth();
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchFiles = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const filesCollection = collection(db, 'files');
      const q = query(filesCollection, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);

      const userFiles: FileData[] = [];
      querySnapshot.forEach((doc) => {
        userFiles.push({ id: doc.id, ...doc.data() } as FileData);
      });

      // Optionally fetch download URLs immediately if needed frequently
      // Or fetch them on demand when clicking download/preview
      // Example: Fetching on load (can be slow for many files)
      // const filesWithUrls = await Promise.all(userFiles.map(async (file) => {
      //   try {
      //     const url = await getDownloadURL(ref(storage, file.fullPath));
      //     return { ...file, downloadURL: url };
      //   } catch (urlError) {
      //     console.error(`Error getting download URL for ${file.name}:`, urlError);
      //     return file; // Return file without URL if error occurs
      //   }
      // }));

      // setFiles(filesWithUrls);
      setFiles(userFiles);


    } catch (err: any) {
      console.error("Error fetching files:", err);
      setError("Failed to load files. Please try refreshing.");
       toast({
          variant: "destructive",
          title: 'Error Loading Files',
          description: 'Could not fetch your files. Please try again later.',
        });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]); // Rerun when fetchFiles changes (includes user dependency)

  const handleFileDelete = async (fileToDelete: FileData) => {
      if (!user) return;
       const confirmDelete = window.confirm(`Are you sure you want to delete "${fileToDelete.name}"? This action cannot be undone.`);
        if (!confirmDelete) {
            return;
        }

      try {
          // Delete from Firebase Storage
          const fileRef = ref(storage, fileToDelete.fullPath);
          await deleteObject(fileRef);

          // Delete from Firestore
          await deleteDoc(doc(db, "files", fileToDelete.id));

          // Update local state
          setFiles(files.filter(file => file.id !== fileToDelete.id));

          toast({
             title: 'File Deleted',
             description: `"${fileToDelete.name}" has been permanently deleted.`,
          });
      } catch (err: any) {
          console.error("Error deleting file:", err);
          let description = 'Could not delete the file. Please try again.';
          if (err.code === 'storage/object-not-found') {
              description = 'File not found in storage. It might have already been deleted.';
              // Attempt to delete Firestore record anyway if storage object not found
               try {
                    await deleteDoc(doc(db, "files", fileToDelete.id));
                     setFiles(files.filter(file => file.id !== fileToDelete.id)); // Update state even if storage failed
               } catch (fsError) {
                   console.error("Error deleting Firestore record after storage failure:", fsError);
               }
          } else if (err.code === 'storage/unauthorized') {
               description = 'You do not have permission to delete this file.';
          }
          toast({
             variant: "destructive",
             title: 'Deletion Failed',
             description: description,
          });
      }
  };

   const handleUploadSuccess = (uploadedFile: File) => {
    // Optimistically add a placeholder or re-fetch all files
    // Re-fetching is simpler for now
    fetchFiles();
   };

  const handleDrop = async (droppedFiles: File[]) => {
     if (!user) return;
     setLoading(true); // Indicate activity during upload

      const uploadPromises = droppedFiles.map(async (file) => {
           const filePath = `userFiles/${user.uid}/${Date.now()}_${file.name}`; // More unique path
            const fileRef = ref(storage, filePath);

            try {
                // No need for uploadBytesResumable for simple uploads unless progress is needed
                await uploadBytes(fileRef, file); // Use uploadBytes from 'firebase/storage'
                const metadata = await getMetadata(fileRef);

                // Add file metadata to Firestore
                await addDoc(collection(db, 'files'), {
                    userId: user.uid,
                    name: file.name,
                    fullPath: metadata.fullPath,
                    size: metadata.size,
                    contentType: metadata.contentType || 'application/octet-stream',
                    timeCreated: metadata.timeCreated,
                    createdAt: serverTimestamp(), // Use server timestamp
                });

                 return { success: true, name: file.name };
            } catch (uploadError: any) {
                console.error(`Error uploading ${file.name}:`, uploadError);
                 return { success: false, name: file.name, error: uploadError.message };
            }

      });

       const results = await Promise.all(uploadPromises);
        const successfulUploads = results.filter(r => r.success).length;
        const failedUploads = results.filter(r => !r.success);

        if (successfulUploads > 0) {
             toast({
                 title: `${successfulUploads} File(s) Uploaded`,
                 description: 'Your file(s) have been successfully uploaded.',
             });
             fetchFiles(); // Refresh the file list
        }

        if (failedUploads.length > 0) {
             toast({
                 variant: "destructive",
                 title: `Failed to Upload ${failedUploads.length} File(s)`,
                 description: `Could not upload: ${failedUploads.map(f => f.name).join(', ')}. Please try again.`,
             });
        }
       setLoading(false); // Stop loading indicator
  };


  if (loading && files.length === 0) { // Show skeleton only on initial load
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4 h-full overflow-y-auto">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="flex flex-col items-center space-y-2">
            <Skeleton className="h-16 w-16 rounded-md" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
          <Alert variant="destructive" className="max-w-md">
             <AlertCircle className="h-4 w-4" />
             <AlertTitle>Error</AlertTitle>
             <AlertDescription>{error}</AlertDescription>
         </Alert>
      </div>
    );
  }

  return (
     <UploadDropzone onDrop={handleDrop} className="h-full flex flex-col">
          {files.length === 0 && !loading ? (
               <div className="flex flex-col items-center justify-center flex-grow text-center p-10 text-muted-foreground">
                 <Folder size={64} className="mb-4 opacity-50" />
                 <p className="text-lg font-medium">Your drive is empty</p>
                 <p className="text-sm">Drop files here or use the upload button to get started.</p>
               </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4 overflow-y-auto flex-grow">
                  {files.map(file => (
                    <FileItem key={file.id} file={file} onDelete={handleFileDelete} />
                  ))}
                </div>
            )}
     </UploadDropzone>
  );
}

// Need to import uploadBytes
import { uploadBytes } from 'firebase/storage';
