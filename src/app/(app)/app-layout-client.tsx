'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Plus,
  ClipboardList,
  LogOut,
  Settings,
} from 'lucide-react';
import { signOut } from 'firebase/auth';

import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Logo } from '@/components/logo';
import { MachinesProvider } from '@/context/machines-context';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUser, useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';

const SewingMachineIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M19.3,7.2H17.2V5.1c0-0.6-0.4-1-1-1H7.7c-0.6,0-1,0.4-1,1v5H3.1c-0.6,0-1,0.4-1,1v4.1c0,0.6,0.4,1,1,1h1.1v2.1c0,0.6,0.4,1,1,1h11.7c0.6,0,1-0.4,1-1v-2.1h1.1c0.6,0,1-0.4,1-1V8.2C20.3,7.6,19.9,7.2,19.3,7.2z M10.8,9.1c-0.6,0-1-0.4-1-1s0.4-1,1-1s1,0.4,1,1S11.4,9.1,10.8,9.1z M15.2,10.1v2.1H8.7v-2.1H15.2z" />
  </svg>
);

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const auth = useAuth();
  const [hasMounted, setHasMounted] = React.useState(false);
  const [showGuestLogoutAlert, setShowGuestLogoutAlert] = React.useState(false);

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  React.useEffect(() => {
    if (hasMounted && !isUserLoading && !user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router, hasMounted]);

  const handleLogout = async () => {
    if (user?.isAnonymous) {
      setShowGuestLogoutAlert(true);
    } else if (auth) {
      await signOut(auth);
      router.replace('/login');
    }
  };

  const confirmGuestLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.replace('/login');
    }
    setShowGuestLogoutAlert(false);
  };


  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/machines', label: 'Machines', icon: SewingMachineIcon },
    { href: '/entries', label: 'Entries', icon: ClipboardList },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  const desktopNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/machines', label: 'Machines', icon: SewingMachineIcon },
    { href: '/entries', label: 'Production Entries', icon: ClipboardList },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  if (!hasMounted || isUserLoading || !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Logo />
      </div>
    );
  }

  const logoutButton = (
    <Button variant="ghost" size="icon" onClick={handleLogout}>
      <LogOut className="h-5 w-5" />
    </Button>
  );

  const desktopLogoutButton = (
     <SidebarMenuItem>
        <SidebarMenuButton
          onClick={handleLogout}
          tooltip={{ children: 'Logout' }}
        >
          <LogOut />
          <span>Logout</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
  )

  return (
    <>
      <AlertDialog open={showGuestLogoutAlert} onOpenChange={setShowGuestLogoutAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
            <AlertDialogDescription>
              You are signed in as a guest. Logging out will make your current data inaccessible. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmGuestLogout}
            >
              Log Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <TooltipProvider>
        {isMobile ? (
          <div className="flex flex-col min-h-screen bg-transparent">
            <header className="no-print flex h-20 items-center gap-4 border-none liquid-glass px-6 sticky top-4 z-50 mx-4 rounded-[2rem]">
              <Logo />
              <div className="flex-1" />
              {logoutButton}
            </header>
            <main className="flex-1 p-4 pb-32">{children}</main>
            <nav className="no-print fixed bottom-6 left-6 right-6 z-50 rounded-[2.5rem] border-none liquid-glass">
              <div className="grid grid-cols-4 h-20">
                {navItems.map((item) => {
                  const isActive =
                    (item.href === '/dashboard' && pathname === item.href) ||
                    (item.href !== '/dashboard' &&
                      pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex flex-col items-center justify-center gap-1 p-1 text-xs font-medium transition-colors',
                        isActive
                          ? 'text-primary'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>
        ) : (
          <SidebarProvider>
            <Sidebar className="no-print border-r-0 bg-transparent">
              <SidebarHeader className="pt-8 pb-4 px-6">
                <Logo />
              </SidebarHeader>
              <SidebarContent className="px-4">
                <SidebarMenu className="gap-2">
                  {desktopNavItems.map((item) => {
                    const isActive =
                      (item.href === '/dashboard' && pathname === item.href) ||
                      (item.href !== '/dashboard' &&
                        pathname.startsWith(item.href));
                    return (
                      <SidebarMenuItem key={item.href}>
                        <Link href={item.href}>
                          <SidebarMenuButton
                            isActive={isActive}
                            tooltip={{ children: item.label }}
                            className={cn(
                              "rounded-2xl transition-all duration-300 py-6 px-4",
                              isActive 
                                ? "bg-white/60 shadow-sm border border-white/80 text-primary font-bold" 
                                : "hover:bg-white/40 hover:text-foreground text-muted-foreground font-medium"
                            )}
                          >
                            <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "")} />
                            <span className="text-sm">{item.label}</span>
                          </SidebarMenuButton>
                        </Link>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarContent>
              <SidebarFooter className="p-4">
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={handleLogout}
                      tooltip={{ children: 'Logout' }}
                      className="rounded-2xl transition-all duration-300 py-6 px-4 hover:bg-destructive/10 hover:text-destructive text-muted-foreground font-medium"
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="text-sm">Logout</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarFooter>
            </Sidebar>
            <SidebarInset className="bg-transparent">
              <header className="no-print flex h-24 items-center gap-4 border-b-0 px-6 md:px-10">
                <SidebarTrigger className="bg-white/50 backdrop-blur-md border border-white/60 shadow-sm rounded-xl p-2 hover:bg-white/80 transition-all" />
                <div className="flex-1" />
              </header>
              <main className="flex-1 p-4 md:p-10 pt-0">{children}</main>
            </SidebarInset>
          </SidebarProvider>
        )}
      </TooltipProvider>
    </>
  );
}

export default function AppLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <MachinesProvider>
        <AppLayoutContent>{children}</AppLayoutContent>
      </MachinesProvider>
  );
}
