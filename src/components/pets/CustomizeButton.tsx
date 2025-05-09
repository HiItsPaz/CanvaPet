"use client";

import { Button, ButtonProps } from "@/components/ui/button";
import { Paintbrush } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface CustomizeButtonProps extends ButtonProps {
  petId: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showIcon?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function CustomizeButton({
  petId,
  variant = "default",
  size = "default",
  showIcon = true,
  className,
  children,
  ...props
}: CustomizeButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/pets/${petId}/customize`);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={cn(className)}
      {...props}
    >
      {showIcon && <Paintbrush className="h-4 w-4 mr-2" />}
      {children || "Customize"}
    </Button>
  );
} 