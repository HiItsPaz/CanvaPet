"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

/**
 * A simple code block component for displaying code snippets
 */
export function CodeBlock({ code, language = 'tsx', className }: CodeBlockProps) {
  return (
    <div className={cn('rounded-md overflow-hidden', className)}>
      <pre className={cn(
        'p-4 text-sm overflow-auto bg-zinc-950 text-zinc-50',
        'dark:bg-black dark:text-zinc-50'
      )}>
        <code className={`language-${language}`}>
          {code.trim()}
        </code>
      </pre>
    </div>
  );
} 