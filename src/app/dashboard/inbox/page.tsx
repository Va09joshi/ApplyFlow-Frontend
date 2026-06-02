"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow, format } from "date-fns";
import { Mail, Search, Link2Icon, Inbox, User, Clock } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

const parseSender = (fromStr: string) => {
  if (!fromStr) return { name: "Unknown", email: "", initials: "U" };
  const match = fromStr.match(/(.*?)\s*<(.+?)>/);
  let name = fromStr;
  let email = "";
  if (match) {
    name = match[1].replace(/"/g, "").trim();
    email = match[2].trim();
  }
  if (!name) name = email;
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
  return { name, email, initials: initials || "U" };
};

export default function InboxPage() {
  const [threads, setThreads] = useState<any[]>([]);
  const [selectedThread, setSelectedThread] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [linkData, setLinkData] = useState({ applicationId: "", companyId: "" });
  const [searchQuery, setSearchQuery] = useState("");

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
        fetchThreads();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const filteredThreads = threads.filter(
    (t) =>
      t.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.from?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] max-w-7xl mx-auto p-4 gap-6">
      {/* Thread List Sidebar */}
      <div className="w-[380px] flex-shrink-0 rounded-2xl bg-white dark:bg-gray-900 border shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b bg-gray-50/50 dark:bg-gray-900/50 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Inbox className="w-5 h-5 text-blue-600" />
              Inbox
            </h2>
            <Badge variant="secondary" className="rounded-full px-3">{threads.length}</Badge>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search emails..."
              className="pl-9 bg-white dark:bg-gray-950 rounded-xl border-gray-200 dark:border-gray-800 focus-visible:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm">Syncing inbox...</p>
            </div>
          ) : filteredThreads.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center gap-3">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Mail className="w-8 h-8 text-gray-400" />
              </div>
              <p className="font-medium text-gray-900 dark:text-gray-100">No emails found</p>
              <p className="text-sm text-gray-500">Your inbox is empty or doesn't match the search.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {filteredThreads.map((thread) => {
                const isSelected = selectedThread?._id === thread._id;
                const sender = parseSender(thread.from);
                return (
                  <button
                    key={thread._id}
                    onClick={() => setSelectedThread(thread)}
                    className={`text-left p-4 border-b last:border-b-0 transition-all duration-200 relative group
                      ${
                        isSelected
                          ? "bg-blue-50/50 dark:bg-blue-900/10 border-l-4 border-l-blue-500"
                          : "bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50 border-l-4 border-l-transparent"
                      }
                    `}
                  >
                    <div className="flex gap-3 items-start">
                      <Avatar className="w-10 h-10 border border-gray-100 dark:border-gray-800 shadow-sm">
                        <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 text-blue-700 dark:text-blue-300 font-semibold">
                          {sender.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className={`font-semibold text-sm truncate pr-2 ${isSelected ? "text-blue-700 dark:text-blue-400" : "text-gray-900 dark:text-gray-100"}`}>
                            {sender.name}
                          </span>
                          <span className="text-[11px] text-gray-500 whitespace-nowrap font-medium">
                            {thread.createdAt
                              ? formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })
                              : ""}
                          </span>
                        </div>
                        <p className={`text-sm font-medium truncate mb-1 ${isSelected ? "text-gray-900 dark:text-gray-200" : "text-gray-800 dark:text-gray-300"}`}>
                          {thread.subject || "No Subject"}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                          {thread.snippet || "No preview available..."}
                        </p>
                        
                        {(thread.companyId || thread.applicationId) && (
                          <div className="mt-3 flex gap-2 flex-wrap">
                            {thread.companyId && (
                              <Badge variant="secondary" className="text-[10px] bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 hover:bg-indigo-100 border-none">
                                Company
                              </Badge>
                            )}
                            {thread.applicationId && (
                              <Badge variant="secondary" className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 hover:bg-emerald-100 border-none">
                                Application
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Thread Detail View */}
      <div className="flex-1 rounded-2xl bg-white dark:bg-gray-900 border shadow-sm flex flex-col overflow-hidden relative">
        {selectedThread ? (
          <>
            {/* Detail Header */}
            <div className="p-6 border-b bg-gray-50/30 dark:bg-gray-900/30 flex justify-between items-start">
              <div className="flex flex-col gap-4 max-w-[80%]">
                <h2 className="text-2xl font-bold leading-tight text-gray-900 dark:text-white">
                  {selectedThread.subject || "No Subject"}
                </h2>
                
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 border shadow-sm">
                    <AvatarFallback className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 text-lg">
                      {parseSender(selectedThread.from).initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {parseSender(selectedThread.from).name}
                      </span>
                      {parseSender(selectedThread.from).email && (
                        <span className="text-sm text-gray-500">
                          &lt;{parseSender(selectedThread.from).email}&gt;
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{selectedThread.createdAt ? format(new Date(selectedThread.createdAt), "PPP 'at' p") : "Unknown Date"}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button onClick={() => setIsLinkOpen(true)} className="rounded-xl shadow-sm bg-white text-gray-700 border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700 border">
                <Link2Icon className="w-4 h-4 mr-2" />
                Link Thread
              </Button>
            </div>

            {/* Detail Content */}
            <div className="flex-1 overflow-hidden relative bg-white dark:bg-gray-950">
              {selectedThread.html ? (
                <iframe
                  title="Email content"
                  sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
                  srcDoc={`
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1">
                        <style>
                          body { 
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                            margin: 0; 
                            padding: 24px;
                            color: #1a1a1a;
                            background-color: transparent;
                            word-wrap: break-word;
                          }
                          /* Makes sure images don't overflow the iframe */
                          img { max-width: 100%; height: auto; }
                          /* Better link styling */
                          a { color: #2563eb; text-decoration: none; }
                          a:hover { text-decoration: underline; }
                        </style>
                      </head>
                      <body>
                        ${selectedThread.html}
                      </body>
                    </html>
                  `}
                  className="w-full h-full border-0"
                />
              ) : (
                <div className="p-8 h-full overflow-y-auto">
                  <div className="prose dark:prose-invert max-w-none text-[15px] leading-relaxed whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-300">
                    {selectedThread.text || selectedThread.plainText || "No content available."}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-gray-50/50 dark:bg-gray-900/20">
            <div className="w-24 h-24 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center mb-6">
              <Mail className="w-10 h-10 text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No Thread Selected</h3>
            <p className="text-gray-500 max-w-sm text-center">
              Choose an email from the list on the left to read its contents and manage its links.
            </p>
          </div>
        )}
      </div>

      <Dialog open={isLinkOpen} onOpenChange={setIsLinkOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Link Thread</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300 font-medium">Application ID</Label>
              <Input 
                value={linkData.applicationId} 
                onChange={e => setLinkData({ ...linkData, applicationId: e.target.value })} 
                placeholder="Enter Application ID..." 
                className="rounded-xl border-gray-200 dark:border-gray-800"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300 font-medium">Company ID</Label>
              <Input 
                value={linkData.companyId} 
                onChange={e => setLinkData({ ...linkData, companyId: e.target.value })} 
                placeholder="Enter Company ID..." 
                className="rounded-xl border-gray-200 dark:border-gray-800"
              />
            </div>
            <Button className="w-full rounded-xl py-6 text-md font-semibold mt-4 shadow-sm" onClick={handleLinkThread}>
              Save Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
