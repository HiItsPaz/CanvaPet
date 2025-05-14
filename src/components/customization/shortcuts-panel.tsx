"use client";

import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { CUSTOMIZATION_SHORTCUTS } from '@/lib/keyboardShortcuts';
import { KeyboardShortcutList } from '@/components/ui/keyboard-shortcut-hint';
import { useKeyboardShortcutsContext } from '@/contexts/KeyboardShortcutsContext';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { ShortcutAction } from '@/lib/keyboardShortcuts';

interface ShortcutsPanelProps {
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
}

/**
 * Displays available keyboard shortcuts for the pet customization interface
 * Also handles keyboard events specific to customization
 */
export function ShortcutsPanel({
  onSave,
  onUndo,
  onRedo,
  onReset,
  canUndo,
  canRedo,
  onToggleFullscreen,
  isFullscreen,
}: ShortcutsPanelProps) {
  const { setScope } = useKeyboardShortcutsContext();
  
  // Set customization scope when component mounts
  useEffect(() => {
    setScope('customization');
    
    // Reset to global scope when component unmounts
    return () => setScope('global');
  }, [setScope]);
  
  // Handle customization-specific shortcuts
  const handleShortcut = (action: ShortcutAction) => {
    switch (action) {
      case 'save-pet':
        onSave();
        break;
      case 'undo':
        if (canUndo) onUndo();
        break;
      case 'redo':
        if (canRedo) onRedo();
        break;
      case 'reset-customization':
        onReset();
        break;
      case 'toggle-fullscreen':
        onToggleFullscreen();
        break;
      default:
        break;
    }
  };
  
  // Use keyboard shortcuts hook for component-specific shortcuts
  useKeyboardShortcuts({
    scope: 'customization',
    onShortcut: handleShortcut,
    // Only allow customization shortcuts in this component
    allowedActions: ['save-pet', 'undo', 'redo', 'reset-customization', 'toggle-fullscreen'],
  });
  
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Keyboard Shortcuts</CardTitle>
        <CardDescription>
          Use these shortcuts to speed up your workflow
        </CardDescription>
      </CardHeader>
      <CardContent>
        <KeyboardShortcutList shortcuts={CUSTOMIZATION_SHORTCUTS} />
        
        <div className="mt-4 flex flex-wrap gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onSave}
            aria-label="Save pet"
          >
            Save
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onUndo}
            disabled={!canUndo}
            aria-label="Undo last action"
          >
            Undo
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onRedo}
            disabled={!canRedo}
            aria-label="Redo last action"
          >
            Redo
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onReset}
            aria-label="Reset customization"
          >
            Reset
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onToggleFullscreen}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 