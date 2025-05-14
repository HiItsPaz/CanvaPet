'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AnimatedAuthContainerProps {
  children: ReactNode;
  title: string;
  description?: string;
  footer?: ReactNode;
  className?: string;
}

export function AnimatedAuthContainer({
  children,
  title,
  description,
  footer,
  className,
}: AnimatedAuthContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn('w-full max-w-md mx-auto', className)}
    >
      <Card className="border-none shadow-lg">
        <CardHeader>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <CardTitle className="text-2xl font-bold text-center">{title}</CardTitle>
          </motion.div>
          {description && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <CardDescription className="text-center">{description}</CardDescription>
            </motion.div>
          )}
        </CardHeader>
        <CardContent>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {children}
          </motion.div>
        </CardContent>
        {footer && (
          <CardFooter>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="w-full"
            >
              {footer}
            </motion.div>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
} 