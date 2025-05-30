import { useState, useEffect } from 'react';

/**
 * Debounces a value by the specified delay.
 * @param value The input value to debounce.
 * @param delay Delay in milliseconds before updating the debounced value.
 * @returns The debounced value.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
} 