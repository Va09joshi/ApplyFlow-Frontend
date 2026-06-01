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

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    } catch (err) {
      console.error(err);
      toast.error("Failed to duplicate workflow");
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="flex flex-col h-[220px]">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-5 w-10 rounded-full" />
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              </CardContent>
              <CardFooter className="pt-3 border-t flex justify-between">
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <div className="flex gap-1">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </CardFooter>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workflows.map(workflow => (
          <Card key={workflow._id} className="flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl line-clamp-1">{workflow.name}</CardTitle>
                <Switch 
                  checked={workflow.active} 
                  onCheckedChange={(checked) => toggleActive(workflow._id, checked)} 
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="text-sm text-muted-foreground mb-4">{workflow.description || "No description provided."}</div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="capitalize">
                  Trigger: {workflow.trigger?.type?.replace('_', ' ') || 'None'}
                </Badge>
                <Badge variant="outline">{workflow.nodes?.length || 0} Nodes</Badge>
              </div>
              {workflow.lastRunAt && (
                <div className="mt-4 text-xs text-muted-foreground">
                  Last run: {new Date(workflow.lastRunAt).toLocaleString()}
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-3 border-t flex justify-between items-center gap-2">
              <div className="flex gap-2">
                <Link href={`/dashboard/workflows/editor?id=${workflow._id}`}>
                  <Button variant="link" className="px-0">Edit</Button>
                </Link>
                <Link href={`/dashboard/workflows/${workflow._id}/runs`}>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <ListIcon className="w-4 h-4 mr-2" />
                    Runs
                  </Button>
                </Link>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => duplicateWorkflow(workflow)}>
                  <CopyIcon className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => deleteWorkflow(workflow._id)}>
                  <Trash2Icon className="w-4 h-4" />
                </Button>
              </div>
            </CardFooter>
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
    </div>
  );
}
