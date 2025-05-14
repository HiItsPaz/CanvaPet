"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  getAllShortcuts, 
  formatShortcutForDisplay, 
  getShortcutsByScope,
  ShortcutConfig 
} from '@/lib/keyboardShortcuts';
import { TabsList, TabsTrigger, Tabs, TabsContent } from './tabs';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Keyboard Shortcuts Help component displays available keyboard shortcuts in a dialog
 * Organized by category, with proper accessibility features
 */
export function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  const [activeTab, setActiveTab] = useState<string>("global");
  
  // Group shortcuts by scope
  const shortcutGroups = useMemo(() => {
    return {
      global: getShortcutsByScope('global'),
      navigation: getShortcutsByScope('navigation'),
      customization: getShortcutsByScope('customization'),
      gallery: getShortcutsByScope('gallery'),
    };
  }, []);
  
  // Close with Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="global">Global</TabsTrigger>
            <TabsTrigger value="navigation">Navigation</TabsTrigger>
            <TabsTrigger value="customization">Pet Customization</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
          </TabsList>
          
          <TabsContent value="global" className="space-y-4">
            <ShortcutList shortcuts={shortcutGroups.global} />
          </TabsContent>
          
          <TabsContent value="navigation" className="space-y-4">
            <ShortcutList shortcuts={shortcutGroups.navigation} />
          </TabsContent>
          
          <TabsContent value="customization" className="space-y-4">
            <ShortcutList shortcuts={shortcutGroups.customization} />
          </TabsContent>
          
          <TabsContent value="gallery" className="space-y-4">
            <ShortcutList shortcuts={shortcutGroups.gallery} />
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          <p>
            Keyboard shortcuts can be disabled in your profile settings. 
            Press <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded">?</kbd> anytime to open this help dialog.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper component to display a list of shortcuts
function ShortcutList({ shortcuts }: { shortcuts: ShortcutConfig[] }) {
  if (shortcuts.length === 0) {
    return <p>No shortcuts available for this section.</p>;
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      {shortcuts.map((shortcut, index) => (
        <div 
          key={index} 
          className="flex justify-between items-center p-2 rounded border border-gray-200 dark:border-gray-800"
        >
          <span className="font-medium">{shortcut.description}</span>
          <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono">
            {formatShortcutForDisplay(shortcut)}
          </kbd>
        </div>
      ))}
    </div>
  );
} 