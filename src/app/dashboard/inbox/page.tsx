"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import { Mail, Search, Link2Icon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

export default function InboxPage() {
  const [threads, setThreads] = useState<any[]>([]);
  const [selectedThread, setSelectedThread] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [linkData, setLinkData] = useState({ applicationId: "", companyId: "" });

  useEffect(() => {
    fetchThreads();
  }, []);

  const fetchThreads = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/v1/emails/threads");
      if (data.success) {
        setThreads(data.data?.threads || data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkThread = async () => {
    if (!selectedThread) return;
    try {
      const { data } = await api.patch(`/api/v1/emails/threads/${selectedThread._id}`, linkData);
      if (data.success) {
        setIsLinkOpen(false);
        // Optimistic UI update could be added here
        fetchThreads();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] max-w-7xl mx-auto p-4 gap-4">
      {/* Thread List */}
      <div className="w-1/3 border rounded-xl bg-white dark:bg-gray-900 flex flex-col overflow-hidden">
        <div className="p-4 border-b flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
            <Input placeholder="Search emails..." className="pl-9 bg-gray-50 dark:bg-gray-800" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">Loading...</div>
          ) : threads.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
              <Mail className="w-8 h-8 mb-2 opacity-50" />
              <p>No threads found.</p>
            </div>
          ) : (
            threads.map(thread => (
              <div 
                key={thread._id} 
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${selectedThread?._id === thread._id ? 'bg-blue-50/50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'}`}
                onClick={() => setSelectedThread(thread)}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-semibold text-sm line-clamp-1">{thread.subject || "No Subject"}</h4>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                    {thread.createdAt ? formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true }) : ''}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {thread.snippet || "No preview available..."}
                </p>
                <div className="mt-2 flex gap-1 flex-wrap">
                  {thread.companyId && <Badge variant="outline" className="text-[10px] py-0">Company Linked</Badge>}
                  {thread.applicationId && <Badge variant="outline" className="text-[10px] py-0">App Linked</Badge>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Thread Detail */}
      <div className="w-2/3 border rounded-xl bg-white dark:bg-gray-900 flex flex-col overflow-hidden">
        {selectedThread ? (
          <>
            <div className="p-6 border-b flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold mb-2">{selectedThread.subject || "No Subject"}</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>From: {selectedThread.from || "Unknown"}</span>
                  <span>•</span>
                  <span>{new Date(selectedThread.createdAt).toLocaleString()}</span>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsLinkOpen(true)}>
                <Link2Icon className="w-4 h-4 mr-2" />
                Link Thread
              </Button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {/* Detailed email content would be mapped here if we have messages array */}
              <div className="prose dark:prose-invert max-w-none text-sm" dangerouslySetInnerHTML={{ __html: selectedThread.html || selectedThread.text || "No content." }} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <Mail className="w-12 h-12 mb-4 opacity-20" />
            <p>Select a thread to view details</p>
          </div>
        )}
      </div>

      <Dialog open={isLinkOpen} onOpenChange={setIsLinkOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link Thread to Entity</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Application ID</Label>
              <Input 
                value={linkData.applicationId} 
                onChange={e => setLinkData({ ...linkData, applicationId: e.target.value })} 
                placeholder="Enter associated Application ID" 
              />
            </div>
            <div className="space-y-2">
              <Label>Company ID</Label>
              <Input 
                value={linkData.companyId} 
                onChange={e => setLinkData({ ...linkData, companyId: e.target.value })} 
                placeholder="Enter associated Company ID" 
              />
            </div>
            <Button className="w-full mt-4" onClick={handleLinkThread}>Save Linking</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
