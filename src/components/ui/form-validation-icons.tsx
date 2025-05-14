"use client";

import * as React from "react";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Icon } from "./icon";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export type ValidationState = "valid" | "invalid" | "warning" | "none";

interface ValidationIconProps {
  state: ValidationState;
  message?: string;
  className?: string;
  size?: "xs" | "sm" | "md";
  animate?: boolean;
}

/**
 * ValidationIcon component that displays an appropriate icon based on the validation state
 * of an input field or form control, with smooth animations between states.
 */
export function ValidationIcon({ 
  state, 
  message,
  className,
  size = "sm",
  animate = true
}: ValidationIconProps) {
  if (state === "none") return null;
  
  const getIcon = () => {
    switch (state) {
      case "valid":
        return (
          <Icon 
            icon={CheckCircle} 
            size={size} 
            className={cn("text-success", className)} 
            label={message || "Valid"} 
            labelHidden
          />
        );
      case "invalid":
        return (
          <Icon 
            icon={XCircle} 
            size={size} 
            className={cn("text-destructive", className)} 
            label={message || "Invalid"} 
            labelHidden
          />
        );
      case "warning":
        return (
          <Icon 
            icon={AlertTriangle} 
            size={size} 
            className={cn("text-warning", className)} 
            label={message || "Warning"} 
            labelHidden
          />
        );
      default:
        return null;
    }
  };

  // If animation is disabled, just return the icon
  if (!animate) {
    return getIcon();
  }

  // With animation enabled, wrap in AnimatePresence for smooth transitions
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={state}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
      >
        {getIcon()}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * FormInputValidation component that wraps an input field with validation icons
 * and styling based on the validation state, with smooth animations for state changes.
 */
export function FormInputValidation({
  children,
  state = "none",
  message,
  className,
  animate = true,
}: {
  children: React.ReactNode;
  state?: ValidationState;
  message?: string;
  className?: string;
  animate?: boolean;
}) {
  // Apply animation to the input border color based on validation state
  const getInputBorderClass = () => {
    switch (state) {
      case "valid":
        return "transition-colors duration-300 focus-within:ring-success focus-within:border-success";
      case "invalid":
        return "transition-colors duration-300 focus-within:ring-destructive focus-within:border-destructive";
      case "warning":
        return "transition-colors duration-300 focus-within:ring-warning focus-within:border-warning";
      default:
        return "";
    }
  };

  return (
    <div className={cn("relative", className, getInputBorderClass())}>
      {children}
      {state !== "none" && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <ValidationIcon state={state} message={message} animate={animate} />
        </div>
      )}
    </div>
  );
}

/**
 * ValidationMessage component for displaying validation messages with animations
 */
export function ValidationMessage({
  state,
  message,
  className,
}: {
  state: ValidationState;
  message?: string;
  className?: string;
}) {
  if (!message || state === "none") return null;

  const stateColorMap = {
    valid: "text-success",
    invalid: "text-destructive",
    warning: "text-warning",
  };

  const iconMap = {
    valid: CheckCircle,
    invalid: XCircle,
    warning: AlertTriangle,
  };

  return (
    <AnimatePresence mode="wait">
      <motion.p
        key={`${state}-${message}`}
        initial={{ opacity: 0, y: -5, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: 5, height: 0 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "text-xs flex items-center mt-1 gap-1",
          stateColorMap[state],
          className
        )}
      >
        <Icon icon={iconMap[state]} size="xs" />
        <span>{message}</span>
      </motion.p>
    </AnimatePresence>
  );
}

/**
 * useValidationState hook that provides a simple way to manage validation state
 * based on field value and validation rules.
 */
export function useValidationState(
  value: string,
  validators: {
    valid?: (value: string) => boolean;
    invalid?: (value: string) => boolean;
    warning?: (value: string) => boolean;
  },
  messages?: {
    valid?: string;
    invalid?: string;
    warning?: string;
  }
): {
  state: ValidationState;
  message: string | undefined;
} {
  const [state, setState] = React.useState<ValidationState>("none");
  const [message, setMessage] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    // Don't validate empty values (unless specified by the component)
    if (!value.trim()) {
      setState("none");
      setMessage(undefined);
      return;
    }

    if (validators.invalid && validators.invalid(value)) {
      setState("invalid");
      setMessage(messages?.invalid);
    } else if (validators.warning && validators.warning(value)) {
      setState("warning");
      setMessage(messages?.warning);
    } else if (validators.valid && validators.valid(value)) {
      setState("valid");
      setMessage(messages?.valid);
    } else {
      setState("none");
      setMessage(undefined);
    }
  }, [value, validators, messages]);

  return { state, message };
}

export default ValidationIcon; 