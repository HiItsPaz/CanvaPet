"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Step } from "@/components/ui/step-indicator";

interface StepContextProps {
  steps: Step[];
  currentStep: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  goToNextStep: () => void;
  goToPrevStep: () => void;
  goToStep: (stepIndex: number) => void;
  setStepStatus: (stepIndex: number, status: Step["status"]) => void;
  resetSteps: () => void;
}

const StepContext = createContext<StepContextProps | undefined>(undefined);

interface StepProviderProps {
  children: ReactNode;
  initialSteps: Step[];
  initialStep?: number;
}

export function StepProvider({
  children,
  initialSteps,
  initialStep = 0,
}: StepProviderProps) {
  const [steps, setSteps] = useState<Step[]>(initialSteps);
  const [currentStep, setCurrentStep] = useState<number>(initialStep);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const goToNextStep = () => {
    if (!isLastStep) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const goToPrevStep = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
    }
  };

  const setStepStatus = (stepIndex: number, status: Step["status"]) => {
    setSteps((prevSteps) =>
      prevSteps.map((step, idx) =>
        idx === stepIndex ? { ...step, status } : step
      )
    );
  };

  const resetSteps = () => {
    setSteps(initialSteps);
    setCurrentStep(initialStep);
  };

  return (
    <StepContext.Provider
      value={{
        steps,
        currentStep,
        isFirstStep,
        isLastStep,
        goToNextStep,
        goToPrevStep,
        goToStep,
        setStepStatus,
        resetSteps,
      }}
    >
      {children}
    </StepContext.Provider>
  );
}

export function useStepContext() {
  const context = useContext(StepContext);
  if (context === undefined) {
    throw new Error("useStepContext must be used within a StepProvider");
  }
  return context;
}

// Custom hook for step navigation in multi-step forms/flows
export function useStepNavigation() {
  const {
    currentStep,
    isFirstStep,
    isLastStep,
    goToNextStep,
    goToPrevStep,
    goToStep,
  } = useStepContext();

  return {
    currentStep,
    isFirstStep,
    isLastStep,
    goToNextStep,
    goToPrevStep,
    goToStep,
  };
}

// Custom hook for managing step status
export function useStepStatus() {
  const { steps, setStepStatus } = useStepContext();

  return {
    steps,
    setStepStatus,
    // Helper functions for common status changes
    completeStep: (stepIndex: number) => setStepStatus(stepIndex, "completed"),
    errorStep: (stepIndex: number) => setStepStatus(stepIndex, "error"),
    resetStepStatus: (stepIndex: number) => setStepStatus(stepIndex, "pending"),
  };
} 