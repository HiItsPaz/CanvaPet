"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ParameterHelpTooltip } from "./ParameterHelpTooltip";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface ToggleControlProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  onReset?: () => void;
  helpText?: string;
  disabled?: boolean;
  className?: string;
}

export function ToggleControl({
  id,
  label,
  checked,
  onChange,
  onReset,
  helpText,
  disabled = false,
  className,
}: ToggleControlProps) {
  return (
    <div className={`flex items-center justify-between py-2 ${className || ''}`}>
      <div className="flex items-center gap-2">
        <Label htmlFor={id} className="text-base cursor-pointer">
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
      <div className="flex items-center gap-2">
        <Switch
          id={id}
          checked={checked}
          onCheckedChange={onChange}
          disabled={disabled}
        />
        {onReset && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onReset}
            disabled={disabled}
            className="h-7 w-7"
            aria-label={`Reset ${label}`}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
} 