"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { ShortcutConfig, formatShortcutForDisplay } from '@/lib/keyboardShortcuts';

interface KeyboardShortcutHintProps {
  shortcut: ShortcutConfig;
  className?: string;
  tooltip?: boolean;
  label?: string;
  inline?: boolean;
}

/**
 * Displays a keyboard shortcut hint next to an action
 * Can be shown as a tooltip or inline
 */
export function KeyboardShortcutHint({
  shortcut,
  className,
  tooltip = false,
  label,
  inline = false,
}: KeyboardShortcutHintProps) {
  const formattedShortcut = formatShortcutForDisplay(shortcut);
  
  // If tooltip, render with Tooltip component
  if (tooltip) {
    return (
      <div
        className={cn(
          "relative group",
          className
        )}
      >
        <kbd
          className={cn(
            "px-1.5 py-0.5 text-xs font-mono bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700",
            inline ? "ml-2 align-middle" : "block mt-1"
          )}
          aria-label={`Shortcut: ${label || shortcut.description} (${formattedShortcut})`}
        >
          {formattedShortcut}
        </kbd>
        
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          {label || shortcut.description}
        </div>
      </div>
    );
  }
  
  // Otherwise, render just the keyboard shortcut
  return (
    <kbd
      className={cn(
        "px-1.5 py-0.5 text-xs font-mono bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700",
        inline ? "ml-2 align-middle" : "block mt-1",
        className
      )}
      aria-label={`Shortcut: ${label || shortcut.description} (${formattedShortcut})`}
    >
      {formattedShortcut}
    </kbd>
  );
}

// Component for rendering a list of keyboard shortcuts
export function KeyboardShortcutList({ shortcuts }: { shortcuts: ShortcutConfig[] }) {
  if (!shortcuts.length) return null;
  
  return (
    <div className="flex flex-col space-y-1 text-sm">
      {shortcuts.map((shortcut, index) => (
        <div key={index} className="flex items-center justify-between">
          <span className="text-gray-700 dark:text-gray-300">{shortcut.description}</span>
          <KeyboardShortcutHint shortcut={shortcut} />
        </div>
      ))}
    </div>
  );
} 