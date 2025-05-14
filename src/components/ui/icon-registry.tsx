"use client"

import * as React from "react"
import * as LucideIcons from "lucide-react"
import { Icon } from "@/components/ui/icon"
import { forwardRef } from "react"
import { LucideIcon, LucideProps } from "lucide-react"

// Exclude the createLucideIcon function and other non-icon exports
const { createLucideIcon, ...icons } = LucideIcons

// Group icons by category for better organization
export const iconCategories: Record<string, string[]> = {
  action: [
    "Plus",
    "Minus", 
    "Edit", 
    "Trash", 
    "Trash2", 
    "Check", 
    "X", 
    "Copy", 
    "Download", 
    "Upload", 
    "RotateCw", 
    "RotateCcw",
    "Undo", 
    "Undo2", 
    "Redo", 
    "Redo2",
    "Refresh",
    "RefreshCw",
    "RefreshCcw",
    "Save",
    "Send",
    "Share",
    "Share2",
    "Search",
    "Zap",
  ],
  navigation: [
    "ChevronLeft", 
    "ChevronRight", 
    "ChevronUp", 
    "ChevronDown", 
    "ArrowLeft", 
    "ArrowRight", 
    "ArrowUp", 
    "ArrowDown",
    "Home",
    "Menu",
    "MoreHorizontal",
    "MoreVertical",
  ],
  status: [
    "AlertCircle", 
    "AlertTriangle", 
    "Check", 
    "CheckCircle", 
    "CheckCircle2", 
    "Info", 
    "HelpCircle", 
    "X", 
    "XCircle",
    "Loader",
    "Loader2",
  ],
  file: [
    "File", 
    "FileText", 
    "FilePlus", 
    "FileMinus", 
    "FileEdit", 
    "FileSearch", 
    "Folder", 
    "FolderPlus", 
    "FolderMinus", 
    "FolderOpen",
  ],
  media: [
    "Image", 
    "Camera", 
    "Video", 
    "Play", 
    "Pause", 
    "Square", 
    "Music", 
    "Volume", 
    "Volume1", 
    "Volume2", 
    "VolumeX",
  ],
  user: [
    "User", 
    "UserPlus", 
    "UserMinus", 
    "UserCheck", 
    "UserX", 
    "Users", 
    "Mail", 
    "Phone", 
    "Lock", 
    "Unlock", 
    "Shield", 
    "Key",
  ],
  device: [
    "Smartphone", 
    "Tablet", 
    "Laptop", 
    "Monitor", 
    "Tv", 
    "Printer", 
    "Battery", 
    "BatteryCharging", 
    "Wifi", 
    "Bluetooth",
  ],
  pet: [
    "Cat",
    "Dog", 
    "Bird",
  ],
  design: [
    "Palette", 
    "PaintBucket", 
    "Paintbrush", 
    "Wand2", 
    "Scissors", 
    "Pencil", 
    "Crop", 
    "Brush", 
    "Eraser",
  ],
  other: [], // Will be populated with uncategorized icons
}

// Create a map of all icons for easy access
export const iconMap = Object.fromEntries(
  Object.entries(icons).map(([name, icon]) => [name, icon])
) as Record<string, LucideIcons.LucideIcon>

// Fill the "other" category with any icons not already categorized
const categorizedIcons = new Set(
  Object.values(iconCategories).flat()
)

iconCategories.other = Object.keys(iconMap).filter(
  (name) => !categorizedIcons.has(name)
)

/**
 * Gets an icon by name
 * @param name The name of the icon from Lucide
 * @returns The icon component or undefined if not found
 */
export function getIcon(name: string): LucideIcons.LucideIcon | undefined {
  return iconMap[name]
}

/**
 * A component to render an icon by name
 */
export interface IconByNameProps extends Omit<React.ComponentProps<typeof Icon>, 'icon'> {
  name: string
  fallback?: React.ReactNode
}

export function IconByName({ name, fallback, ...props }: IconByNameProps) {
  const IconComponent = getIcon(name)
  
  if (!IconComponent) {
    if (fallback) return <>{fallback}</>
    console.warn(`Icon "${name}" not found`)
    return null
  }
  
  return <Icon icon={IconComponent} {...props} />
}

// A custom Google icon that follows the Lucide icon style
export const GoogleIcon: LucideIcon = forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        ref={ref}
        {...props}
      >
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
        <path d="M17.6396 12.0001C17.6396 11.4385 17.5873 10.8769 17.4828 10.3347H12.0001V13.302H15.1962C15.0394 14.1508 14.5654 14.8873 13.8638 15.3681V17.1735H16.2305C17.6919 15.8147 18.5001 14.0607 18.5001 11.9969" />
        <path d="M12.0001 18.5C14.0384 18.5 15.7749 17.7368 17.0618 16.4526L14.6951 14.6474C13.9935 15.1282 13.0814 15.4181 12.0001 15.4181C9.8001 15.4181 7.9524 13.9305 7.24727 11.94H4.80078V13.8073C6.08772 16.6274 8.83098 18.5 12.0001 18.5Z" />
        <path d="M7.24727 11.9401C6.9573 11.0291 6.9573 10.0564 7.24727 9.14536V7.27805H4.80078C3.68828 9.37568 3.68828 11.7098 4.80078 13.8074L7.24727 11.9401Z" />
        <path d="M12.0001 8.58213C13.0169 8.58213 13.9441 8.96855 14.6523 9.64824L16.7421 7.55846C15.2003 6.12088 13.6585 5.50018 12.0001 5.50018C8.83098 5.50018 6.08772 7.37273 4.80078 10.1929L7.24727 12.0602C7.9524 10.0697 9.8001 8.58213 12.0001 8.58213Z" />
      </svg>
    );
  }
);

GoogleIcon.displayName = 'GoogleIcon';

// Registry of custom brand icons
export const BrandIcons: Record<string, LucideIcon> = {
  Google: GoogleIcon,
};

export default BrandIcons; 