import React, { useEffect, useState, useRef } from 'react';
import { ChevronUpIcon, ChevronDownIcon, PlayCircleIcon, CheckCircleIcon, XCircleIcon, Loader2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';

interface LogEntry {
  id: string;
  timestamp: number;
  type: string;
  stepId?: string;
  nodeType?: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  output?: any;
  error?: string;
}

export function RunLogsTray() {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Listen for custom events dispatched by the rest of the app (like preview start)
    const handleAddLog = (e: any) => {
      setLogs((prev) => [...prev, e.detail]);
      if (!isOpen) setIsOpen(true);
    };
    window.addEventListener('workflow_log', handleAddLog);
    return () => window.removeEventListener('workflow_log', handleAddLog);
  }, [isOpen]);

  useEffect(() => {
    const token = useAuthStore.getState().accessToken;
    if (!token) return;

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const eventSource = new EventSource(`${baseUrl}/api/v1/events/stream?token=${token}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'WORKFLOW_STEP') {
          setLogs((prev) => [...prev, {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: Date.now(),
            type: data.type,
            stepId: data.payload.stepId,
            nodeType: data.payload.nodeType,
            status: 'pending',
            message: `Running step: ${data.payload.nodeType}`
          }]);
          setIsOpen(true);
        } else if (data.type === 'WORKFLOW_STEP_DONE') {
          setLogs((prev) => prev.map(log =>
            log.stepId === data.payload.stepId && log.status === 'pending'
              ? { ...log, status: data.payload.error ? 'error' : 'success', output: data.payload.output, error: data.payload.error }
              : log
          ));
        } else if (data.type === 'WORKFLOW_DONE') {
          setLogs((prev) => [...prev, {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: Date.now(),
            type: data.type,
            status: data.payload.error ? 'error' : 'success',
            message: `Workflow finished ${data.payload.error ? 'with errors' : 'successfully'}`
          }]);
        }
      } catch (e) {
        console.error("Failed to parse workflow SSE message", e);
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className={cn("absolute bottom-0 left-0 right-0 bg-card border-t border-border transition-all duration-300 z-20 flex flex-col shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]", isOpen ? "h-64" : "h-12")}>
      <div className="flex justify-between items-center px-4 h-12 shrink-0 cursor-pointer hover:bg-muted/30" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-2 font-semibold">
          <PlayCircleIcon className="w-4 h-4 text-primary" />
          Run Logs
          {logs.length > 0 && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-2">{logs.length}</span>}
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 pointer-events-none">
          {isOpen ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronUpIcon className="w-4 h-4" />}
        </Button>
      </div>

      {isOpen && (
        <div className="flex-1 overflow-y-auto p-4 bg-muted/10 font-mono text-sm" ref={scrollRef}>
          {logs.length === 0 ? (
            <div className="text-muted-foreground text-center mt-10 opacity-50 italic">No logs yet. Run a preview to see output.</div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="flex gap-3">
                  <div className="mt-0.5 shrink-0">
                    {log.status === 'pending' && <Loader2Icon className="w-4 h-4 text-blue-500 animate-spin" />}
                    {log.status === 'success' && <CheckCircleIcon className="w-4 h-4 text-green-500" />}
                    {log.status === 'error' && <XCircleIcon className="w-4 h-4 text-red-500" />}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-xs">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span className={cn(
                        "font-medium",
                        log.status === 'error' ? 'text-red-500' : 'text-foreground'
                      )}>
                        {log.message}
                      </span>
                    </div>

                    {log.output && (
                      <div className="mt-1 bg-muted p-2 rounded text-xs overflow-x-auto">
                        <pre>{JSON.stringify(log.output, null, 2)}</pre>
                      </div>
                    )}
                    {log.error && (
                      <div className="mt-1 bg-red-500/10 text-red-500 p-2 rounded text-xs border border-red-500/20 overflow-x-auto">
                        <pre>{log.error}</pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
