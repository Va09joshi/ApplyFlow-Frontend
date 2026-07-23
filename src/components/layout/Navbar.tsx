"use client";

import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Moon, Sun, LayoutDashboard, LogOut, Menu } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const logoutState = useAuthStore((state) => state.logout);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    setMobileMenuOpen(false);
    // Fire and forget the backend logout
    api.post('/api/v1/auth/logout').catch(() => {});
    // Instantly clear local state and redirect for immediate feedback
    logoutState();
    router.push('/login');
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="font-bold text-xl tracking-tight">
            ApplyFlow <span className="text-primary">AI</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link href="/#features" className="hover:text-foreground transition-colors">
            Features
          </Link>
          <Link href="/#pricing" className="hover:text-foreground transition-colors">
            Pricing
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          )}
          <div className="flex items-center gap-2">
            {mounted && accessToken ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full border border-border p-0">
                    <Avatar className="h-9 w-9 border-2 border-primary/20">
                      <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                        {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
                      <p className="text-xs leading-none text-muted-foreground truncate">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/dashboard')} className="cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login" className={buttonVariants({ variant: "ghost" })}>
                  Log in
                </Link>
                <Link href="/signup" className={buttonVariants()}>
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation Toggle */}
        <div className="md:hidden flex items-center gap-2">
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          )}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="text-left font-bold text-xl tracking-tight">
                  ApplyFlow <span className="text-primary">AI</span>
                </SheetTitle>
              </SheetHeader>
              
              <div className="flex flex-col gap-10 mt-10">
                <nav className="flex flex-col gap-6 text-xl font-bold tracking-tight px-2">
                  <Link href="/#features" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary transition-colors">
                    Features
                  </Link>
                  <Link href="/#pricing" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary transition-colors">
                    Pricing
                  </Link>
                </nav>

                <div className="flex flex-col gap-2 pt-6 border-t border-border/50">
                  {mounted && accessToken ? (
                    <>
                      <div className="flex items-center gap-4 mb-4 p-2">
                        <Avatar className="h-12 w-12 border border-border">
                          <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                            {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-bold text-base">{user?.name || 'User'}</span>
                          <span className="text-sm text-muted-foreground truncate w-48 font-medium">{user?.email}</span>
                        </div>
                      </div>
                      <Button onClick={() => { setMobileMenuOpen(false); router.push('/dashboard'); }} className="w-full justify-start h-12 rounded-xl text-base font-semibold" variant="secondary">
                        <LayoutDashboard className="mr-3 h-5 w-5" />
                        Dashboard
                      </Button>
                      <Button onClick={handleLogout} className="w-full justify-start h-12 rounded-xl text-base font-semibold text-muted-foreground hover:text-red-500" variant="ghost">
                        <LogOut className="mr-3 h-5 w-5" />
                        Log out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button onClick={() => { setMobileMenuOpen(false); router.push('/login'); }} variant="ghost" className="w-full h-12 rounded-xl text-base font-semibold justify-start">
                        Log in
                      </Button>
                      <Button onClick={() => { setMobileMenuOpen(false); router.push('/signup'); }} className="w-full h-12 rounded-xl text-base font-bold bg-primary text-primary-foreground mt-2">
                        Get Started
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
}
