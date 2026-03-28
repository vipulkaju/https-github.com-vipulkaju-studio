import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, children, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row min-h-24 sm:items-center justify-between gap-4 px-6 sm:px-8 py-6 liquid-glass rounded-[2.5rem] mb-6 shadow-sm border-white/80", className)}>
      <div className="flex flex-col gap-1">
        <h1 className="font-headline text-2xl font-black tracking-tight md:text-4xl text-foreground/90">
          {title}
        </h1>
        {subtitle && <p className="text-sm font-medium text-muted-foreground">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto justify-start sm:justify-end">{children}</div>}
    </div>
  );
}
