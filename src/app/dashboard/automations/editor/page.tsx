"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeftIcon, SaveIcon } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";

function AutomationEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoId = searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [automation, setAutomation] = useState<any>({
    name: "",
    description: "",
    type: "email_received",
    enabled: true,
    conditions: {
      fromContains: "",
      subjectContains: "",
      companyId: ""
    },
    actions: {
      moveApplicationToStage: "",
      sendAutoReply: false
    }
  });

  useEffect(() => {
    if (autoId) {
      fetchAutomation();
    }
  }, [autoId]);

  const fetchAutomation = async () => {
    try {
      const { data } = await api.get("/api/v1/automations");
      const match = data.data?.automations?.find((a: any) => a.id === autoId);
      if (match) setAutomation(match);
    } catch (e) {}
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const url = autoId ? `/api/v1/automations/${autoId}` : "/api/v1/automations";
      
      const { data } = autoId 
        ? await api.put(url, automation)
        : await api.post(url, automation);

      if (data.success) {
        router.push("/dashboard/automations");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateCondition = (key: string, value: string) => {
    setAutomation({ ...automation, conditions: { ...automation.conditions, [key]: value } });
  };

  const updateAction = (key: string, value: any) => {
    setAutomation({ ...automation, actions: { ...automation.actions, [key]: value } });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/automations">
          <Button variant="ghost" size="icon">
            <ArrowLeftIcon className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{autoId ? "Edit Automation" : "New Automation"}</h1>
        <div className="ml-auto flex items-center gap-2">
          <Label htmlFor="enabled">Enabled</Label>
          <Switch 
            id="enabled"
            checked={automation.enabled} 
            onCheckedChange={c => setAutomation({...automation, enabled: c})} 
          />
          <Button onClick={handleSave} disabled={loading} className="ml-4">
            <SaveIcon className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      <div className="grid gap-8">
        {/* Basic Info */}
        <div className="bg-white dark:bg-gray-900 border rounded-xl p-6 space-y-4 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Basic Info</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2 md:col-span-1">
              <Label>Name</Label>
              <Input 
                value={automation.name} 
                onChange={e => setAutomation({...automation, name: e.target.value})} 
                placeholder="e.g. Reject if Subject contains rejection"
              />
            </div>
            <div className="space-y-2 col-span-2 md:col-span-1">
              <Label>Trigger Type</Label>
              <Select value={automation.type} onValueChange={v => setAutomation({...automation, type: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="email_received">When Email Received</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Description</Label>
              <Input 
                value={automation.description} 
                onChange={e => setAutomation({...automation, description: e.target.value})} 
                placeholder="Briefly describe what this automation does"
              />
            </div>
          </div>
        </div>

        {/* Conditions */}
        <div className="bg-white dark:bg-gray-900 border rounded-xl p-6 space-y-4 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Conditions (IF)</h2>
          <p className="text-sm text-muted-foreground mb-4">All specified conditions must match.</p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>From contains</Label>
              <Input 
                value={automation.conditions?.fromContains || ""} 
                onChange={e => updateCondition("fromContains", e.target.value)} 
                placeholder="@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Subject contains</Label>
              <Input 
                value={automation.conditions?.subjectContains || ""} 
                onChange={e => updateCondition("subjectContains", e.target.value)} 
                placeholder="Interview, Offer, Rejected"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white dark:bg-gray-900 border rounded-xl p-6 space-y-4 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Actions (THEN)</h2>
          
          <div className="space-y-4">
            <div className="space-y-2 max-w-sm">
              <Label>Move Application to Stage</Label>
              <Select 
                value={automation.actions?.moveApplicationToStage || ""} 
                onValueChange={v => updateAction("moveApplicationToStage", v)}
              >
                <SelectTrigger><SelectValue placeholder="Do not move" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Do not move</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="screening">Screening</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="offered">Offered</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <Switch 
                checked={automation.actions?.sendAutoReply || false} 
                onCheckedChange={c => updateAction("sendAutoReply", c)} 
              />
              <Label>Send automatic reply acknowledging receipt (Mock Action)</Label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AutomationEditorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading Editor...</div>}>
      <AutomationEditorContent />
    </Suspense>
  );
}
