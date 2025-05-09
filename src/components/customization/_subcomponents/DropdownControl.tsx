"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Assuming this exists or will be created
import { ParameterHelpTooltip } from "./ParameterHelpTooltip";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface DropdownControlProps {
  id: string;
  label: string;
  options: DropdownOption[];
  selectedValue: string | undefined;
  onValueChange: (value: string) => void;
  onReset?: () => void;
  placeholder?: string;
  helpText?: string;
  disabled?: boolean;
  className?: string;
}

export function DropdownControl({
  id,
  label,
  options,
  selectedValue,
  onValueChange,
  onReset,
  placeholder = "Select an option",
  helpText,
  disabled = false,
  className,
}: DropdownControlProps) {
  return (
    <div className={`space-y-2 ${className || ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label htmlFor={id} className="text-base">
            {label}
          </Label>
          {helpText && (
            <ParameterHelpTooltip
              title={label}
              content={helpText}
              side="top"
              className="ml-1"
            />
          )}
        </div>
        {onReset && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onReset}
            disabled={disabled}
            className="h-7 w-7 self-start mt-1"
            aria-label={`Reset ${label}`}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
      <Select
        value={selectedValue || ""}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value} 
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
} 