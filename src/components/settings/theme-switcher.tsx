'use client';

import { useTheme } from '@/context/theme-context';
import { themes } from '@/lib/themes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ThemeSwitcher() {
  const { theme: activeTheme, setTheme } = useTheme();

  return (
    <Card className="bg-card/80 backdrop-blur-lg border-white/10 shadow-xl">
      <CardHeader>
        <CardTitle>Select Theme</CardTitle>
        <CardDescription>
          Choose a color to apply it across the entire application.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {themes.map((theme) => (
            <div key={theme.name} className="flex flex-col items-center gap-2">
              <button
                type="button"
                className={cn(
                  'flex h-16 w-16 items-center justify-center rounded-full border-2 transition-all',
                  activeTheme === theme.name
                    ? 'border-foreground'
                    : 'border-transparent hover:border-foreground/50'
                )}
                style={{ backgroundColor: theme.color }}
                onClick={() => setTheme(theme.name)}
              >
                {activeTheme === theme.name && (
                  <Check className="h-8 w-8 text-white" style={{ mixBlendMode: 'difference' }} />
                )}
              </button>
              <span className="text-sm font-medium text-muted-foreground">{theme.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
