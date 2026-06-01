"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, RefreshCw, Plus } from "lucide-react";
import { api } from "@/lib/api";

export default function GmailConnect() {
  const [status, setStatus] = useState<{connected: boolean; accounts: any[]}>({ connected: false, accounts: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();

    // Listen for cross-window message from oauth popup
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'GMAIL_CONNECTED') {
        fetchStatus();
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
        window.open(data.data.url, 'Connect Gmail', 'width=500,height=600');
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
