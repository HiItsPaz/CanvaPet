"use client";

import React from 'react';
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ViewportProvider } from "@/components/ui/layout-adaptation";
import { KeyboardShortcutsProvider } from "@/contexts/KeyboardShortcutsContext";
import { ProcessingStateProvider } from "@/components/ui/processing-state-provider";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <ViewportProvider>
          <KeyboardShortcutsProvider>
            <ProcessingStateProvider>{children}</ProcessingStateProvider>
          </KeyboardShortcutsProvider>
        </ViewportProvider>
      </AuthProvider>
    </ThemeProvider>
  );
} 