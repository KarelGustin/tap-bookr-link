import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/integrations/firebase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { sanitizeFilename } from '@/lib/utils';

interface UploadResult {
  url: string;
  path: string;
}

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const uploadImage = async (
    file: File,
    bucket: 'avatars' | 'media',
    path?: string
  ): Promise<UploadResult | null> => {
    if (!user) {
      toast({
        title: "Fout",
        description: "Je moet ingelogd zijn om bestanden te uploaden.",
        variant: "destructive",
      });
      return null;
    }

    setIsUploading(true);

    try {
      // Sanitize the filename to prevent InvalidKey errors
      const sanitizedName = sanitizeFilename(file.name);
      const fileExtension = sanitizedName.split('.').pop();
      // Use user.id (which maps to user.uid in Firebase) for compatibility
      const userId = user.id;
      const fileName = path || `${userId}/${Date.now()}_${sanitizedName}`;
      const fullPath = `${bucket}/${fileName}`;

      console.log('🔧 Uploading image:', {
        bucket,
        fileName,
        fullPath,
        fileSize: file.size,
        fileType: file.type,
        originalName: file.name,
        sanitizedName
      });

      // Create storage reference
      const storageRef = ref(storage, fullPath);

      // Upload file to Firebase Storage
      const snapshot = await uploadBytes(storageRef, file, {
        contentType: file.type,
        customMetadata: {
          uploadedBy: user.id,
          originalName: file.name,
        }
      });

      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);

      console.log('✅ Upload successful:', {
        path: fullPath,
        url: downloadURL
      });

      return {
        url: downloadURL,
        path: fullPath
      };

    } catch (error: any) {
      console.error('❌ Upload error:', error);
      toast({
        title: "Upload mislukt",
        description: error.message || "Er is een fout opgetreden bij het uploaden.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadImage,
    isUploading,
  };
};
