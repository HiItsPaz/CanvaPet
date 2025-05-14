import { useEffect, useState, useCallback, useRef } from 'react';
import { ShortcutAction, ShortcutConfig, getAllShortcuts } from '@/lib/keyboardShortcuts';

type ShortcutHandler = (action: ShortcutAction) => void;
type ShortcutScope = ShortcutConfig['scope'];

interface UseKeyboardShortcutsOptions {
  scope?: ShortcutScope;
  enabled?: boolean;
  onShortcut?: ShortcutHandler;
  allowedActions?: ShortcutAction[];
}

/**
 * React hook for handling keyboard shortcuts
 * 
 * @param options Configuration options for keyboard shortcuts
 * @returns Object with functions to manage shortcuts
 */
export function useKeyboardShortcuts({
  scope = 'global',
  enabled = true,
  onShortcut,
  allowedActions,
}: UseKeyboardShortcutsOptions = {}) {
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [currentScope, setCurrentScope] = useState<ShortcutScope>(scope);
  const [currentSequence, setCurrentSequence] = useState<string[]>([]);
  const sequenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shortcuts = useRef(getAllShortcuts());
  
  // Handler for keyboard events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isEnabled) return;
    
    // Don't capture keyboard events when user is typing in form elements
    if (isTypingElement(document.activeElement)) {
      // Allow keyboard shortcuts with modifier keys even in input fields
      if (!(event.ctrlKey || event.metaKey || event.altKey)) {
        return;
      }
    }
    
    const key = event.key;
    
    // Update sequence for multi-key shortcuts
    if (sequenceTimeoutRef.current) {
      clearTimeout(sequenceTimeoutRef.current);
    }
    
    // Add key to sequence
    const newSequence = [...currentSequence, key];
    setCurrentSequence(newSequence);
    
    // Set timeout to clear sequence
    sequenceTimeoutRef.current = setTimeout(() => {
      setCurrentSequence([]);
    }, 1000); // Reset after 1 second of inactivity
    
    // Check if the key or sequence matches any registered shortcuts
    const matchedShortcut = findMatchingShortcut(
      newSequence,
      event.ctrlKey,
      event.altKey,
      event.shiftKey,
      event.metaKey
    );
    
    if (matchedShortcut) {
      // If this is a multi-key shortcut that's been fully entered, clear the sequence
      if (matchedShortcut.key.includes(' ')) {
        setCurrentSequence([]);
        if (sequenceTimeoutRef.current) {
          clearTimeout(sequenceTimeoutRef.current);
          sequenceTimeoutRef.current = null;
        }
      }
      
      // Check if the action is allowed
      if (allowedActions && !allowedActions.includes(matchedShortcut.action)) {
        return;
      }
      
      // Prevent default browser behavior for this shortcut
      event.preventDefault();
      
      // Call the shortcut handler
      onShortcut?.(matchedShortcut.action);
    }
  }, [isEnabled, currentSequence, onShortcut, allowedActions]);
  
  // Find a matching shortcut for the current key/sequence
  const findMatchingShortcut = (
    sequence: string[],
    ctrlKey: boolean,
    altKey: boolean,
    shiftKey: boolean,
    metaKey: boolean
  ): ShortcutConfig | undefined => {
    // For multi-key sequences
    const sequenceString = sequence.join(' ');
    
    // For single keys with modifiers
    const lastKey = sequence[sequence.length - 1];
    
    return shortcuts.current.find(shortcut => {
      // Skip disabled shortcuts
      if (shortcut.disabled) return false;
      
      // Check if scope matches
      if (shortcut.scope !== 'global' && shortcut.scope !== currentScope) {
        return false;
      }
      
      // Check for multi-key sequence match
      if (shortcut.key === sequenceString) {
        // For multi-key shortcuts, we don't check modifiers
        return true;
      }
      
      // Check for single key + modifier match
      if (
        shortcut.key === lastKey &&
        !!shortcut.ctrlKey === ctrlKey &&
        !!shortcut.altKey === altKey &&
        !!shortcut.shiftKey === shiftKey &&
        !!shortcut.metaKey === metaKey
      ) {
        return true;
      }
      
      return false;
    });
  };
  
  // Check if element is a typing element (input, textarea, etc.)
  const isTypingElement = (element: Element | null): boolean => {
    if (!element) return false;
    
    const tagName = element.tagName.toLowerCase();
    if (
      tagName === 'input' ||
      tagName === 'textarea' ||
      tagName === 'select'
    ) {
      return true;
    }
    
    // Check for contentEditable
    return element.hasAttribute('contenteditable') &&
      element.getAttribute('contenteditable') !== 'false';
  };
  
  // Set up event listeners
  useEffect(() => {
    if (isEnabled) {
      document.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      
      // Clear any pending sequence timeout
      if (sequenceTimeoutRef.current) {
        clearTimeout(sequenceTimeoutRef.current);
      }
    };
  }, [isEnabled, handleKeyDown]);
  
  // Update scope
  const setScope = useCallback((newScope: ShortcutScope) => {
    setCurrentScope(newScope);
  }, []);
  
  // Enable/disable shortcuts
  const enableShortcuts = useCallback(() => {
    setIsEnabled(true);
  }, []);
  
  const disableShortcuts = useCallback(() => {
    setIsEnabled(false);
  }, []);
  
  // Return the hook API
  return {
    isEnabled,
    currentScope,
    setScope,
    enableShortcuts,
    disableShortcuts,
  };
} 