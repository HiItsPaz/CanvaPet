"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type StepStatus = "pending" | "active" | "completed" | "error";

export interface Step {
  id: string | number;
  label: string;
  status?: StepStatus;
  optional?: boolean;
}

export interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  orientation?: "horizontal" | "vertical";
  variant?: "numbered" | "icon" | "simple";
  showLabels?: boolean;
  size?: "sm" | "md" | "lg";
  onChange?: (stepIndex: number) => void;
  className?: string;
  aria?: {
    label?: string;
    completeLabel?: string;
    incompleteLabel?: string;
    errorLabel?: string;
    currentLabel?: string;
  };
}

export function StepIndicator({
  steps,
  currentStep,
  orientation = "horizontal",
  variant = "numbered",
  showLabels = true,
  size = "md",
  onChange,
  className,
  aria = {
    label: "Progress steps",
    completeLabel: "completed",
    incompleteLabel: "not completed",
    errorLabel: "error",
    currentLabel: "current step",
  },
}: StepIndicatorProps) {
  // Determine if steps are interactive (clickable)
  const isInteractive = !!onChange;

  // Size classes based on the size prop
  const sizeClasses = {
    sm: {
      container: "gap-2",
      step: "h-6 w-6 text-xs",
      line: "h-0.5 flex-1",
      verticalLine: "w-0.5 flex-1",
      label: "text-xs",
    },
    md: {
      container: "gap-3",
      step: "h-8 w-8 text-sm",
      line: "h-1 flex-1",
      verticalLine: "w-1 flex-1",
      label: "text-sm",
    },
    lg: {
      container: "gap-4",
      step: "h-10 w-10 text-base",
      line: "h-1 flex-1",
      verticalLine: "w-1 flex-1",
      label: "text-base",
    },
  };

  // Get status classes for a step
  const getStepStatusClasses = (status: StepStatus) => {
    switch (status) {
      case "completed":
        return "bg-primary text-primary-foreground border-primary";
      case "active":
        return "bg-primary text-primary-foreground border-primary border-2 ring-2 ring-primary/30";
      case "error":
        return "bg-destructive text-destructive-foreground border-destructive";
      default: // pending
        return "bg-muted text-muted-foreground border-muted-foreground/30";
    }
  };

  // Get line status classes
  const getLineStatusClasses = (index: number) => {
    if (index >= currentStep) {
      return "bg-muted-foreground/30";
    }
    return "bg-primary";
  };

  // Determine status for each step
  const getStepStatus = (index: number): StepStatus => {
    const status = steps[index]?.status;
    if (status) return status;

    if (index === currentStep) return "active";
    if (index < currentStep) return "completed";
    return "pending";
  };

  // Handle step click
  const handleStepClick = (index: number) => {
    if (isInteractive) {
      onChange(index);
    }
  };

  // Get appropriate ARIA attributes for a step
  const getStepAriaAttributes = (index: number, status: StepStatus) => {
    const stepNumber = index + 1;
    const totalSteps = steps.length;
    const ariaLabel = steps[index]?.label || `Step ${stepNumber}`;
    
    let ariaDescription;
    if (status === "completed") {
      ariaDescription = aria.completeLabel;
    } else if (status === "error") {
      ariaDescription = aria.errorLabel;
    } else if (status === "active") {
      ariaDescription = aria.currentLabel;
    } else {
      ariaDescription = aria.incompleteLabel;
    }
    
    return {
      role: "tab",
      "aria-label": `${ariaLabel}, ${ariaDescription}, step ${stepNumber} of ${totalSteps}`,
      "aria-selected": status === "active",
      "aria-current": status === "active" ? "step" as const : undefined,
      tabIndex: isInteractive ? 0 : -1,
    };
  };

  // Render horizontal step indicator
  const renderHorizontalStepIndicator = () => (
    <div
      role="tablist"
      aria-label={aria.label}
      className={cn(
        "flex w-full items-center justify-between",
        sizeClasses[size].container,
        className
      )}
    >
      {steps.map((step, index) => {
        const status = getStepStatus(index);
        const isLast = index === steps.length - 1;

        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-1">
              <motion.button
                type="button"
                className={cn(
                  "flex items-center justify-center rounded-full border",
                  sizeClasses[size].step,
                  getStepStatusClasses(status),
                  isInteractive ? "cursor-pointer" : "cursor-default"
                )}
                onClick={() => handleStepClick(index)}
                {...getStepAriaAttributes(index, status)}
                whileTap={isInteractive ? { scale: 0.95 } : {}}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <AnimatePresence mode="wait">
                  {status === "completed" ? (
                    <motion.span
                      key="completed"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Check className="h-4 w-4" />
                    </motion.span>
                  ) : variant === "numbered" ? (
                    <motion.span
                      key="number"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {index + 1}
                    </motion.span>
                  ) : null}
                </AnimatePresence>
              </motion.button>
              
              {showLabels && (
                <motion.span
                  className={cn(
                    sizeClasses[size].label,
                    status === "active"
                      ? "font-medium text-foreground"
                      : "text-muted-foreground",
                    step.optional && "italic"
                  )}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  {step.label}
                </motion.span>
              )}
            </div>
            
            {!isLast && (
              <motion.div
                className={cn(
                  "flex-1 transition-colors duration-300",
                  sizeClasses[size].line,
                  getLineStatusClasses(index)
                )}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  // Render vertical step indicator
  const renderVerticalStepIndicator = () => (
    <div
      role="tablist"
      aria-label={aria.label}
      className={cn(
        "flex flex-col items-start",
        sizeClasses[size].container,
        className
      )}
    >
      {steps.map((step, index) => {
        const status = getStepStatus(index);
        const isLast = index === steps.length - 1;

        return (
          <React.Fragment key={step.id}>
            <div className="flex items-center gap-3">
              <motion.button
                type="button"
                className={cn(
                  "flex items-center justify-center rounded-full border",
                  sizeClasses[size].step,
                  getStepStatusClasses(status),
                  isInteractive ? "cursor-pointer" : "cursor-default"
                )}
                onClick={() => handleStepClick(index)}
                {...getStepAriaAttributes(index, status)}
                whileTap={isInteractive ? { scale: 0.95 } : {}}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <AnimatePresence mode="wait">
                  {status === "completed" ? (
                    <motion.span
                      key="completed"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Check className="h-4 w-4" />
                    </motion.span>
                  ) : variant === "numbered" ? (
                    <motion.span
                      key="number"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {index + 1}
                    </motion.span>
                  ) : null}
                </AnimatePresence>
              </motion.button>
              
              {showLabels && (
                <motion.span
                  className={cn(
                    sizeClasses[size].label,
                    status === "active"
                      ? "font-medium text-foreground"
                      : "text-muted-foreground",
                    step.optional && "italic"
                  )}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  {step.label}
                </motion.span>
              )}
            </div>
            
            {!isLast && (
              <div className="flex items-center">
                <div className="ml-3.5 flex h-full">
                  <motion.div
                    className={cn(
                      "transition-colors duration-300",
                      sizeClasses[size].verticalLine,
                      getLineStatusClasses(index)
                    )}
                    initial={{ scaleY: 0, opacity: 0 }}
                    animate={{ scaleY: 1, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    style={{ height: "1.5rem" }}
                  />
                </div>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  return orientation === "horizontal"
    ? renderHorizontalStepIndicator()
    : renderVerticalStepIndicator();
} 