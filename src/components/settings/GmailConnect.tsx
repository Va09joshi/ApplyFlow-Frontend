"use client";

import React, { useEffect, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Mail, RefreshCw, Plus, ChevronDown, LogOut } from "lucide-react";
import { api } from "@/lib/api";

export default function GmailConnect({ variant = "default" }: { variant?: "default" | "compact" | "minimal" }) {
  const [status, setStatus] = useState<{connected: boolean; accounts: any[]}>({ connected: false, accounts: [] });
  const [loading, setLoading] = useState(true);
  const popupRef = React.useRef<Window | null>(null);

  useEffect(() => {
    fetchStatus();

    // Listen for cross-window message from oauth popup
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'GMAIL_CONNECTED') {
        fetchStatus();
        try {
          if (popupRef.current && !popupRef.current.closed) {
            popupRef.current.close();
          }
        } catch(e) {}
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/v1/gmail/status");
      if (data.success) {
        setStatus(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      const { data } = await api.get("/api/v1/gmail/connect");
      if (data.success && data.data.url) {
        // Open OAuth in popup window
        popupRef.current = window.open(data.data.url, 'Connect Gmail', 'width=500,height=600');
        
        // Polling fallback
        let resolved = false;
        const pollInterval = setInterval(async () => {
          if (resolved) return;
          if (!popupRef.current || popupRef.current.closed) {
            resolved = true;
            clearInterval(pollInterval);
            fetchStatus();
            return;
          }
          try {
            const { data: statusData } = await api.get("/api/v1/gmail/status");
            if (statusData?.success && statusData?.data?.connected) {
              resolved = true;
              clearInterval(pollInterval);
              setStatus(statusData.data);
              try { popupRef.current?.close(); } catch {}
            }
          } catch {}
        }, 2000);
      }
    } catch (error) {
      console.error("Failed to connect gmail", error);
    }
  };

  const handleSync = async (accountEmail: string) => {
    try {
      await api.get(`/api/v1/gmail/sync?account=${encodeURIComponent(accountEmail)}`);
      // Could show a toast here
    } catch (error) {
      console.error(error);
    }
  };

  const handleDisconnect = async () => {
    try {
      setLoading(true);
      await api.delete("/api/v1/gmail/disconnect");
      setStatus({ connected: false, accounts: [] });
      window.location.reload();
    } catch (error) {
      console.error("Failed to disconnect", error);
    } finally {
      setLoading(false);
    }
  };

  if (variant === "minimal") {
    return (
      <div className="flex items-center">
        {loading ? (
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground h-9" disabled>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="hidden md:inline">Checking Gmail...</span>
          </Button>
        ) : status.accounts.length > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2 rounded-full h-9 px-4 border-red-500/20 bg-red-500/10 hover:bg-red-500/20 transition-all text-foreground")}>
              <Mail className="w-4 h-4 text-red-500" />
              <span className="hidden md:inline truncate max-w-[150px] font-medium">{status.accounts[0].email}</span>
              <ChevronDown className="w-3 h-3 opacity-50 text-red-500/70" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Connected Accounts</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {status.accounts.map(acc => (
                <DropdownMenuItem key={acc.id} onClick={() => handleSync(acc.email)} className="cursor-pointer flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="truncate">{acc.email}</span>
                  </div>
                  <RefreshCw className="w-3.5 h-3.5 text-muted-foreground ml-2 shrink-0" />
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleConnect} className="cursor-pointer">
                <Plus className="w-4 h-4 mr-2 text-muted-foreground" />
                Add another account
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDisconnect} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
                <LogOut className="w-4 h-4 mr-2" />
                Disconnect Gmail
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="default" size="sm" className="gap-2 rounded-full h-9 px-4 bg-gradient-to-r from-red-500 to-rose-600 hover:opacity-90 transition-opacity text-white border-0 shadow-sm" onClick={handleConnect}>
            <Mail className="w-4 h-4" />
            <span className="hidden md:inline font-medium tracking-wide">Connect Gmail</span>
          </Button>
        )}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="flex items-center justify-between p-3 border border-border/50 rounded-2xl bg-card/60 backdrop-blur-sm shadow-sm transition-all hover:shadow-md">
        {loading ? (
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" /> Checking Gmail status...
          </div>
        ) : status.accounts.length > 0 ? (
          <div className="flex items-center justify-between w-full gap-4 overflow-hidden">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0 ring-1 ring-emerald-500/20">
                <Mail className="w-5 h-5" />
              </div>
              <div className="truncate">
                <p className="font-semibold text-sm truncate">
                  {status.accounts.map(a => a.email).join(", ")}
                </p>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Gmail Connected</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
               <Button variant="outline" size="sm" onClick={() => handleSync(status.accounts[0].email)}>
                 <RefreshCw className="w-3.5 h-3.5 mr-2" /> Sync
               </Button>
               <Button variant="ghost" size="icon" onClick={handleConnect} title="Add another account">
                 <Plus className="w-4 h-4" />
               </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0 ring-1 ring-blue-500/20">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">Connect Gmail</p>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Sync emails and automations</p>
              </div>
            </div>
            <Button size="sm" onClick={handleConnect} className="shadow-sm">
              Connect Account
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gmail Integration</CardTitle>
        <CardDescription>Connect your Gmail accounts to sync emails and enable automations.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="text-sm text-muted-foreground">Checking status...</div>
        ) : status.accounts.length > 0 ? (
          <div className="space-y-4">
            {status.accounts.map(acc => (
              <div key={acc.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  {acc.avatar ? (
                    <img src={acc.avatar} alt={acc.name} className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                      {acc.email.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-sm">{acc.name || "Unknown Name"}</p>
                    <p className="text-xs text-muted-foreground">{acc.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleSync(acc.email)}>
                    <RefreshCw className="w-3 h-3 mr-2" />
                    Sync Now
                  </Button>
                </div>
              </div>
            ))}
            
            <Button variant="outline" className="w-full border-dashed" onClick={handleConnect}>
              <Plus className="w-4 h-4 mr-2" />
              Connect Another Account
            </Button>
          </div>
        ) : (
          <div className="text-center py-6">
            <Mail className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm text-muted-foreground mb-4">No accounts connected yet.</p>
            <Button onClick={handleConnect}>
              Connect Gmail Account
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
