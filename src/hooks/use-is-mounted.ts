"use client";

import { useEffect, useRef } from 'react';

/**
 * Hook to check if component is mounted.
 * Useful for preventing state updates after component unmount.
 * 
 * @returns {boolean} Whether component is mounted
 */
export function useIsMounted(): boolean {
  const isMounted = useRef(false);
  
  useEffect(() => {
    isMounted.current = true;
    
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  return isMounted.current;
}

export default useIsMounted; 