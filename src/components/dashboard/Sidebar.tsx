"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Briefcase, 
  Building2, 
  Mail, 
  FileText, 
  Bot, 
  Settings,
  Sparkles,
  LogOut,
  ChevronRight,
  Compass
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const sidebarItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Applications", href: "/dashboard/applications", icon: Briefcase },
  { name: "Companies", href: "/dashboard/companies", icon: Building2 },
  { name: "Jobs", href: "/dashboard/jobs", icon: Compass },
  { name: "Email Automations", href: "/dashboard/emails", icon: Mail },
  { name: "Resume Manager", href: "/dashboard/resumes", icon: FileText },
  { name: "ATS Analyzer", href: "/dashboard/ats", icon: Bot },
  { name: "AI Generator", href: "/dashboard/ai", icon: Sparkles },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logoutState = useAuthStore(state => state.logout);
  const [userProfile, setUserProfile] = useState<{name?: string, email?: string} | null>(null);

  useEffect(() => {
    api.get('/api/v1/users/me')
      .then(res => {
        if (res.data?.data) {
          setUserProfile(res.data.data);
        }
      })
      .catch(err => console.error("Failed to fetch user profile", err));
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/api/v1/auth/logout');
    } catch(e) {}
    logoutState();
    router.push('/login');
  };

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-card/30 backdrop-blur-xl">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-bold text-xl tracking-tight">ApplyFlow <span className="text-primary">AI</span></span>
        </Link>
      </div>

      <ScrollArea className="flex-1 px-4">
        <nav className="flex flex-col gap-1 py-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <span
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
                </span>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="p-4 mt-auto border-t border-border">
        <nav className="flex flex-col gap-1 mb-4">
          <Link href="/dashboard/settings">
            <span className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
              pathname === "/dashboard/settings" 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}>
              <Settings className="w-5 h-5" />
              Settings
            </span>
          </Link>
        </nav>
        
        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50">
          <Avatar className="h-9 w-9 border border-primary/20">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>US</AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium truncate">{userProfile?.name || "User"}</span>
            <span className="text-xs text-muted-foreground truncate">{userProfile?.email || "user@applyflow.ai"}</span>
          </div>
          <Button variant="ghost" size="icon" className="ml-auto h-8 w-8 text-muted-foreground hover:text-destructive" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
