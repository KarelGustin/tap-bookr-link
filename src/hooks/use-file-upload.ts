import { useState, useCallback } from 'react';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface CompressedFile {
  file: File;
  originalSize: number;
  compressedSize: number;
  format: 'webp' | 'jpg';
}

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({ loaded: 0, total: 0, percentage: 0 });

  const compressImage = useCallback(async (
    file: File, 
    maxWidth: number = 2000, 
    maxSizeKB: number = 300
  ): Promise<CompressedFile> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        try {
          // Calculate new dimensions maintaining aspect ratio
          let { width, height } = img;
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          // Draw and compress
          ctx?.drawImage(img, 0, 0, width, height);

          // Try WebP first, fallback to JPG
          const tryWebP = () => {
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
                    type: 'image/webp',
                    lastModified: Date.now(),
                  });

                  if (blob.size <= maxSizeKB * 1024) {
                    resolve({
                      file: compressedFile,
                      originalSize: file.size,
                      compressedSize: blob.size,
                      format: 'webp',
                    });
                  } else {
                    // WebP too large, try JPG
                    tryJPG();
                  }
                } else {
                  tryJPG();
                }
              },
              'image/webp',
              0.8
            );
          };

          const tryJPG = () => {
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                  });

                  resolve({
                    file: compressedFile,
                    originalSize: file.size,
                    compressedSize: blob.size,
                    format: 'jpg',
                  });
                } else {
                  reject(new Error('Failed to compress image'));
                }
              },
              'image/jpeg',
              0.8
            );
          };

          tryWebP();
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const uploadFile = useCallback(async (
    file: File,
    bucket: string,
    path: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> => {
    setIsUploading(true);
    setProgress({ loaded: 0, total: file.size, percentage: 0 });

    try {
      // Simulate upload progress (replace with actual upload logic)
      const simulateProgress = () => {
        let loaded = 0;
        const interval = setInterval(() => {
          loaded += file.size / 20;
          if (loaded >= file.size) {
            loaded = file.size;
            clearInterval(interval);
          }
          
          const progressData = {
            loaded,
            total: file.size,
            percentage: Math.round((loaded / file.size) * 100),
          };
          
          setProgress(progressData);
          onProgress?.(progressData);
        }, 100);
      };

      simulateProgress();

      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Return mock URL (replace with actual upload)
      const mockUrl = `https://example.com/${bucket}/${path}`;
      
      setIsUploading(false);
      setProgress({ loaded: 0, total: 0, percentage: 0 });
      
      return mockUrl;
    } catch (error) {
      setIsUploading(false);
      setProgress({ loaded: 0, total: 0, percentage: 0 });
      throw error;
    }
  }, []);

  return {
    isUploading,
    progress,
    compressImage,
    uploadFile,
  };
};
