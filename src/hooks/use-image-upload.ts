import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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
      // Generate a unique filename if no path provided
      const fileExtension = file.name.split('.').pop();
      const fileName = path || `${user.id}/${Date.now()}.${fileExtension}`;

      console.log('🔧 Uploading image:', {
        bucket,
        fileName,
        fileSize: file.size,
        fileType: file.type
      });

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('❌ Upload error:', error);
        toast({
          title: "Upload mislukt",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      console.log('✅ Upload successful:', {
        path: data.path,
        url: urlData.publicUrl
      });

      return {
        url: urlData.publicUrl,
        path: data.path
      };

    } catch (error) {
      console.error('❌ Upload error:', error);
      toast({
        title: "Upload mislukt",
        description: "Er is een fout opgetreden bij het uploaden van de afbeelding.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteImage = async (bucket: 'avatars' | 'media', path: string): Promise<boolean> => {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        console.error('❌ Delete error:', error);
        return false;
      }

      console.log('✅ Image deleted:', path);
      return true;
    } catch (error) {
      console.error('❌ Delete error:', error);
      return false;
    }
  };

  return {
    uploadImage,
    deleteImage,
    isUploading
  };
};