import { cn } from '@/lib/utils';

const SewingMachineIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M19.3,7.2H17.2V5.1c0-0.6-0.4-1-1-1H7.7c-0.6,0-1,0.4-1,1v5H3.1c-0.6,0-1,0.4-1,1v4.1c0,0.6,0.4,1,1,1h1.1v2.1c0,0.6,0.4,1,1,1h11.7c0.6,0,1-0.4,1-1v-2.1h1.1c0.6,0,1-0.4,1-1V8.2C20.3,7.6,19.9,7.2,19.3,7.2z M10.8,9.1c-0.6,0-1-0.4-1-1s0.4-1,1-1s1,0.4,1,1S11.4,9.1,10.8,9.1z M15.2,10.1v2.1H8.7v-2.1H15.2z"/>
  </svg>
);


export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 text-xl font-black tracking-tight", className)}>
      <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20 border border-white/20">
        <SewingMachineIcon className="h-6 w-6" />
      </div>
      <span className="font-headline bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">ProductionTrack</span>
    </div>
  );
}
