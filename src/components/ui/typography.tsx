import * as React from "react";

export interface TypographyProps {
  children: React.ReactNode;
  className?: string;
}

export function H1({
  children,
  className = "",
}: TypographyProps) {
  return (
    <h1
      className={`scroll-m-20 text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl font-display ${className}`}
    >
      {children}
    </h1>
  );
}

export function H2({
  children,
  className = "",
}: TypographyProps) {
  return (
    <h2
      className={`scroll-m-20 text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl font-display ${className}`}
    >
      {children}
    </h2>
  );
}

export function H3({
  children,
  className = "",
}: TypographyProps) {
  return (
    <h3
      className={`scroll-m-20 text-xl font-semibold tracking-tight sm:text-2xl ${className}`}
    >
      {children}
    </h3>
  );
}

export function H4({
  children,
  className = "",
}: TypographyProps) {
  return (
    <h4
      className={`scroll-m-20 text-lg font-semibold tracking-tight sm:text-xl ${className}`}
    >
      {children}
    </h4>
  );
}

export function P({
  children,
  className = "",
  ...props
}: TypographyProps & React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={`leading-7 text-base md:text-lg [&:not(:first-child)]:mt-6 ${className}`}
      {...props}
    >
      {children}
    </p>
  );
}

export function Lead({
  children,
  className = "",
}: TypographyProps) {
  return (
    <p
      className={`text-xl md:text-2xl text-gray-600 dark:text-gray-400 ${className}`}
    >
      {children}
    </p>
  );
}

export function Large({
  children,
  className = "",
}: TypographyProps) {
  return (
    <div
      className={`text-lg md:text-xl font-semibold ${className}`}
    >
      {children}
    </div>
  );
}

export function Small({
  children,
  className = "",
}: TypographyProps) {
  return (
    <small
      className={`text-sm md:text-base font-medium leading-none ${className}`}
    >
      {children}
    </small>
  );
}

export function Subtle({
  children,
  className = "",
}: TypographyProps) {
  return (
    <p
      className={`text-sm md:text-base text-gray-500 dark:text-gray-400 ${className}`}
    >
      {children}
    </p>
  );
} 