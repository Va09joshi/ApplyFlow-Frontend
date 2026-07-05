"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftIcon, Loader2Icon, CheckCircle2Icon, XCircleIcon, ClockIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function WorkflowRunsPage() {
  const params = useParams();
  const router = useRouter();
  const workflowId = params.id as string;

  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [workflow, setWorkflow] = useState<any>(null);

  useEffect(() => {
    if (workflowId) {
      fetchWorkflow();
      fetchRuns();
    }
  }, [workflowId]);

  const fetchWorkflow = async () => {
    try {
      const { data } = await api.get(`/api/v1/workflows/${workflowId}`);
      if (data.success && data.data) {
        setWorkflow(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRuns = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/api/v1/workflows/${workflowId}/runs`);
      if (data.success) {
        setRuns(Array.isArray(data.data) ? data.data : (data.data?.runs || data.data?.docs || []));
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load workflow runs");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-4 border-b border-border/50 pb-6">
        <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/workflows')} className="rounded-full">
          <ArrowLeftIcon className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            {workflow?.name || "Workflow"} Runs
            {workflow && (
              <Badge variant={workflow.active ? "default" : "secondary"}>
                {workflow.active ? "Active" : "Inactive"}
              </Badge>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">View the execution history and logs for this workflow.</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : runs.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-xl border border-dashed border-border/60">
          <ClockIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium">No runs recorded yet</h3>
          <p className="text-muted-foreground text-sm mt-1">This workflow hasn't been executed yet.</p>
          <Button variant="outline" className="mt-6" onClick={() => router.push(`/dashboard/workflows/editor?id=${workflowId}`)}>
            Open Editor to Run
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {runs.map(run => (
            <Card key={run.id || run.id} className="overflow-hidden hover:shadow-md transition-all">
              <div className="flex items-center p-5 gap-6">
                <div className="shrink-0 flex items-center justify-center p-3 rounded-full bg-muted/50">
                  {run.status === 'success' ? (
                    <CheckCircle2Icon className="w-6 h-6 text-emerald-500" />
                  ) : run.status === 'failed' ? (
                    <XCircleIcon className="w-6 h-6 text-destructive" />
                  ) : (
                    <Loader2Icon className="w-6 h-6 text-blue-500 animate-spin" />
                  )}
                </div>
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Status</p>
                    <Badge variant={run.status === 'success' ? 'default' : run.status === 'failed' ? 'destructive' : 'secondary'} className="capitalize">
                      {run.status || 'Unknown'}
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Started</p>
                    <p className="text-sm font-medium">{new Date(run.startedAt || run.createdAt).toLocaleString()}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Duration</p>
                    <p className="text-sm font-medium">
                      {run.finishedAt 
                        ? `${((new Date(run.finishedAt).getTime() - new Date(run.startedAt).getTime()) / 1000).toFixed(2)}s` 
                        : run.status === 'success' ? '< 1s' : 'In progress...'}
                    </p>
                  </div>
                </div>
                
                <div className="shrink-0">
                  <Button variant="outline" onClick={() => {
                    // Logic to open a modal with run logs, or just show basic details for now
                    toast.info(`Details for run ${run.id || run.id} coming soon!`);
                  }}>
                    View Logs
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
