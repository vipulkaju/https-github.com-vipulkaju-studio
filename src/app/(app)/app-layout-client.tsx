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
  X,
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';

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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Logo } from '@/components/logo';
import { MachinesProvider } from '@/context/machines-context';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUser, useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';

const SewingMachineIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    fill="currentColor"
    {...props}
  >
    <path d="M20 35h60v40H20V35z M20 35v20h25V35H20z M15 70h70v15H15V70z M20 85h60v5H20V85z" />
    <rect x="22" y="55" width="4" height="10" />
    <rect x="23" y="65" width="2" height="5" />
    <rect x="55" y="20" width="10" height="15" />
    <rect x="70" y="20" width="10" height="15" />
    <circle cx="70" cy="45" r="5" />
    <circle cx="70" cy="60" r="5" />
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
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

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
    { href: '/production/new', label: 'New', icon: Plus, isAction: true },
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
              {user && (
                <div className="flex items-center gap-3 bg-white/40 px-3 py-1.5 rounded-full border border-white/60">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-[10px] font-bold text-foreground/70 truncate max-w-[120px]">
                      {user.email}
                    </span>
                  </div>
                  <Avatar className="h-8 w-8 border-2 border-primary/20">
                    <AvatarImage src={user.photoURL || ''} alt={user.email || ''} />
                    <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                      {user.email?.substring(0, 2).toUpperCase() || '??'}
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
              {logoutButton}
            </header>
            <main className="flex-1 p-4 pb-32">{children}</main>
            
            {/* Mobile Expandable FAB Menu */}
            <div className="no-print fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4">
              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 20 }}
                    className="flex flex-col items-end gap-3 mb-2"
                  >
                    {navItems.map((item, index) => (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setIsMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl backdrop-blur-xl border transition-all duration-300",
                            pathname.startsWith(item.href)
                              ? "bg-primary text-primary-foreground border-primary/50"
                              : "bg-white/80 text-foreground border-white/60 hover:bg-white"
                          )}
                        >
                          <span className="text-xs font-bold uppercase tracking-widest">{item.label}</span>
                          <item.icon className="h-5 w-5" />
                        </Link>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "h-16 w-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 border-4 border-white/40 backdrop-blur-xl",
                  isMenuOpen 
                    ? "bg-foreground text-background rotate-90" 
                    : "bg-primary text-primary-foreground"
                )}
              >
                {isMenuOpen ? <X className="h-8 w-8" /> : <Plus className="h-8 w-8" />}
              </motion.button>
            </div>

            {/* Backdrop for mobile menu */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsMenuOpen(false)}
                  className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[90]"
                />
              )}
            </AnimatePresence>
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
                  {user && (
                    <SidebarMenuItem className="px-2 pb-4">
                      <div className="flex items-center gap-3 p-2 rounded-2xl bg-white/40 border border-white/60">
                        <Avatar className="h-9 w-9 border-2 border-primary/20">
                          <AvatarImage src={user.photoURL || ''} alt={user.email || ''} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                            {user.email?.substring(0, 2).toUpperCase() || '??'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-xs font-bold text-foreground truncate">
                            {user.email?.split('@')[0]}
                          </span>
                          <span className="text-[10px] text-muted-foreground truncate">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </SidebarMenuItem>
                  )}
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
