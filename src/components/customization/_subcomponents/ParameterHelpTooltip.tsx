"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface ParameterHelpTooltipProps {
  title: string;
  content: string | React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
}

export function ParameterHelpTooltip({
  title,
  content,
  side = "right",
  className,
}: ParameterHelpTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <button 
            className={`text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-full ${className}`}
            type="button"
            aria-label={`Help information for ${title}`}
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          <div className="space-y-2">
            <h5 className="font-medium">{title}</h5>
            <div className="text-sm opacity-90">{content}</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 