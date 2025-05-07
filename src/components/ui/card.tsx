import * as React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outline" | "ghost";
}

export function Card({
  className = "",
  variant = "default",
  ...props
}: CardProps) {
  const variantClasses = {
    default: "bg-white dark:bg-gray-800 shadow-md",
    outline: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
    ghost: "bg-transparent",
  };

  return (
    <div
      className={`rounded-lg p-6 ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardHeader({
  className = "",
  ...props
}: CardHeaderProps) {
  return <div className={`mb-4 ${className}`} {...props} />;
}

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export function CardTitle({
  className = "",
  ...props
}: CardTitleProps) {
  return (
    <h3
      className={`text-xl font-semibold leading-none tracking-tight text-gray-900 dark:text-white ${className}`}
      {...props}
    />
  );
}

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function CardDescription({
  className = "",
  ...props
}: CardDescriptionProps) {
  return (
    <p
      className={`text-sm text-gray-500 dark:text-gray-400 ${className}`}
      {...props}
    />
  );
}

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardContent({
  className = "",
  ...props
}: CardContentProps) {
  return <div className={`py-2 ${className}`} {...props} />;
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardFooter({
  className = "",
  ...props
}: CardFooterProps) {
  return (
    <div
      className={`mt-4 flex items-center pt-2 ${className}`}
      {...props}
    />
  );
} 