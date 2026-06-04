"use client";

import React, { useEffect, useState, useCallback } from "react";
import { emailService, GmailStatus } from "@/services/email.service";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import * as motion from "framer-motion/client";

export function RequireEmailConnection({ children }: { children: React.ReactNode }) {
  const [gmailStatus, setGmailStatus] = useState<GmailStatus | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const popupRef = React.useRef<Window | null>(null);

  const checkStatus = useCallback(async () => {
    try {
      setIsChecking(true);
      const res = await emailService.getStatus();
      if (res?.success && res?.data) {
        setGmailStatus(res.data);
      } else {
        setGmailStatus(null);
      }
    } catch {
      setGmailStatus(null);
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'GMAIL_CONNECTED') {
        const payload = event.data.payload;
        checkStatus();
        toast.success(`Gmail connected as ${payload?.email || 'your account'}`);
        setIsConnecting(false);
        try {
          if (popupRef.current && !popupRef.current.closed) {
            popupRef.current.close();
          }
        } catch(e) {}
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [checkStatus]);

  const handleConnectGmail = async () => {
    try {
      setIsConnecting(true);
      const res = await emailService.getAuthUrl();
      if (res?.data?.url) {
        const width = 500;
        const height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        
        popupRef.current = window.open(
          res.data.url as string,
          'Gmail Connect',
          `width=${width},height=${height},left=${left},top=${top}`
        );

        let resolved = false;
        const pollInterval = setInterval(async () => {
          if (resolved) return;

          if (!popupRef.current || popupRef.current.closed) {
            resolved = true;
            clearInterval(pollInterval);
            checkStatus();
            setIsConnecting(false);
            return;
          }

          try {
            const statusRes = await emailService.getStatus();
            if (statusRes?.success && statusRes?.data) {
              resolved = true;
              clearInterval(pollInterval);
              setGmailStatus(statusRes.data);
              toast.success(`Gmail connected as ${statusRes.data.email}`);
              setIsConnecting(false);
              try { popupRef.current?.close(); } catch { }
            }
          } catch { }
        }, 2000);
      } else {
        toast.error("Failed to get Google Auth URL");
        setIsConnecting(false);
      }
    } catch {
      toast.error("An error occurred while connecting to Gmail");
      setIsConnecting(false);
    }
  };

  return (
    <>
      {/* Always render children in the background so the layout is visible */}
      {children}

      {/* Loading Overlay */}
      {isChecking && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Connection Modal Overlay */}
      {!isChecking && !gmailStatus && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-100/60 dark:bg-zinc-950/80 backdrop-blur-md overflow-hidden">
          {/* Subtle Grid on the overlay */}
          <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative z-10 max-w-md w-full bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 shadow-2xl rounded-2xl p-8 sm:p-10 text-center space-y-6"
          >
            <div className="w-16 h-16 bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-gray-100 dark:border-zinc-800">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-8 h-8">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
                Connect Google Workspace
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Link your Gmail account to sync candidate threads and send automated email campaigns.
              </p>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-4 flex items-start gap-3 text-left">
              <ShieldAlert className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800 dark:text-blue-300/90 leading-relaxed">
                We require permission to read and send emails on your behalf. Your data is strictly secured and used solely for automation.
              </p>
            </div>

            <Button 
              size="lg" 
              className="w-full h-12 text-[15px] font-medium bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm transition-all"
              onClick={handleConnectGmail}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <Loader2 className="w-5 h-5 mr-3 animate-spin text-gray-400" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5 mr-3">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
              )}
              {isConnecting ? "Connecting..." : "Sign in with Google"}
            </Button>
          </motion.div>
        </div>
      )}
    </>
  );
}
