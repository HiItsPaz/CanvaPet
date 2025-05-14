'use client';

import { useEffect, useState } from 'react';

type FormPersistenceOptions = {
  key: string;
  includes?: string[];
  excludes?: string[];
  storage?: Storage;
};

/**
 * Hook to persist form data in localStorage or sessionStorage
 * Prevents data loss when users navigate away from forms accidentally
 * 
 * @param options Configuration options
 * @returns Functions to save, load, and clear form data
 */
export function useFormPersistence<T extends Record<string, any>>(
  options: FormPersistenceOptions
) {
  const {
    key,
    includes,
    excludes,
    storage = typeof window !== 'undefined' ? window.localStorage : null,
  } = options;
  
  const [savedData, setSavedData] = useState<T | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load data on mount
  useEffect(() => {
    loadFormData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  /**
   * Filter object properties based on includes/excludes options
   */
  const filterData = (data: T): Partial<T> => {
    if (!data) return {};
    
    // Create a copy to avoid mutating the original
    let filteredData = { ...data };
    
    // If includes is provided, only keep those fields
    if (includes?.length) {
      const newData = {} as Partial<T>;
      
      includes.forEach(field => {
        if (field in filteredData) {
          // @ts-ignore - Dynamic property assignment
          newData[field] = filteredData[field];
        }
      });
      
      filteredData = newData as T;
    }
    
    // If excludes is provided, remove those fields
    if (excludes?.length) {
      excludes.forEach(field => {
        delete filteredData[field];
      });
    }
    
    return filteredData;
  };

  /**
   * Save form data to storage
   */
  const saveFormData = (data: T) => {
    if (!storage) return;
    
    try {
      const now = new Date();
      const filteredData = filterData(data);
      
      const persistedData = {
        data: filteredData,
        timestamp: now.toISOString(),
      };
      
      storage.setItem(key, JSON.stringify(persistedData));
      setLastSaved(now);
      setSavedData(data);
    } catch (error) {
      console.error('Error saving form data to storage:', error);
    }
  };

  /**
   * Load form data from storage
   */
  const loadFormData = (): T | null => {
    if (!storage) return null;
    
    try {
      const saved = storage.getItem(key);
      
      if (!saved) {
        return null;
      }
      
      const { data, timestamp } = JSON.parse(saved);
      setLastSaved(new Date(timestamp));
      setSavedData(data);
      
      return data;
    } catch (error) {
      console.error('Error loading form data from storage:', error);
      return null;
    }
  };

  /**
   * Clear saved form data
   */
  const clearFormData = () => {
    if (!storage) return;
    
    try {
      storage.removeItem(key);
      setSavedData(null);
      setLastSaved(null);
    } catch (error) {
      console.error('Error clearing form data from storage:', error);
    }
  };

  return {
    saveFormData,
    loadFormData,
    clearFormData,
    savedData,
    lastSaved,
    hasData: !!savedData,
  };
} 