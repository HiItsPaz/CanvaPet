"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Switch } from "@headlessui/react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [enabled, setEnabled] = useState(false);

  // Set the initial state once mounted
  useEffect(() => {
    setMounted(true);
    setEnabled(theme === "dark");
  }, [theme]);

  // Handle the toggle
  const toggleTheme = (checked: boolean) => {
    setEnabled(checked);
    setTheme(checked ? "dark" : "light");
  };

  // Prevent hydration issues
  if (!mounted) return null;

  return (
    <div className="flex items-center space-x-2">
      <Switch
        checked={enabled}
        onChange={toggleTheme}
        className={`${
          enabled ? "bg-primary-600" : "bg-gray-200 dark:bg-gray-700"
        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
      >
        <span className="sr-only">Toggle dark mode</span>
        <span
          className={`${
            enabled ? "translate-x-6" : "translate-x-1"
          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
        />
      </Switch>
      <span className="text-sm font-medium">
        {enabled ? "Dark" : "Light"} Mode
      </span>
    </div>
  );
} 