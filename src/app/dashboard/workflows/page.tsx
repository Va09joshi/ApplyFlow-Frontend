"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2Icon, PlusIcon, PlayCircleIcon, CopyIcon, ListIcon } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { UpgradeProModal } from "@/components/modals/UpgradeProModal";

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/v1/workflows");
      if (data.success) {
        setWorkflows(data.data?.docs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteWorkflow = async (id: string) => {
    try {
      await api.delete(`/api/v1/workflows/${id}`);
      setWorkflows(prev => prev.filter(w => w._id !== id));
      toast.success("Workflow deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete workflow");
    }
  };

  const duplicateWorkflow = async (workflow: any) => {
    try {
      const payload = {
        name: `${workflow.name} (Copy)`,
        description: workflow.description,
        active: false,
        trigger: workflow.trigger,
        nodes: workflow.nodes,
        edges: workflow.edges
      };
      const { data } = await api.post("/api/v1/workflows", payload);
      if (data.success) {
        setWorkflows([data.data, ...workflows]);
        toast.success("Workflow duplicated");
      }
    } catch (err: any) {
      if (err.response?.status === 403) {
        setShowUpgradeModal(true);
      } else {
        console.error(err);
        toast.error("Failed to duplicate workflow");
      }
    }
  };

  const toggleActive = async (id: string, active: boolean) => {
    try {
      await api.patch(`/api/v1/workflows/${id}`, { active });
      setWorkflows(prev => prev.map(w => w._id === id ? { ...w, active } : w));
      toast.success(`Workflow ${active ? 'enabled' : 'disabled'}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to toggle workflow");
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="flex flex-col gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="flex flex-row items-center justify-between rounded-2xl border-border/60 shadow-sm bg-card p-5 gap-6">
              <div className="flex flex-col flex-1 gap-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-5 w-32 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-40 mt-1" />
              </div>
              <div className="flex flex-col items-end justify-between self-stretch">
                <Skeleton className="h-6 w-11 rounded-full" />
                <div className="flex items-center gap-4 mt-auto">
                  <Skeleton className="h-5 w-8" />
                  <Skeleton className="h-5 w-16" />
                  <div className="w-px h-4 bg-border/60 mx-1"></div>
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-5 w-5" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Workflows</h1>
          <p className="text-muted-foreground mt-1">Visually design and automate your application pipelines</p>
        </div>
        <div className="flex gap-4">
          <Link href="/dashboard/workflows/editor">
            <Button>
              <PlusIcon className="w-4 h-4 mr-2" />
              New Workflow
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {workflows.map(workflow => (
          <Card key={workflow._id} className={`flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl border-border/60 shadow-sm bg-card hover:shadow-md transition-shadow p-5 gap-5 border-l-[5px] ${workflow.active ? 'border-l-blue-500' : 'border-l-muted-foreground/30'}`}>
            <div className="flex flex-col flex-1 gap-2.5">
              <div className="flex flex-wrap items-center gap-3">
                <CardTitle className="text-[19px] font-bold mr-1">{workflow.name}</CardTitle>
                <Badge variant="secondary" className="bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 font-semibold border-0 rounded-full px-3 py-0.5 text-xs">
                  Trigger: {workflow.trigger?.type?.replace('_', ' ') || 'None'}
                </Badge>
                <Badge variant="outline" className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 rounded-full px-3 py-0.5 text-xs font-semibold border-0">
                  {workflow.nodes?.length || 0} Nodes
                </Badge>
              </div>
              <div className="text-[15px] font-medium text-muted-foreground">{workflow.description || "No description provided."}</div>
              <div className="text-[13px] font-medium text-muted-foreground/80">
                Last run: {workflow.lastRunAt ? new Date(workflow.lastRunAt).toLocaleString() : 'Never'}
              </div>
            </div>
            
            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between self-stretch mt-4 sm:mt-0 gap-4 sm:gap-0 border-t sm:border-0 border-border/40 pt-4 sm:pt-0">
              <Switch 
                checked={workflow.active} 
                onCheckedChange={(checked) => toggleActive(workflow._id, checked)} 
                className="data-[state=checked]:bg-blue-600"
              />
              <div className="flex items-center gap-4 mt-auto">
                <Link href={`/dashboard/workflows/editor?id=${workflow._id}`}>
                  <button className="text-blue-600 hover:text-blue-700 font-bold text-sm transition-colors">Edit</button>
                </Link>
                <Link href={`/dashboard/workflows/${workflow._id}/runs`}>
                  <button className="flex items-center text-muted-foreground hover:text-foreground font-semibold text-sm transition-colors">
                    <ListIcon className="w-4 h-4 mr-1.5" />
                    Runs
                  </button>
                </Link>
                <div className="w-px h-4 bg-border/60 mx-1 hidden sm:block"></div>
                <button className="text-muted-foreground/60 hover:text-foreground transition-colors ml-auto sm:ml-0" onClick={() => duplicateWorkflow(workflow)}>
                  <CopyIcon className="w-[18px] h-[18px]" />
                </button>
                <button className="text-red-500/80 hover:text-red-600 transition-colors" onClick={() => deleteWorkflow(workflow._id)}>
                  <Trash2Icon className="w-[18px] h-[18px]" />
                </button>
              </div>
            </div>
          </Card>
        ))}

        {workflows.length === 0 && (
          <div className="col-span-full text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed">
            <p className="text-muted-foreground mb-4">No workflows created yet.</p>
            <Link href="/dashboard/workflows/editor">
              <Button>Create your first workflow</Button>
            </Link>
          </div>
        )}
      </div>

      <UpgradeProModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
    </div>
  );
}
