"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Trash2Icon, PlusIcon, PlayCircleIcon } from "lucide-react";
import PreviewModal from "@/components/automations/PreviewModal";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AutomationsPage() {
  const router = useRouter();
  const [automations, setAutomations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    fetchAutomations();
  }, []);

  const fetchAutomations = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/v1/automations");
      if (data.success) {
        setAutomations(data.data?.automations || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteAutomation = async (id: string) => {
    try {
      await api.delete(`/api/v1/automations/${id}`);
      setAutomations(prev => prev.filter(a => a.id !== id));
      toast.success("Automation deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete automation");
    }
  };

  const importToWorkflow = async (id: string) => {
    try {
      const { data } = await api.post(`/api/v1/workflows/import-automation/${id}`);
      if (data.success && data.data.id) {
        toast.success("Successfully imported to workflows");
        router.push(`/dashboard/workflows/editor?id=${data.data.id}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to import automation");
    }
  };

  if (loading) return <div className="p-8">Loading Automations...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Automations</h1>
          <p className="text-muted-foreground mt-1">Automate your email and pipeline workflow (Max 10)</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => setIsPreviewOpen(true)}>
            <PlayCircleIcon className="w-4 h-4 mr-2" />
            Preview & Test
          </Button>
          <Link href="/dashboard/automations/editor">
            <Button disabled={automations.length >= 10}>
              <PlusIcon className="w-4 h-4 mr-2" />
              New Automation
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {automations.map(auto => (
          <Card key={auto.id} className="flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl line-clamp-1">{auto.name}</CardTitle>
                <Switch checked={auto.enabled} onCheckedChange={() => {}} />
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="text-sm text-muted-foreground mb-4">{auto.description || "No description provided."}</div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="capitalize">{auto.type.replace('_', ' ')}</Badge>
                <Badge variant="outline">{Object.keys(auto.actions || {}).length} Actions</Badge>
              </div>
            </CardContent>
            <CardFooter className="pt-3 border-t flex justify-between items-center gap-2">
              <div className="flex gap-2">
                <Link href={`/dashboard/automations/editor?id=${auto.id}`}>
                  <Button variant="link" className="px-0">Edit</Button>
                </Link>
                <Button variant="outline" size="sm" onClick={() => importToWorkflow(auto.id)}>
                  Import to Workflow
                </Button>
              </div>
              <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => deleteAutomation(auto.id)}>
                <Trash2Icon className="w-4 h-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}

        {automations.length === 0 && (
          <div className="col-span-full text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed">
            <p className="text-muted-foreground mb-4">No automations created yet.</p>
            <Link href="/dashboard/automations/editor">
              <Button>Create your first automation</Button>
            </Link>
          </div>
        )}
      </div>

      <PreviewModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} />
    </div>
  );
}
