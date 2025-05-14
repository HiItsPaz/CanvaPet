"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { KeyboardShortcutsHelp } from "@/components/ui/keyboard-shortcuts-help";
import { ShortcutAction, ShortcutConfig } from "@/lib/keyboardShortcuts";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

interface KeyboardShortcutsContextType {
  isShortcutsHelpOpen: boolean;
  openShortcutsHelp: () => void;
  closeShortcutsHelp: () => void;
  isEnabled: boolean;
  enableShortcuts: () => void;
  disableShortcuts: () => void;
  currentScope: ShortcutConfig['scope'];
  setScope: (scope: ShortcutConfig['scope']) => void;
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | undefined>(undefined);

export function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
  const [isShortcutsHelpOpen, setIsShortcutsHelpOpen] = useState(false);
  const router = useRouter();
  const { setTheme } = useTheme();
  
  // Initialize the shortcuts hook
  const { 
    isEnabled, 
    enableShortcuts, 
    disableShortcuts,
    currentScope,
    setScope,
  } = useKeyboardShortcuts({
    onShortcut: handleShortcutAction,
  });
  
  // Handle shortcut actions
  function handleShortcutAction(action: ShortcutAction) {
    switch (action) {
      // Navigation actions
      case 'navigate-home':
        router.push('/');
        break;
      case 'navigate-pets':
        router.push('/pets/new');
        break;
      case 'navigate-gallery':
        router.push('/profile/gallery');
        break;
      case 'navigate-profile':
        router.push('/profile');
        break;
      
      // Application actions
      case 'toggle-theme':
        setTheme(theme => theme === 'dark' ? 'light' : 'dark');
        break;
      case 'toggle-help':
        setIsShortcutsHelpOpen(prev => !prev);
        break;
      case 'focus-search':
        document.querySelector<HTMLInputElement>('input[type="search"]')?.focus();
        break;
      
      // The rest of the actions are handled by the components themselves
      // through their own useKeyboardShortcuts hooks
      default:
        break;
    }
  }
  
  const openShortcutsHelp = useCallback(() => {
    setIsShortcutsHelpOpen(true);
  }, []);
  
  const closeShortcutsHelp = useCallback(() => {
    setIsShortcutsHelpOpen(false);
  }, []);
  
  // Update context value
  const contextValue: KeyboardShortcutsContextType = {
    isShortcutsHelpOpen,
    openShortcutsHelp,
    closeShortcutsHelp,
    isEnabled,
    enableShortcuts,
    disableShortcuts,
    currentScope,
    setScope,
  };
  
  return (
    <KeyboardShortcutsContext.Provider value={contextValue}>
      {children}
      <KeyboardShortcutsHelp 
        isOpen={isShortcutsHelpOpen} 
        onClose={closeShortcutsHelp} 
      />
    </KeyboardShortcutsContext.Provider>
  );
}

// Custom hook to use the keyboard shortcuts context
export function useKeyboardShortcutsContext() {
  const context = useContext(KeyboardShortcutsContext);
  
  if (context === undefined) {
    throw new Error("useKeyboardShortcutsContext must be used within a KeyboardShortcutsProvider");
  }
  
  return context;
} 