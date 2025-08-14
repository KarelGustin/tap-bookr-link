import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseAutosaveOptions<T> {
  onSave: (data: T) => Promise<void>;
  debounceMs?: number;
  data: T;
  fieldName: string;
}

export const useAutosave = <T>({ onSave, debounceMs = 500, data, fieldName }: UseAutosaveOptions<T>) => {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  const save = useCallback(async () => {
    if (status === 'saving') return;

    setStatus('saving');
    try {
      await onSave(data);
      setStatus('saved');
      setLastSaved(new Date());
      
      // Reset to idle after 3 seconds
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      console.error(`Autosave failed for ${fieldName}:`, error);
      setStatus('error');
      
      // Show non-blocking toast with action data
      toast({
        title: "Kon niet opslaan",
        description: "Probeer opnieuw of sla handmatig op.",
        variant: "destructive",
      });
      
      // Reset to idle after 5 seconds
      setTimeout(() => setStatus('idle'), 5000);
    }
  }, [onSave, data, status, fieldName, toast]);

  const debouncedSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      save();
    }, debounceMs);
  }, [save, debounceMs]);

  const getStatusDisplay = () => {
    switch (status) {
      case 'saving':
        return { text: 'Opslaan…', icon: '•', className: 'text-blue-600' };
      case 'saved':
        return { text: 'Opgeslagen', icon: '✓', className: 'text-green-600' };
      case 'error':
        return { text: 'Kon niet opslaan', icon: '⚠', className: 'text-red-600' };
      default:
        return { text: '', icon: '', className: '' };
    }
  };

  const getRetryAction = () => {
    if (status === 'error') {
      return {
        label: 'Opnieuw proberen',
        onClick: save,
      };
    }
    return null;
  };

  return {
    status,
    lastSaved,
    save,
    debouncedSave,
    getStatusDisplay,
    getRetryAction,
  };
};
