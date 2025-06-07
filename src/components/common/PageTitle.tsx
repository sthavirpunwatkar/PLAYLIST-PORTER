import type { ReactNode } from 'react';

interface PageTitleProps {
  children: ReactNode;
  className?: string;
}

export default function PageTitle({ children, className }: PageTitleProps) {
  return (
    <h1 className={`text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-headline mb-8 ${className ?? ''}`}>
      {children}
    </h1>
  );
}
