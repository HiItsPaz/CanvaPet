import * as React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, helper, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white sm:text-sm ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : ""
          } ${className}`}
          ref={ref}
          {...props}
        />
        {error ? (
          <p className="mt-1 text-sm text-red-600 dark:text-red-500">{error}</p>
        ) : helper ? (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {helper}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input"; 