"use client";

import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { ParameterHelpTooltip } from "./ParameterHelpTooltip";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface SliderControlProps {
  id: string;
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  onReset?: () => void;
  valueLabel?: (value: number) => string;
  helpText?: string;
  disabled?: boolean;
}

export function SliderControl({
  id,
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  onReset,
  valueLabel,
  helpText,
  disabled = false,
}: SliderControlProps) {
  const handleChange = (newValue: number[]) => {
    onChange(newValue[0]);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label htmlFor={id} className="text-base">
            {label}
          </Label>
          
          {helpText && (
            <ParameterHelpTooltip
              title={label}
              content={helpText}
              className="ml-1"
            />
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium w-12 text-right">
            {valueLabel ? valueLabel(value) : value}
          </span>
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
      
      <Slider
        id={id}
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={handleChange}
        disabled={disabled}
        className={disabled ? "opacity-50" : ""}
      />
    </div>
  );
} 