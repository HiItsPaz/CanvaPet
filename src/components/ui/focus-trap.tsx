import React, { useRef, useEffect } from 'react';

type FocusTrapProps = {
  children: React.ReactNode;
  isActive?: boolean;
  focusFirst?: boolean;
  returnFocusOnUnmount?: boolean;
  autoFocus?: boolean;
};

/**
 * FocusTrap component that traps focus within its children
 * Important for accessibility and keyboard navigation in modals/dialogs
 */
export function FocusTrap({
  children,
  isActive = true,
  focusFirst = true,
  returnFocusOnUnmount = true,
  autoFocus = true,
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Store the previously focused element when the trap mounts
  useEffect(() => {
    if (returnFocusOnUnmount && isActive) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }
    
    return () => {
      // Return focus to the previously focused element when the trap unmounts
      if (returnFocusOnUnmount && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isActive, returnFocusOnUnmount]);

  // Auto-focus the first focusable element when the trap becomes active
  useEffect(() => {
    if (!isActive || !autoFocus || !containerRef.current) return;
    
    const focusableElements = getFocusableElements(containerRef.current);
    
    if (focusableElements.length > 0) {
      if (focusFirst) {
        focusableElements[0].focus();
      }
    }
  }, [isActive, autoFocus, focusFirst]);

  // Handle tab key navigation to keep focus within the container
  useEffect(() => {
    if (!isActive || !containerRef.current) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      
      const focusableElements = getFocusableElements(containerRef.current!);
      if (focusableElements.length === 0) return;
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      // If shift+tab is pressed and first element is focused, move to last element
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
      // If tab is pressed and last element is focused, move to first element
      else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive]);

  // Prevent focus from leaving the trap when clicking outside
  useEffect(() => {
    if (!isActive || !containerRef.current) return;
    
    const handleFocusIn = (event: FocusEvent) => {
      if (
        containerRef.current && 
        event.target instanceof Node && 
        !containerRef.current.contains(event.target)
      ) {
        // Focus moved outside the container, pull it back in
        const focusableElements = getFocusableElements(containerRef.current);
        if (focusableElements.length > 0) {
          event.preventDefault();
          focusableElements[0].focus();
        }
      }
    };
    
    document.addEventListener('focusin', handleFocusIn);
    return () => {
      document.removeEventListener('focusin', handleFocusIn);
    };
  }, [isActive]);

  return (
    <div ref={containerRef} className="focus-trap">
      {children}
    </div>
  );
}

/**
 * Helper function to get all focusable elements within a container
 */
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  // This selector targets all common focusable elements
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    'area[href]',
    'audio[controls]',
    'video[controls]',
    'summary',
    'iframe',
    'object',
    'embed'
  ].join(',');
  
  const elements = Array.from(container.querySelectorAll(selector)) as HTMLElement[];
  
  // Filter out hidden elements and those with display: none or visibility: hidden
  return elements.filter(element => {
    const style = window.getComputedStyle(element);
    return !(
      style.display === 'none' || 
      style.visibility === 'hidden' ||
      element.offsetWidth === 0 ||
      element.offsetHeight === 0
    );
  });
}

export default FocusTrap; 