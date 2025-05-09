"use client";

import { useState, useEffect, ChangeEvent } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input"; // Assuming this exists or will be created
import { ParameterHelpTooltip } from "./ParameterHelpTooltip";
import { Button } from "@/components/ui/button"; // Added
import { RotateCcw } from "lucide-react"; // Added
import { cn } from "@/lib/utils";

interface NumericInputControlProps {
  id: string;
  label: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  onReset?: () => void; // Added
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  allowDecimals?: boolean;
  helpText?: string;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  validationMessage?: string | null;
}

export function NumericInputControl({
  id,
  label,
  value,
  onChange,
  onReset, // Added
  placeholder,
  min,
  max,
  step,
  allowDecimals = true,
  helpText,
  disabled = false,
  className,
  inputClassName,
  validationMessage,
}: NumericInputControlProps) {
  const [inputValue, setInputValue] = useState<string>(value !== undefined ? String(value) : "");
  const [currentValidationMessage, setCurrentValidationMessage] = useState<string | null>(validationMessage || null);

  useEffect(() => {
    setInputValue(value !== undefined ? String(value) : "");
  }, [value]);

  useEffect(() => {
    setCurrentValidationMessage(validationMessage || null);
  }, [validationMessage]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setInputValue(rawValue);
    setCurrentValidationMessage(null); // Clear validation on input change

    if (rawValue.trim() === "") {
      onChange(undefined);
      return;
    }

    const numValue = allowDecimals ? parseFloat(rawValue) : parseInt(rawValue, 10);

    if (isNaN(numValue)) {
      setCurrentValidationMessage("Please enter a valid number.");
      onChange(undefined); // Or keep previous valid value, depending on desired behavior
      return;
    }
    
    // Basic range validation if min/max are provided
    if (min !== undefined && numValue < min) {
      setCurrentValidationMessage(`Value must be ${min} or greater.`);
      // Optionally, clamp or reject value - for now, just show message
    }
    if (max !== undefined && numValue > max) {
      setCurrentValidationMessage(`Value must be ${max} or less.`);
      // Optionally, clamp or reject value
    }
    
    onChange(numValue);
  };
  
  const handleBlur = () => {
    // Re-validate or format on blur if needed
    if (inputValue.trim() === "") {
        onChange(undefined);
        return;
    }
    const numValue = allowDecimals ? parseFloat(inputValue) : parseInt(inputValue, 10);
    if (!isNaN(numValue)) {
        let validValue = numValue;
        if (min !== undefined && validValue < min) validValue = min;
        if (max !== undefined && validValue > max) validValue = max;
        if (value !== validValue) {
          onChange(validValue);
          setInputValue(String(validValue)); // Update input display if clamped
        }
    } else if (value !== undefined) {
        // If input is invalid but there was a previous valid value, revert
        setInputValue(String(value));
        setCurrentValidationMessage("Invalid input. Reverted to last valid value.");
    } else {
        setInputValue(""); // Clear if invalid and no prior value
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
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
            className="h-7 w-7 self-start mt-1" // Adjusted for alignment
            aria-label={`Reset ${label}`}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
      <Input
        type="number" // Using type=number for better semantics and potential browser UI
        id={id}
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        min={min} // HTML5 validation attributes
        max={max}
        step={step} // HTML5 validation attributes
        disabled={disabled}
        className={cn(
          inputClassName,
          currentValidationMessage ? "border-destructive focus-visible:ring-destructive" : ""
        )}
        aria-invalid={!!currentValidationMessage}
        aria-describedby={currentValidationMessage ? `${id}-error` : undefined}
      />
      {currentValidationMessage && (
        <p id={`${id}-error`} className="text-sm text-destructive mt-1">
          {currentValidationMessage}
        </p>
      )}
    </div>
  );
} 