import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Sanitizes a filename to be safe for Firebase Storage
 * Removes or replaces unsafe characters that can cause InvalidKey errors
 */
export function sanitizeFilename(filename: string): string {
  // Get file extension
  const lastDotIndex = filename.lastIndexOf('.');
  const name = lastDotIndex > 0 ? filename.substring(0, lastDotIndex) : filename;
  const extension = lastDotIndex > 0 ? filename.substring(lastDotIndex) : '';
  
  // Replace unsafe characters with safe alternatives
  const safeName = name
    .normalize('NFD') // Normalize unicode characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace unsafe chars with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
  
  // Ensure the filename isn't empty
  const finalName = safeName || 'file';
  
  return finalName + extension.toLowerCase();
}
