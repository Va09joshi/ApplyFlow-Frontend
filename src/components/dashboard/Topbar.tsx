"use client";

import { usePathname } from "next/navigation";
import { Bell, Search, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";
import GmailConnect from "@/components/settings/GmailConnect";
import { useEffect, useState } from "react";
import { applicationService, Application } from "@/services/application.service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { CalendarDays, Mail, Eye } from "lucide-react";

export function Topbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<Application[]>([]);

  useEffect(() => {
    setMounted(true);
    
    async function fetchNotifications() {
      try {
        const res = await applicationService.getAll(1, 3);
        let apps: Application[] = [];
        if (Array.isArray(res)) apps = res;
        else if (res?.data && Array.isArray(res.data)) apps = res.data;
        else if (res?.data?.docs && Array.isArray(res.data.docs)) apps = res.data.docs;
        else if (res?.docs && Array.isArray(res.docs)) apps = res.docs;
        
        setNotifications(apps.slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    }
    fetchNotifications();
  }, []);

  const formatTimeAgo = (dateString: string) => {
    const diff = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000 / 60);
    if (diff < 60) return `${Math.max(1, diff)}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  const getPageTitle = () => {
    const path = pathname.split("/").pop();
    if (!path || path === "dashboard") return "Overview";
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <header className="h-16 border-b border-border bg-card/30 backdrop-blur-xl flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
      <div className="flex items-center gap-4 lg:hidden">
        <Sheet>
          <SheetTrigger className={buttonVariants({ variant: "ghost", size: "icon" }) + " lg:hidden"}>
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 border-r-0">
            <Sidebar />
          </SheetContent>
        </Sheet>
        <h1 className="font-bold text-lg">{getPageTitle()}</h1>
      </div>
      
      <div className="hidden lg:block">
        <h1 className="font-bold text-2xl tracking-tight">{getPageTitle()}</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search applications..."
            className="w-full bg-muted/50 border-none pl-9 rounded-full focus-visible:ring-1"
          />
        </div>
        
        <GmailConnect variant="minimal" />
        
        <DropdownMenu>
          <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "relative text-muted-foreground hover:text-foreground rounded-full")}>
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-primary border-2 border-background animate-pulse"></span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {notifications.length > 0 ? (
              notifications.map((app, index) => {
                const isInterview = app.status?.toLowerCase() === 'interview' || app.status?.toLowerCase() === 'interviewing';
                const isOffer = app.status?.toLowerCase() === 'offer' || app.status?.toLowerCase() === 'offered';
                
                let icon = <Mail className="h-4 w-4" />;
                let colorClass = "bg-blue-500/10 text-blue-500";
                let title = "Application Submitted";
                
                if (isInterview) {
                  icon = <CalendarDays className="h-4 w-4" />;
                  colorClass = "bg-emerald-500/10 text-emerald-500";
                  title = "Interview Scheduled";
                } else if (isOffer) {
                  icon = <Eye className="h-4 w-4" />;
                  colorClass = "bg-purple-500/10 text-purple-500";
                  title = "Offer Received!";
                }

                const companyName = app.companyName || app.companyTitle || (app.company as any)?.name || 'Company';

                return (
                  <DropdownMenuItem key={app.id || app.id || index} className="flex items-start gap-3 p-3 cursor-pointer">
                    <div className={`${colorClass} rounded-full p-2 mt-0.5 shrink-0`}>
                      {icon}
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                      <p className="text-sm font-medium leading-none truncate">{title}</p>
                      <p className="text-xs text-muted-foreground truncate">{app.roleTitle} at {companyName}</p>
                      <p className="text-[10px] text-muted-foreground/70 mt-0.5">{formatTimeAgo(app.createdAt || new Date().toISOString())}</p>
                    </div>
                    {index === 0 && <span className="w-2 h-2 rounded-full bg-blue-500 ml-auto mt-2 shrink-0"></span>}
                  </DropdownMenuItem>
                );
              })
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">No recent notifications</div>
            )}
            
            <DropdownMenuSeparator />
            <DropdownMenuItem className="w-full justify-center text-sm text-primary font-medium cursor-pointer p-2">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-muted-foreground hover:text-foreground"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        )}
      </div>
    </header>
  );
}
