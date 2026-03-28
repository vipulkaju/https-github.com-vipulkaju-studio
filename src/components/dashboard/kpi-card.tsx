import type { ElementType } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface KpiCardProps {
  title: string;
  icon: ElementType;
  className?: string;
  onClick?: () => void;
  href?: string;
}

export function KpiCard({ title, icon: Icon, className, onClick, href }: KpiCardProps) {
  const content = (
     <div className="flex flex-col items-center justify-center text-center gap-4 p-6 h-full relative z-10">
        <div className="bg-primary/10 p-5 rounded-[2rem] group-hover:bg-primary group-hover:text-white transition-all duration-500 animate-float shadow-inner border border-primary/20">
          <Icon className="h-10 w-10 text-primary group-hover:text-white transition-colors duration-500" />
        </div>
        <h3 className="text-xs font-black font-headline text-foreground/80 leading-tight uppercase tracking-widest">{title}</h3>
    </div>
  );

  const cardClasses = cn(
    "glass-card group aspect-square flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2",
    className,
    !onClick && !href ? "cursor-default" : ""
  );
  
  const backgroundDecoration = (
    <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />
  );
  
  if (href) {
    return <Link href={href} className={cn(cardClasses, "no-underline")}>{backgroundDecoration}{content}</Link>;
  }

  if (onClick) {
    return <button type="button" onClick={onClick} className={cn(cardClasses, "w-full text-left")}>{backgroundDecoration}{content}</button>;
  }

  return <div className={cn(cardClasses)}>{backgroundDecoration}{content}</div>;
}
