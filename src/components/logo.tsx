import { cn } from '@/lib/utils';

const SewingMachineIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    fill="none"
    {...props}
  >
    {/* Body */}
    <path d="M20 35h60v40H20V35z" fill="#FF5252"/>
    <path d="M20 35v20h25V35H20z" fill="#FF5252"/>
    
    {/* Base */}
    <rect x="15" y="70" width="70" height="15" rx="2" fill="#FFD740"/>
    <rect x="20" y="85" width="60" height="5" fill="#FF5252"/>
    
    {/* Needle */}
    <rect x="22" y="55" width="4" height="10" fill="#3F51B5"/>
    <rect x="23" y="65" width="2" height="5" fill="#3F51B5"/>
    
    {/* Spools */}
    <rect x="55" y="20" width="10" height="15" fill="#4DB6AC"/>
    <rect x="70" y="20" width="10" height="15" fill="#BA68C8"/>
    <path d="M60 20v15M75 20v15" stroke="#FBC02D" strokeWidth="2"/>
    
    {/* Knobs */}
    <circle cx="70" cy="45" r="5" fill="#7E57C2"/>
    <circle cx="70" cy="60" r="5" fill="#FBC02D"/>
    
    {/* Detail */}
    <rect x="20" y="40" width="10" height="5" fill="#4DB6AC"/>
  </svg>
);


export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 text-xl font-black tracking-tight", className)}>
      <div className="flex size-10 items-center justify-center rounded-2xl bg-white shadow-lg border border-white/20 overflow-hidden">
        <SewingMachineIcon className="h-8 w-8" />
      </div>
      <span className="font-headline bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">ProductionTrack</span>
    </div>
  );
}
