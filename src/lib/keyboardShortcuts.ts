/**
 * Keyboard Shortcuts Configuration
 * 
 * This file defines the keyboard shortcuts for the CanvaPet application.
 * It includes utilities for registering, handling, and documenting shortcuts.
 */

// Define shortcut action types
export type ShortcutAction = 
  // Navigation
  | 'navigate-home'
  | 'navigate-gallery'
  | 'navigate-pets'
  | 'navigate-profile'
  
  // Application
  | 'toggle-theme'
  | 'toggle-help'
  | 'toggle-menu'
  | 'focus-search'
  
  // Pet Customization
  | 'save-pet'
  | 'undo'
  | 'redo'
  | 'reset-customization'
  | 'toggle-fullscreen'
  
  // Gallery
  | 'previous-item'
  | 'next-item'
  | 'zoom-in'
  | 'zoom-out'
  | 'delete-item';

// Shortcut configuration type
export interface ShortcutConfig {
  key: string;
  description: string;
  action: ShortcutAction;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  scope?: 'global' | 'customization' | 'gallery' | 'navigation';
  disabled?: boolean;
}

// Define global shortcuts
export const GLOBAL_SHORTCUTS: ShortcutConfig[] = [
  // Navigation shortcuts
  {
    key: 'g h',
    description: 'Go to Home page',
    action: 'navigate-home',
    scope: 'navigation',
  },
  {
    key: 'g p',
    description: 'Go to Pets page',
    action: 'navigate-pets',
    scope: 'navigation',
  },
  {
    key: 'g g',
    description: 'Go to Gallery page',
    action: 'navigate-gallery',
    scope: 'navigation',
  },
  {
    key: 'g u',
    description: 'Go to Profile page',
    action: 'navigate-profile',
    scope: 'navigation',
  },
  
  // Application shortcuts
  {
    key: '/',
    description: 'Focus search',
    action: 'focus-search',
    scope: 'global',
  },
  {
    key: '?',
    description: 'Show keyboard shortcuts help',
    action: 'toggle-help',
    scope: 'global',
  },
  {
    key: 'd',
    description: 'Toggle dark/light theme',
    action: 'toggle-theme',
    ctrlKey: true,
    shiftKey: true,
    scope: 'global',
  },
  {
    key: 'Escape',
    description: 'Close modal or cancel current action',
    action: 'toggle-menu',
    scope: 'global',
  },
];

// Navigation shortcuts
export const NAVIGATION_SHORTCUTS: ShortcutConfig[] = [
  {
    key: 'g h',
    description: 'Go to Home page',
    action: 'navigate-home',
    scope: 'navigation',
  },
  {
    key: 'g p',
    description: 'Go to Pets page',
    action: 'navigate-pets',
    scope: 'navigation',
  },
  {
    key: 'g g',
    description: 'Go to Gallery page',
    action: 'navigate-gallery',
    scope: 'navigation',
  },
  {
    key: 'g u',
    description: 'Go to Profile page',
    action: 'navigate-profile',
    scope: 'navigation',
  },
];

// Pet customization shortcuts
export const CUSTOMIZATION_SHORTCUTS: ShortcutConfig[] = [
  {
    key: 's',
    description: 'Save customized pet',
    action: 'save-pet',
    ctrlKey: true,
    scope: 'customization',
  },
  {
    key: 'z',
    description: 'Undo last action',
    action: 'undo',
    ctrlKey: true,
    scope: 'customization',
  },
  {
    key: 'y',
    description: 'Redo last action',
    action: 'redo',
    ctrlKey: true,
    scope: 'customization',
  },
  {
    key: 'r',
    description: 'Reset customization',
    action: 'reset-customization',
    scope: 'customization',
  },
  {
    key: 'f',
    description: 'Toggle fullscreen mode',
    action: 'toggle-fullscreen',
    scope: 'customization',
  },
];

// Gallery shortcuts
export const GALLERY_SHORTCUTS: ShortcutConfig[] = [
  {
    key: 'ArrowLeft',
    description: 'View previous item',
    action: 'previous-item',
    scope: 'gallery',
  },
  {
    key: 'ArrowRight',
    description: 'View next item',
    action: 'next-item',
    scope: 'gallery',
  },
  {
    key: '+',
    description: 'Zoom in',
    action: 'zoom-in',
    scope: 'gallery',
  },
  {
    key: '-',
    description: 'Zoom out',
    action: 'zoom-out',
    scope: 'gallery',
  },
  {
    key: 'Delete',
    description: 'Delete current item',
    action: 'delete-item',
    scope: 'gallery',
  },
];

// Get all shortcuts
export const getAllShortcuts = (): ShortcutConfig[] => {
  return [
    ...GLOBAL_SHORTCUTS,
    ...NAVIGATION_SHORTCUTS,
    ...CUSTOMIZATION_SHORTCUTS,
    ...GALLERY_SHORTCUTS,
  ];
};

// Get shortcuts for a specific scope
export const getShortcutsByScope = (scope: ShortcutConfig['scope']): ShortcutConfig[] => {
  return getAllShortcuts().filter(shortcut => shortcut.scope === scope);
};

// Check if shortcuts are supported in the current environment
export const areKeyboardShortcutsSupported = (): boolean => {
  return typeof window !== 'undefined' && 'addEventListener' in window;
};

// Format shortcut for display
export const formatShortcutForDisplay = (shortcut: ShortcutConfig): string => {
  const parts: string[] = [];
  
  if (shortcut.ctrlKey) parts.push('Ctrl');
  if (shortcut.altKey) parts.push('Alt');
  if (shortcut.shiftKey) parts.push('Shift');
  if (shortcut.metaKey) parts.push('⌘');
  
  // Handle special keys and multi-key sequences
  const keyParts = shortcut.key.split(' ');
  
  keyParts.forEach((key, index) => {
    // Format special keys
    let formattedKey = key;
    
    if (key === 'ArrowLeft') formattedKey = '←';
    if (key === 'ArrowRight') formattedKey = '→';
    if (key === 'ArrowUp') formattedKey = '↑';
    if (key === 'ArrowDown') formattedKey = '↓';
    if (key === 'Escape') formattedKey = 'Esc';
    
    // Add formatted key
    parts.push(formattedKey);
    
    // Add separator between key sequence parts (not after last)
    if (index < keyParts.length - 1) {
      parts.push('then');
    }
  });
  
  return parts.join(' + ');
}; 