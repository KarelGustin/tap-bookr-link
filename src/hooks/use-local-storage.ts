import { useState, useEffect } from 'react';

const STORAGE_KEY = 'tapbookr_onboarding_draft_v1';

export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
};

export const useOnboardingDraft = () => {
  const [draft, setDraft] = useLocalStorage(STORAGE_KEY, null);

  const saveDraft = (data: any) => {
    setDraft({
      ...data,
      lastSaved: new Date().toISOString(),
    });
  };

  const clearDraft = () => {
    setDraft(null);
  };

  const hasUnsavedChanges = (currentData: any) => {
    if (!draft) return false;
    
    // Compare current data with draft (excluding metadata fields)
    const { lastSaved, ...draftData } = draft;
    const { lastSaved: _, ...currentDataClean } = currentData;
    
    return JSON.stringify(draftData) !== JSON.stringify(currentDataClean);
  };

  return {
    draft,
    saveDraft,
    clearDraft,
    hasUnsavedChanges,
  };
};
