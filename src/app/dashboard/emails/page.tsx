"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send, Settings2, Plus, Mail, Trash2, Loader2, Play, UploadCloud, Edit2, CheckCircle2, LogOut, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import * as motion from "framer-motion/client";
import { templateService, Template } from "@/services/template.service";
import { emailService, GmailStatus } from "@/services/email.service";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { resumeService, Resume } from "@/services/resume.service";
import DOMPurify from "dompurify";
import Papa from "papaparse";

export default function EmailAutomationsPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Gmail connection state
  const [gmailStatus, setGmailStatus] = useState<GmailStatus | null>(null);
  const [isCheckingGmail, setIsCheckingGmail] = useState(true);
  const [isConnectingGmail, setIsConnectingGmail] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const popupRef = useRef<Window | null>(null);

  // New/Edit Template Form
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [newTemplate, setNewTemplate] = useState({ name: "", subject: "", body: "", plainText: "", linkLabel: "", linkUrl: "" });
  const [templatePreviewMode, setTemplatePreviewMode] = useState<"html" | "plain">("html");
  const [isCreating, setIsCreating] = useState(false);

  // Resumes list state
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [showSendSettings, setShowSendSettings] = useState(false);

  // Send Email Form
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [sendForm, setSendForm] = useState({
    to: "",
    subject: "",
    html: "",
    fromEmail: "",
    useTemplate: true,
    attachResume: true,
    insertResumeLink: false,
    resumeLinkLabel: "View My Resume",
    resumeId: "",
    contentType: "html",
    templateId: "",
    linkUrl: "",
    linkLabel: "",
    attachments: [] as { name: string; url?: string; file?: File }[]
  });
  const [isSending, setIsSending] = useState(false);
  const [sentDeliveryStatus, setSentDeliveryStatus] = useState<any>(null);

  // Preview Email Form
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [previewData, setPreviewData] = useState<{ html: string, plainText: string, to: string, subject: string } | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewTab, setPreviewTab] = useState<"html" | "plain">("html");

  // Bulk CSV Form
  const [isCsvDialogOpen, setIsCsvDialogOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);
  const [csvResults, setCsvResults] = useState<any>(null);
  const [csvPreviewRows, setCsvPreviewRows] = useState<any[]>([]);
  const [csvColumns, setCsvColumns] = useState<string[]>([]);
  const [csvMapping, setCsvMapping] = useState<Record<string, string>>({});
  const [csvOptions, setCsvOptions] = useState({
    useTemplate: true,
    attachResume: true,
    insertResumeLink: false,
    resumeLinkLabel: "View My Resume",
    resumeId: "",
    contentType: "html",
    fromEmail: ""
  });

  // Check Gmail connection status
  const checkGmailStatus = useCallback(async () => {
    try {
      setIsCheckingGmail(true);
      const res = await emailService.getStatus();
      if (res?.success && res?.data) {
        setGmailStatus(res.data);
        // Auto-fill the from email
        setSendForm(prev => ({ ...prev, fromEmail: res.data!.email }));
      } else {
        setGmailStatus(null);
      }
    } catch {
      setGmailStatus(null);
    } finally {
      setIsCheckingGmail(false);
    }
  }, []);

  // Listen for postMessage from Gmail OAuth popup
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'GMAIL_CONNECTED') {
        const payload = event.data.payload;
        console.log('Connected to Gmail!', payload);
        // Refresh the full status from backend to get all fields
        checkGmailStatus();
        toast.success(`Gmail connected as ${payload?.email || 'your account'}`);
        setIsConnectingGmail(false);
        
        try {
          if (popupRef.current && !popupRef.current.closed) {
            popupRef.current.close();
          }
        } catch(e) {}
        
        // Automatically trigger a sync so they don't have to press the button
        toast.info("Automatically checking for new emails...");
        api.get("/api/v1/gmail/sync").catch(e => console.error("Auto sync failed", e));
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [checkGmailStatus]);

  // Check Gmail status on mount
  useEffect(() => {
    checkGmailStatus();
  }, [checkGmailStatus]);

  const handleConnectGmail = async () => {
    try {
      setIsConnectingGmail(true);
      const res = await emailService.getAuthUrl();
      if (res?.data?.url) {
        // Open the auth URL in a centered popup
        const width = 500;
        const height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        const authUrl = res.data.url as string;
        popupRef.current = window.open(
          authUrl,
          'Gmail Connect',
          `width=${width},height=${height},left=${left},top=${top}`
        );

        // For branding/display purposes we still keep `NEXT_PUBLIC_OAUTH_DISPLAY_HOST`
        // available in env and can surface it in the UI (labels/messages), but
        // we must not navigate the user to it unless that host is properly
        // configured with TLS and registered with Google.

        // Actively poll the backend status while popup is open.
        // The backend callback processes the OAuth code and stores credentials,
        // but the popup just shows the raw JSON response — it never sends
        // a postMessage back. So we poll every 2s to detect when the backend
        // has recorded the connection, then auto-close the popup.
        let resolved = false;
        const pollInterval = setInterval(async () => {
          if (resolved) return;

          // If popup was closed by user, do one final check and stop
          if (!popupRef.current || popupRef.current.closed) {
            resolved = true;
            clearInterval(pollInterval);
            const statusRes = await emailService.getStatus();
            if (statusRes?.success && statusRes?.data) {
              setGmailStatus(statusRes.data);
              
              setSendForm(prev => ({ ...prev, fromEmail: statusRes.data!.email }));
              toast.success(`Gmail connected as ${statusRes.data.email}`);
            }
            setIsConnectingGmail(false);
            return;
          }

          // Proactively check if OAuth completed while popup is still open
          try {
            const statusRes = await emailService.getStatus();
            if (statusRes?.success && statusRes?.data) {
              resolved = true;
              clearInterval(pollInterval);
              setGmailStatus(statusRes.data);
              
              setSendForm(prev => ({ ...prev, fromEmail: statusRes.data!.email }));
              toast.success(`Gmail connected as ${statusRes.data.email}`);
              setIsConnectingGmail(false);
              // Auto-close the popup since we got the connection
              try { popupRef.current?.close(); } catch { /* cross-origin or already closed */ }
            }
          } catch {
            // Status check failed, keep polling
          }
        }, 2000);
      } else {
        toast.error("Failed to get Google Auth URL");
        setIsConnectingGmail(false);
      }
    } catch {
      toast.error("An error occurred while connecting to Gmail");
      setIsConnectingGmail(false);
    }
  };

  const handleDisconnectGmail = async () => {
    try {
      setIsDisconnecting(true);
      await emailService.disconnect();
      setGmailStatus(null);
      setSendForm(prev => ({ ...prev, fromEmail: "" }));
      toast.success("Gmail disconnected successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to disconnect Gmail account");
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleSyncGmail = async () => {
    try {
      setIsSyncing(true);
      const res = await api.get("/api/v1/gmail/sync");
      if (res.data.success) {
        toast.success("Gmail sync triggered! Checking for new emails and running workflows...");
      } else {
        toast.error("Failed to start sync");
      }
    } catch (error) {
      const err = error as any;
      const errorDetail = String(err?.response?.data?.error || err?.response?.data?.message || err?.message || "").toLowerCase();
      
      if (errorDetail.includes("insufficient permission") || errorDetail.includes("forbidden") || errorDetail.includes("scope") || errorDetail.includes("invalid_grant")) {
        toast.error("Permission denied or session expired! Please disconnect and reconnect Gmail, making sure to check the boxes allowing access to read and send emails.");
      } else {
        toast.error(err?.response?.data?.message ? `Sync failed: ${err.response.data.message}` : "An error occurred starting sync");
      }
    } finally {
      // Keep syncing spinner for a bit to feel like it's doing work
      setTimeout(() => setIsSyncing(false), 2000);
    }
  };

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const responseBody = await templateService.getAll();
      let templatesArray: Template[] = [];
      
      if (Array.isArray(responseBody)) {
        templatesArray = responseBody;
      } else if (responseBody?.data?.docs && Array.isArray(responseBody.data.docs)) {
        templatesArray = responseBody.data.docs;
      } else if (responseBody?.data && Array.isArray(responseBody.data)) {
        templatesArray = responseBody.data;
      } else if (responseBody?.docs && Array.isArray(responseBody.docs)) {
        templatesArray = responseBody.docs;
      }
      
      setTemplates(templatesArray);
    } catch (error) {
      toast.error("Failed to load templates.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchResumes = async () => {
    try {
      const responseBody = await resumeService.getAll(1, 100);
      let resumesArray: Resume[] = [];
      if (Array.isArray(responseBody)) {
        resumesArray = responseBody;
      } else if (responseBody?.data?.docs && Array.isArray(responseBody.data.docs)) {
        resumesArray = responseBody.data.docs;
      } else if (responseBody?.data && Array.isArray(responseBody.data)) {
        resumesArray = responseBody.data;
      } else if (responseBody?.docs && Array.isArray(responseBody.docs)) {
        resumesArray = responseBody.docs;
      } else if (responseBody?.data?.resumes && Array.isArray(responseBody.data.resumes)) {
        resumesArray = responseBody.data.resumes;
      } else if (responseBody?.resumes && Array.isArray(responseBody.resumes)) {
        resumesArray = responseBody.resumes;
      }
      setResumes(resumesArray);
      if (resumesArray.length > 0) {
        const defaultResume = resumesArray.find(r => r.isDefault) || resumesArray[0];
        const defaultId = defaultResume.id || defaultResume.id || "";
        setSendForm(prev => ({ ...prev, resumeId: defaultId }));
        setCsvOptions(prev => ({ ...prev, resumeId: defaultId }));
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchTemplates();
    fetchResumes();
  }, []);

  useEffect(() => {
    // Check for pending email draft from AI generator
    try {
      const pendingStr = sessionStorage.getItem("pending_outbox_email");
      if (pendingStr) {
        const pending = JSON.parse(pendingStr);
        if (pending?.html) {
          const defaultResumeId = resumes.find(r => r.isDefault)?.id || resumes[0]?.id || resumes[0]?.id || "";
          setSendForm(prev => ({
            ...prev,
            subject: pending.subject || "",
            html: pending.html || "",
            useTemplate: true,
            attachResume: true,
            insertResumeLink: false,
            resumeLinkLabel: "View My Resume",
            resumeId: defaultResumeId,
            contentType: pending.contentType || "html"
          }));
          setIsSendDialogOpen(true);
          sessionStorage.removeItem("pending_outbox_email");
          toast.success("AI draft loaded into Outbox!");
        }
      }
    } catch {
      // ignore
    }
  }, [resumes]);

  const openEditTemplateDialog = (template: Template) => {
    const id = template.id || template.id;
    if (!id) return;
    setEditingTemplateId(id);
    setNewTemplate({ name: template.name, subject: template.subject, body: template.body, plainText: template.plainText || "", linkLabel: template.linkLabel || "", linkUrl: template.linkUrl || "" });
    setTemplatePreviewMode("html");
    setIsTemplateDialogOpen(true);
  };

  const handleSaveTemplate = async () => {
    try {
      setIsCreating(true);
      if (editingTemplateId) {
        await templateService.update(editingTemplateId, {
          ...newTemplate,
          placeholders: ["name", "role", "company"]
        });
        toast.success("Template updated!");
      } else {
        await templateService.create({
          ...newTemplate,
          placeholders: ["name", "role", "company"]
        });
        toast.success("Template created!");
      }
      setIsTemplateDialogOpen(false);
      setNewTemplate({ name: "", subject: "", body: "", plainText: "", linkLabel: "", linkUrl: "" });
      setEditingTemplateId(null);
      fetchTemplates();
    } catch (error) {
      toast.error(editingTemplateId ? "Failed to update template." : "Failed to create template.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!id) {
      toast.error("Template ID is missing. Cannot delete.");
      return;
    }
    try {
      await templateService.delete(id);
      setTemplates(prev => prev.filter(t => (t.id || t.id) !== id));
      toast.success("Template deleted successfully.");
    } catch (error) {
      toast.error("Failed to delete template.");
    }
  };

  const handlePreviewEmail = async () => {
    if (!sendForm.to) {
      return toast.error("Please enter a recipient email address (To) before previewing.");
    }
    
    try {
      setIsPreviewLoading(true);
      
      const r = sendForm.resumeId ? resumes.find(res => (res.id || res.id) === sendForm.resumeId) : null;
      
      let finalHtml = sendForm.html;
      let finalPlain = sendForm.contentType === 'plain' ? sendForm.html : sendForm.html.replace(/<[^>]+>/g, '');

      if (sendForm.useTemplate && sendForm.linkUrl) {
        finalHtml += `<br><br><a href="${sendForm.linkUrl}" style="display:inline-block;padding:10px 20px;background-color:#007bff;color:#fff;text-decoration:none;border-radius:5px;">${sendForm.linkLabel || 'Click Here'}</a>`;
        finalPlain += `\n\n${sendForm.linkLabel || 'Click Here'}: ${sendForm.linkUrl}`;
      }

      if (sendForm.attachments && sendForm.attachments.length > 0) {
        finalHtml += `<br><br><p><strong>Attachments:</strong></p><ul>`;
        finalPlain += `\n\nAttachments:\n`;
        sendForm.attachments.forEach(a => {
          finalHtml += `<li>${a.name} (File will be attached)</li>`;
          finalPlain += `- ${a.name} (File will be attached)\n`;
        });
        finalHtml += `</ul>`;
      }
      
      const emailData = {
        to: sendForm.to || "test@example.com",
        subject: sendForm.subject || "No Subject",
        body: finalHtml,
        html: finalHtml,
        plainText: finalPlain,
        fromEmail: gmailStatus?.email || sendForm.fromEmail || "user@example.com",
        contentType: sendForm.contentType,
        useTemplate: sendForm.useTemplate,
        insertResumeLink: sendForm.insertResumeLink,
        resumeUrl: r?.fileUrl || "",
        resumeLinkLabel: sendForm.resumeLinkLabel,
        attachResume: sendForm.attachResume,
        attachments: sendForm.attachments?.map(a => ({ name: a.name, url: a.url || "" })) || []
      };
      const res = await emailService.preview(emailData);
      if (res?.data) {
        setPreviewData(res.data);
        setIsPreviewDialogOpen(true);
      }
    } catch (error) {
      toast.error("Failed to generate preview.");
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!sendForm.to) {
      return toast.error("Please enter a recipient email address (To).");
    }

    try {
      setIsSending(true);
      setSentDeliveryStatus(null);
      
      let uploadedAttachments = [...sendForm.attachments];
      // Upload local files to get cloud URLs
      for (let i = 0; i < uploadedAttachments.length; i++) {
        if (uploadedAttachments[i].file && !uploadedAttachments[i].url) {
          try {
            const upRes = await resumeService.upload(uploadedAttachments[i].file as File, uploadedAttachments[i].name);
            if (upRes?.data?.fileUrl) {
              uploadedAttachments[i].url = upRes.data.fileUrl;
            }
          } catch (e: any) {
            console.warn("Upload endpoint rejected file, falling back to Base64", e);
            try {
              const base64Url = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(uploadedAttachments[i].file as File);
              });
              uploadedAttachments[i].url = base64Url;
            } catch (fallbackErr) {
              console.error("Failed to convert attachment to Base64", uploadedAttachments[i].name);
              toast.error(`Failed to process attachment ${uploadedAttachments[i].name}`);
              setIsSending(false);
              return;
            }
          }
        }
      }

      const r = sendForm.resumeId ? resumes.find(res => (res.id || res.id) === sendForm.resumeId) : null;

      let finalHtml = sendForm.html;
      let finalPlain = sendForm.contentType === 'plain' ? sendForm.html : sendForm.html.replace(/<[^>]+>/g, '');

      if (sendForm.useTemplate && sendForm.linkUrl) {
        finalHtml += `<br><br><a href="${sendForm.linkUrl}" style="display:inline-block;padding:10px 20px;background-color:#007bff;color:#fff;text-decoration:none;border-radius:5px;">${sendForm.linkLabel || 'Click Here'}</a>`;
        finalPlain += `\n\n${sendForm.linkLabel || 'Click Here'}: ${sendForm.linkUrl}`;
      }

      if (uploadedAttachments.filter(a => a.url).length > 0) {
        finalHtml += `<br><br><p><strong>Attachments:</strong></p><ul>`;
        finalPlain += `\n\nAttachments:\n`;
        uploadedAttachments.filter(a => a.url).forEach(a => {
          finalHtml += `<li><a href="${a.url}">${a.name}</a></li>`;
          finalPlain += `- ${a.name}: ${a.url}\n`;
        });
        finalHtml += `</ul>`;
      }

      const emailData = {
        to: sendForm.to,
        subject: sendForm.subject,
        body: finalHtml,
        html: finalHtml,
        plainText: finalPlain,
        fromEmail: gmailStatus?.email || sendForm.fromEmail,
        contentType: sendForm.contentType,
        useTemplate: sendForm.useTemplate,
        insertResumeLink: sendForm.insertResumeLink,
        resumeUrl: r?.fileUrl || "",
        resumeLinkLabel: sendForm.resumeLinkLabel,
        attachResume: sendForm.attachResume,
        attachments: uploadedAttachments.filter(a => a.url).map(a => ({ name: a.name, url: a.url! }))
      };
      
      const res = await emailService.queue(emailData);
      
      if (res?.data?.delivery) {
        setSentDeliveryStatus(res.data.delivery);
      } else {
        toast.success("Email queued for sending!");
        setIsSendDialogOpen(false);
        setSendForm({ ...sendForm, to: "", subject: "", html: "", attachments: [], templateId: "", linkUrl: "", linkLabel: "" });
      }
    } catch (error: any) {
      console.error("Queue email error:", error?.response?.data || error);
      const errMsg = error?.response?.data?.message || error?.message || "Unknown error";
      toast.error(`Failed to queue email: ${errMsg}`);
    } finally {
      setIsSending(false);
    }
  };


  const handleBulkCsvUpload = async () => {
    if (!csvFile) return toast.error("Please select a CSV file first.");
    if (!csvMapping['to']) return toast.error("Please map the 'To (Email)' column.");
    try {
      setIsUploadingCsv(true);
      const payload = { ...csvOptions, mapping: JSON.stringify(csvMapping) };
      const res = await emailService.bulkCsv(csvFile, payload as any);
      toast.success("Bulk emails processed!");
      setCsvResults(res?.data || res); // show summary instead of closing
      
      const defaultResumeId = resumes.find(r => r.isDefault)?.id || resumes[0]?.id || resumes[0]?.id || "";
      setCsvOptions({
        useTemplate: true,
        attachResume: true,
        insertResumeLink: false,
        resumeLinkLabel: "View My Resume",
        resumeId: defaultResumeId,
        contentType: "html",
        fromEmail: ""
      });
    } catch (error) {
      toast.error("Failed to upload CSV.");
    } finally {
      setIsUploadingCsv(false);
    }
  };

  const openSendDialog = (template?: Template) => {
    const defaultResumeId = resumes.find(r => r.isDefault)?.id || resumes[0]?.id || resumes[0]?.id || "";
    if (template) {
      setSendForm({
        to: "",
        subject: template.subject,
        html: template.body,
        fromEmail: gmailStatus?.email || "",
        useTemplate: true,
        attachResume: true,
        insertResumeLink: false,
        resumeLinkLabel: "View My Resume",
        resumeId: defaultResumeId,
        contentType: "html",
        templateId: template.id || template.id || "",
        linkUrl: template.linkUrl || "",
        linkLabel: template.linkLabel || "",
        attachments: [],
      });
    } else {
      setSendForm({
        to: "",
        subject: "",
        html: "",
        fromEmail: gmailStatus?.email || "",
        useTemplate: true,
        attachResume: true,
        insertResumeLink: false,
        resumeLinkLabel: "View My Resume",
        resumeId: defaultResumeId,
        contentType: "html",
        templateId: "",
        linkUrl: "",
        linkLabel: "",
        attachments: [],
      });
    }
    setIsSendDialogOpen(true);
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Format date nicely
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  // Strip HTML utility for card preview snippets
  const stripHtml = (html: string) => {
    if (!html) return "";
    let text = html
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');
    text = text.replace(/<[^>]*>/g, ' ');
    text = text.replace(/\s+/g, ' ').trim();
    return text;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Emails & Templates</h1>
          <p className="text-muted-foreground">Manage your templates and send personalized emails.</p>
        </div>
        <div className="flex items-center gap-2">
          
          {/* Gmail Connection Status — inline replacement */}
          {isCheckingGmail ? (
            <Button variant="outline" disabled>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Checking...
            </Button>
          ) : gmailStatus ? (
            <div className="flex items-center gap-2">
              <div 
                className="flex items-center gap-3 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/50 hover:bg-emerald-500/10 group"
              >
                <div className="relative">
                  <Avatar className="h-7 w-7 border border-emerald-500/30 ring-2 ring-emerald-500/20">
                    <AvatarImage src={gmailStatus.avatar} alt={gmailStatus.name} />
                    <AvatarFallback className="bg-emerald-500/20 text-emerald-600 text-[10px] font-bold">
                      {getInitials(gmailStatus.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background flex items-center justify-center">
                    <CheckCircle2 className="w-2 h-2 text-white" />
                  </div>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-foreground truncate max-w-[160px]">{gmailStatus.name}</span>
                  <span className="text-[10px] text-muted-foreground truncate max-w-[160px]">{gmailStatus.email}</span>
                </div>
                <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-emerald-500/30 text-emerald-600 bg-emerald-500/10 font-semibold shrink-0">
                  Connected
                </Badge>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 shrink-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
                    onClick={handleSyncGmail}
                    disabled={isSyncing}
                    title="Force Sync Emails"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-primary' : ''}`} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={handleDisconnectGmail}
                    disabled={isDisconnecting}
                    title="Disconnect Gmail"
                  >
                    {isDisconnecting ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <LogOut className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Button 
              variant="outline" 
              onClick={handleConnectGmail}
              disabled={isConnectingGmail}
              className="border-primary/30 hover:border-primary/50 hover:bg-primary/5"
            >
              {isConnectingGmail ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Settings2 className="w-4 h-4 mr-2" />
              )}
              {isConnectingGmail ? "Connecting..." : "Connect Gmail"}
            </Button>
          )}
          
          <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
            <DialogTrigger className={buttonVariants()}>
              <Send className="w-4 h-4 mr-2" />
              Send Email
            </DialogTrigger>
            <DialogContent className="sm:max-w-[650px] max-h-[85vh] p-0 overflow-hidden gap-0 flex flex-col border border-border/60 shadow-2xl rounded-2xl bg-background">
              {sentDeliveryStatus ? (
                <div className="p-8 flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight">Email Sent Successfully</h2>
                    <p className="text-muted-foreground text-sm">Your email has been queued and processed by the delivery provider.</p>
                  </div>
                  
                  <div className="w-full bg-muted/30 border border-border/50 rounded-xl p-5 text-sm space-y-3 text-left">
                    <div className="flex justify-between border-b border-border/30 pb-2">
                      <span className="text-muted-foreground">Provider</span>
                      <span className="font-semibold uppercase tracking-wider text-xs">{sentDeliveryStatus.provider || "SMTP"}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/30 pb-2">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant="outline" className="text-[10px] h-5 border-emerald-500/30 text-emerald-600 bg-emerald-500/10">
                        {sentDeliveryStatus.sent ? "Delivered" : "Queued"}
                      </Badge>
                    </div>
                    {sentDeliveryStatus.messageId && (
                      <div className="flex justify-between border-b border-border/30 pb-2">
                        <span className="text-muted-foreground">Message ID</span>
                        <span className="font-mono text-xs text-muted-foreground truncate max-w-[200px]">{sentDeliveryStatus.messageId}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Timestamp</span>
                      <span className="font-mono text-xs">{new Date().toLocaleTimeString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full pt-4">
                    <Button 
                      className="flex-1" 
                      variant="outline" 
                      onClick={() => {
                        setIsSendDialogOpen(false);
                        setSentDeliveryStatus(null);
                        setSendForm({ ...sendForm, to: "", subject: "", html: "", attachments: [], templateId: "", linkUrl: "", linkLabel: "" });
                      }}
                    >
                      Close
                    </Button>
                    <Button className="flex-1" onClick={handlePreviewEmail}>
                      View Sent Preview
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <DialogHeader className="px-6 py-4 border-b border-border/50 bg-muted/10 shrink-0 flex flex-row items-center justify-between">
                    <DialogTitle className="text-lg">New Message</DialogTitle>
                    <Select onValueChange={(val) => {
                      const t = templates.find(temp => (temp.id || temp.id) === val);
                      if (t) {
                        setSendForm(prev => ({
                          ...prev,
                          subject: t.subject,
                          html: prev.contentType === 'plain' ? (t.plainText || t.body) : t.body,
                          useTemplate: true,
                          templateId: t.id || t.id || "",
                          linkUrl: t.linkUrl || "",
                          linkLabel: t.linkLabel || "",
                          resumeLinkLabel: t.linkLabel || "View My Resume",
                        }));
                      }
                    }}>
                      <SelectTrigger className="w-[200px] h-8 bg-background border-border/50 text-xs">
                        <SelectValue placeholder="Select Template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map(t => (
                          <SelectItem key={t.id || t.id} value={t.id || t.id || ""}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </DialogHeader>
                  <div className="flex flex-col flex-1 overflow-hidden">
                    <div className="px-6 py-2.5 border-b border-border/50 flex items-center group focus-within:bg-muted/5 transition-colors shrink-0">
                      <span className="text-muted-foreground text-sm w-14 shrink-0">To</span>
                      <input 
                        className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground/70" 
                        value={sendForm.to} 
                        onChange={e => setSendForm({...sendForm, to: e.target.value})} 
                        placeholder="hr@company.com" 
                      />
                    </div>
                    <div className="px-6 py-2.5 border-b border-border/50 flex items-center group focus-within:bg-muted/5 transition-colors shrink-0">
                      <span className="text-muted-foreground text-sm w-14 shrink-0">From</span>
                      {gmailStatus ? (
                        <div className="flex items-center gap-2 px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/5 shrink-0">
                          <Avatar className="h-4 w-4">
                            <AvatarImage src={gmailStatus.avatar} />
                            <AvatarFallback className="text-[8px]">{getInitials(gmailStatus.name)}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium text-foreground">{gmailStatus.email}</span>
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center gap-2">
                          <input 
                            className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground/70 shrink-0" 
                            value={sendForm.fromEmail} 
                            onChange={e => setSendForm({...sendForm, fromEmail: e.target.value})} 
                            placeholder="you@domain.com" 
                          />
                          <Button variant="link" size="sm" className="h-6 px-2 text-[10px]" onClick={handleConnectGmail}>Connect Gmail</Button>
                        </div>
                      )}
                    </div>
                <div className="px-6 py-3 border-b border-border/50 flex items-center focus-within:bg-muted/5 transition-colors shrink-0">
                  <input 
                    className="flex-1 bg-transparent outline-none text-sm font-semibold placeholder:font-normal placeholder:text-muted-foreground/70" 
                    value={sendForm.subject} 
                    onChange={e => setSendForm({...sendForm, subject: e.target.value})} 
                    placeholder="Subject" 
                  />
                </div>
                
                {/* Scrollable Settings & Editor Body */}
                <div className="flex-1 overflow-y-auto bg-background flex flex-col min-h-0">
                  {/* Delivery & Resume Settings Collapsible */}
                  <div className="border-b border-border/40 bg-muted/5 transition-all shrink-0">
                    <button 
                      type="button"
                      onClick={() => setShowSendSettings(!showSendSettings)}
                      className="w-full px-6 py-2.5 flex items-center justify-between text-[11px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted/10 transition-colors tracking-wide"
                    >
                      <div className="flex items-center gap-2">
                        <Settings2 className="w-3.5 h-3.5 text-primary animate-pulse" />
                        <span>DELIVERY &amp; RESUME SETTINGS</span>
                      </div>
                      <span className="text-[10px] bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-bold">
                        {showSendSettings ? "HIDE" : "CONFIGURE"}
                      </span>
                    </button>

                    {showSendSettings && (
                      <div className="px-6 pb-4 pt-2 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border/30 bg-muted/20 animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-2 rounded-lg border border-border/40 bg-background/50 hover:bg-background/80 transition-colors">
                            <div className="flex flex-col">
                              <span className="text-xs font-semibold text-foreground">Wrap in Premium Card</span>
                              <span className="text-[9px] text-muted-foreground">Standard outreach card container</span>
                            </div>
                            <Switch 
                              checked={sendForm.useTemplate} 
                              onCheckedChange={(checked) => setSendForm({ ...sendForm, useTemplate: checked })} 
                            />
                          </div>

                          <div className="flex items-center justify-between p-2 rounded-lg border border-border/40 bg-background/50 hover:bg-background/80 transition-colors">
                            <div className="flex flex-col">
                              <span className="text-xs font-semibold text-foreground">Attach Resume PDF</span>
                              <span className="text-[9px] text-muted-foreground">Attach physical PDF file</span>
                            </div>
                            <Switch 
                              checked={sendForm.attachResume} 
                              onCheckedChange={(checked) => setSendForm({ ...sendForm, attachResume: checked })} 
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Content Type</label>
                            <Select 
                              value={sendForm.contentType} 
                              onValueChange={(val) => setSendForm({ ...sendForm, contentType: val || "html", ...(val === "plain" ? { useTemplate: false } : {}) })}
                            >
                              <SelectTrigger className="h-8 bg-background/50 text-xs border-border/40 focus:ring-0">
                                <SelectValue placeholder="HTML Formatted" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="html">HTML Formatted</SelectItem>
                                <SelectItem value="plain">Plain Text</SelectItem>
                                <SelectItem value="auto">Auto Detect</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {sendForm.useTemplate && (
                            <div className="space-y-3 pb-2 border-b border-border/30">
                              <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">Custom Action Button</span>
                                <span className="text-[9px] text-muted-foreground mb-2">Configure the primary button in the template.</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-muted-foreground uppercase">Button Text</label>
                                  <Input 
                                    value={sendForm.linkLabel} 
                                    onChange={(e) => setSendForm({ ...sendForm, linkLabel: e.target.value })}
                                    placeholder="e.g. Portfolio"
                                    className="h-8 bg-background/50 text-xs border-border/40"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-muted-foreground uppercase">Button URL</label>
                                  <Input 
                                    value={sendForm.linkUrl} 
                                    onChange={(e) => setSendForm({ ...sendForm, linkUrl: e.target.value })}
                                    placeholder="https://..."
                                    className="h-8 bg-background/50 text-xs border-border/40"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between p-2 rounded-lg border border-border/40 bg-background/50 hover:bg-background/80 transition-colors">
                            <div className="flex flex-col">
                              <span className="text-xs font-semibold text-foreground">Insert Resume Link</span>
                              <span className="text-[9px] text-muted-foreground">Embed a clickable preview button</span>
                            </div>
                            <Switch 
                              checked={sendForm.insertResumeLink} 
                              onCheckedChange={(checked) => setSendForm({ ...sendForm, insertResumeLink: checked })} 
                            />
                          </div>

                          <div className="flex flex-col gap-0.5 justify-center">
                            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Select Resume</label>
                            <Select 
                              value={sendForm.resumeId} 
                              onValueChange={(val) => setSendForm({ ...sendForm, resumeId: val || "" })}
                            >
                              <SelectTrigger className="h-8 bg-background/50 text-xs border-border/40 focus:ring-0">
                                <SelectValue placeholder="Default Resume (Fallback)" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">Default Resume (Fallback)</SelectItem>
                                {resumes.map((r, i) => {
                                  let displayName = r.name || "Resume Document";
                                  if (/^[0-9a-fA-F]{24}$/.test(displayName)) {
                                    displayName = "Resume Document";
                                  }
                                  return (
                                    <SelectItem key={r.id || i} value={r.id || ""}>
                                      {displayName} {r.isDefault ? "(Default)" : ""}
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </div>

                          {sendForm.insertResumeLink && (
                            <div className="space-y-1 pt-1 animate-in fade-in duration-200">
                              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Button Label Text</label>
                              <Input 
                                value={sendForm.resumeLinkLabel} 
                                onChange={(e) => setSendForm({ ...sendForm, resumeLinkLabel: e.target.value })}
                                placeholder="View My Resume"
                                className="h-8 bg-background/50 text-xs border-border/40"
                              />
                            </div>
                          )}

                          <div className="pt-2 border-t border-border/30">
                            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Additional Attachments</label>
                            <div 
                              className="border border-dashed border-border/60 rounded-md p-3 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/10 transition-colors bg-background/30"
                              onClick={() => document.getElementById('attachment-upload')?.click()}
                            >
                              <UploadCloud className="w-4 h-4 text-muted-foreground mb-1" />
                              <span className="text-[9px] text-muted-foreground">Click to browse or drag & drop</span>
                              <input 
                                id="attachment-upload" 
                                type="file" 
                                multiple 
                                className="hidden" 
                                onChange={(e) => {
                                  if (e.target.files) {
                                    const newFiles = Array.from(e.target.files).map(f => ({ name: f.name, file: f }));
                                    setSendForm(prev => ({ ...prev, attachments: [...(prev.attachments || []), ...newFiles] }));
                                  }
                                }} 
                              />
                            </div>
                            {sendForm.attachments && sendForm.attachments.length > 0 && (
                              <div className="mt-2 space-y-1.5 max-h-[100px] overflow-y-auto custom-scrollbar">
                                {sendForm.attachments.map((att, idx) => (
                                  <div key={idx} className="flex items-center justify-between bg-background/50 border border-border/40 px-2 py-1.5 rounded text-[10px]">
                                    <span className="truncate max-w-[140px] text-foreground/80" title={att.name}>{att.name}</span>
                                    <button 
                                      className="text-destructive hover:bg-destructive/10 p-0.5 rounded"
                                      onClick={() => {
                                        setSendForm(prev => ({ ...prev, attachments: prev.attachments.filter((_, i) => i !== idx) }));
                                      }}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="px-6 py-4 flex-1 min-h-[300px] bg-background">
                    {sendForm.contentType === "plain" ? (
                      <textarea
                        className="w-full h-full min-h-[280px] bg-transparent outline-none resize-none text-sm text-foreground/90 leading-relaxed placeholder:text-muted-foreground/70 whitespace-pre-wrap"
                        value={sendForm.html}
                        onChange={e => setSendForm({ ...sendForm, html: e.target.value })}
                        placeholder="Write your plain text email here..."
                      />
                    ) : (
                      <div 
                        contentEditable
                        suppressContentEditableWarning
                        className="w-full h-full min-h-[280px] bg-transparent outline-none resize-none text-sm text-foreground/90 leading-relaxed empty:before:content-['Write_your_email_here...'] empty:before:text-muted-foreground/70"
                        onBlur={e => setSendForm({...sendForm, html: e.currentTarget.innerHTML})} 
                        dangerouslySetInnerHTML={{ __html: sendForm.html }}
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className="px-6 py-3 bg-muted/10 flex items-center justify-between border-t border-border/50 shrink-0">
                    <div className="flex items-center gap-2">
                      <Button className="px-6 rounded-full font-medium shadow-sm" onClick={handleSendEmail} disabled={isSending || (!gmailStatus && !sendForm.fromEmail)}>
                        {isSending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-3.5 h-3.5 mr-2" />} Send
                      </Button>
                      <Button variant="outline" className="px-4 rounded-full" onClick={handlePreviewEmail} disabled={isPreviewLoading}>
                        {isPreviewLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-3.5 h-3.5 mr-2" />} Preview
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:text-foreground" onClick={() => setIsSendDialogOpen(false)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
            <DialogContent className="sm:max-w-[700px] max-h-[85vh] p-0 overflow-hidden flex flex-col">
              <DialogHeader className="px-6 py-4 border-b border-border/50 bg-muted/10">
                <DialogTitle>Email Preview</DialogTitle>
                <div className="flex gap-4 pt-2">
                  <div className="text-xs text-muted-foreground"><strong>To:</strong> {previewData?.to || 'Not specified'}</div>
                  <div className="text-xs text-muted-foreground"><strong>Subject:</strong> {previewData?.subject || 'Not specified'}</div>
                </div>
              </DialogHeader>
              
              <div className="flex border-b border-border/50 bg-muted/5">
                <button
                  className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${previewTab === 'html' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={() => setPreviewTab('html')}
                >
                  Visual (HTML)
                </button>
                <button
                  className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${previewTab === 'plain' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={() => setPreviewTab('plain')}
                >
                  Plain Text
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-zinc-950 min-h-[350px]">
                {previewTab === 'html' && previewData?.html && (
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-a:text-blue-600">
                    <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(previewData.html) }} />
                    {sendForm.insertResumeLink && sendForm.resumeLinkLabel && sendForm.resumeId && (
                      <div className="mt-6">
                        <a href="#" className="inline-block px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-md text-decoration-none hover:bg-blue-700">
                          {sendForm.resumeLinkLabel}
                        </a>
                      </div>
                    )}
                  </div>
                )}
                {previewTab === 'plain' && previewData?.plainText && (
                  <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-foreground/80">
                    {previewData.plainText}
                    {sendForm.insertResumeLink && sendForm.resumeLinkLabel && sendForm.resumeId && (
                      `\n\n[${sendForm.resumeLinkLabel}: https://example.com/resume-preview]`
                    )}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCsvDialogOpen} onOpenChange={setIsCsvDialogOpen}>
            <DialogTrigger className={buttonVariants({ variant: "outline" })}>
              <UploadCloud className="w-4 h-4 mr-2" />
              Bulk CSV
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{csvResults ? "Bulk Upload Complete" : "Upload Bulk CSV"}</DialogTitle>
              </DialogHeader>
              
              {csvResults ? (
                <div className="space-y-4 pt-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div className="bg-muted/30 border border-border/50 rounded-lg p-4 text-sm space-y-3 text-left">
                    <div className="flex justify-between border-b border-border/30 pb-2">
                      <span className="text-muted-foreground">Rows Imported</span>
                      <span className="font-bold">{csvResults.imported || csvResults.total || 0}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/30 pb-2">
                      <span className="text-muted-foreground">Successfully Queued</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-500">{csvResults.success || csvResults.sent || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Errors</span>
                      <span className="font-bold text-destructive">{csvResults.errors || csvResults.failed || 0}</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" onClick={() => { setCsvResults(null); setIsCsvDialogOpen(false); }}>
                    Done
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>CSV File</Label>
                    <Input 
                      type="file" 
                      accept=".csv"
                      onChange={e => {
                        const file = e.target.files?.[0] || null;
                        setCsvFile(file);
                        if (file) {
                          Papa.parse(file, {
                            header: true,
                            preview: 20,
                            skipEmptyLines: true,
                            complete: (results) => {
                              setCsvPreviewRows(results.data);
                              if (results.meta.fields) {
                                setCsvColumns(results.meta.fields);
                                const mapping: Record<string, string> = {};
                                const lower = results.meta.fields.map(f => f.toLowerCase());
                                if (lower.includes('to')) mapping['to'] = results.meta.fields[lower.indexOf('to')];
                                else if (lower.includes('email')) mapping['to'] = results.meta.fields[lower.indexOf('email')];
                                
                                if (lower.includes('subject')) mapping['subject'] = results.meta.fields[lower.indexOf('subject')];
                                if (lower.includes('name')) mapping['name'] = results.meta.fields[lower.indexOf('name')];
                                if (lower.includes('role')) mapping['role'] = results.meta.fields[lower.indexOf('role')];
                                setCsvMapping(mapping);
                              }
                            }
                          });
                        } else {
                          setCsvPreviewRows([]);
                          setCsvColumns([]);
                        }
                      }} 
                    />
                    <p className="text-xs text-muted-foreground mt-1">Upload a CSV file containing email data.</p>
                  </div>

                  {csvColumns.length > 0 && (
                    <div className="space-y-4 p-4 rounded-xl border border-indigo-100/50 dark:border-indigo-900/30 bg-gradient-to-br from-indigo-50/30 to-purple-50/30 dark:from-indigo-950/20 dark:to-purple-950/20 animate-in fade-in slide-in-from-bottom-2 duration-300 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/50 rounded-md">
                          <Settings2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <span className="text-[11px] font-bold text-foreground uppercase tracking-wider">Column Mapping</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 group">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase transition-colors group-hover:text-indigo-500">To (Email) <span className="text-destructive">*</span></label>
                          <Select value={csvMapping['to'] || ""} onValueChange={(v) => setCsvMapping({...csvMapping, to: v ?? ""})}>
                            <SelectTrigger className="h-9 text-xs transition-all duration-200 hover:border-indigo-300 focus:ring-indigo-500/20"><SelectValue placeholder="Select column" /></SelectTrigger>
                            <SelectContent>{csvColumns.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5 group">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase transition-colors group-hover:text-indigo-500">Subject</label>
                          <Select value={csvMapping['subject'] || "none"} onValueChange={(v) => setCsvMapping({...csvMapping, subject: (v === "none" || v == null) ? "" : v})}>
                            <SelectTrigger className="h-9 text-xs transition-all duration-200 hover:border-indigo-300 focus:ring-indigo-500/20"><SelectValue placeholder="Skip mapping" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none" className="text-muted-foreground italic">Skip mapping</SelectItem>
                              {csvColumns.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5 group">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase transition-colors group-hover:text-indigo-500">Name</label>
                          <Select value={csvMapping['name'] || "none"} onValueChange={(v) => setCsvMapping({...csvMapping, name: (v === "none" || v == null) ? "" : v})}>
                            <SelectTrigger className="h-9 text-xs transition-all duration-200 hover:border-indigo-300 focus:ring-indigo-500/20"><SelectValue placeholder="Skip mapping" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none" className="text-muted-foreground italic">Skip mapping</SelectItem>
                              {csvColumns.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5 group">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase transition-colors group-hover:text-indigo-500">Role</label>
                          <Select value={csvMapping['role'] || "none"} onValueChange={(v) => setCsvMapping({...csvMapping, role: (v === "none" || v == null) ? "" : v})}>
                            <SelectTrigger className="h-9 text-xs transition-all duration-200 hover:border-indigo-300 focus:ring-indigo-500/20"><SelectValue placeholder="Skip mapping" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none" className="text-muted-foreground italic">Skip mapping</SelectItem>
                              {csvColumns.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}

                  {csvPreviewRows.length > 0 && (
                    <div className="rounded-xl border border-border/40 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-3 duration-500">
                      <div className="bg-gradient-to-r from-muted/30 to-muted/10 px-4 py-2.5 border-b border-border/40 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Data Preview
                        </span>
                        <Badge variant="secondary" className="text-[9px] px-1.5 py-0 border-border/50">First {Math.min(20, csvPreviewRows.length)} rows</Badge>
                      </div>
                      <div className="overflow-x-auto max-h-[180px] overflow-y-auto custom-scrollbar bg-background">
                        <table className="w-full text-xs text-left whitespace-nowrap">
                          <thead className="sticky top-0 bg-background/80 backdrop-blur-md z-10 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                            <tr>
                              {csvColumns.map(c => (
                                <th key={c} className="px-4 py-2 font-semibold text-muted-foreground">{c}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/20">
                            {csvPreviewRows.map((row, i) => (
                              <tr key={i} className="hover:bg-muted/30 transition-colors duration-150">
                                {csvColumns.map(c => (
                                  <td key={c} className="px-4 py-2 text-foreground/80 font-medium">{row[c] as React.ReactNode}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Global CSV Options */}
                  <div className="space-y-4 p-4 rounded-xl border border-blue-100/60 dark:border-blue-900/40 bg-gradient-to-br from-blue-50/40 to-cyan-50/20 dark:from-blue-950/20 dark:to-cyan-950/10 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-md">
                        <Settings2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-spin-slow" />
                      </div>
                      <span className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                        Delivery Settings
                      </span>
                    </div>

                    <div className="space-y-1.5 pb-4 border-b border-blue-100/50 dark:border-blue-900/30">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Sender Email <span className="opacity-60">(Optional)</span></label>
                      <Input 
                        placeholder="e.g. custom_sender@yourdomain.com" 
                        value={csvOptions.fromEmail}
                        onChange={e => setCsvOptions({ ...csvOptions, fromEmail: e.target.value })}
                        className="h-9 bg-background/70 backdrop-blur-sm text-xs border-blue-100 dark:border-blue-900/50 focus-visible:ring-blue-500/30 transition-all shadow-inner"
                      />
                      <p className="text-[10px] text-muted-foreground/80 italic">If left empty, defaults to your connected Gmail account.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-background/60 hover:bg-background/80 transition-all hover:shadow-sm hover:border-blue-200 dark:hover:border-blue-800/50 group">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-semibold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Wrap in Premium Card</span>
                          <span className="text-[10px] text-muted-foreground">Apply rich HTML template</span>
                        </div>
                        <Switch 
                          checked={csvOptions.useTemplate} 
                          onCheckedChange={(checked) => setCsvOptions({ ...csvOptions, useTemplate: checked })} 
                          className="data-[state=checked]:bg-blue-600"
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-background/60 hover:bg-background/80 transition-all hover:shadow-sm hover:border-blue-200 dark:hover:border-blue-800/50 group">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-semibold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Attach Resume PDF</span>
                          <span className="text-[10px] text-muted-foreground">Include physical PDF</span>
                        </div>
                        <Switch 
                          checked={csvOptions.attachResume} 
                          onCheckedChange={(checked) => setCsvOptions({ ...csvOptions, attachResume: checked })} 
                          className="data-[state=checked]:bg-blue-600"
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-background/60 hover:bg-background/80 transition-all hover:shadow-sm hover:border-blue-200 dark:hover:border-blue-800/50 group">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-semibold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Insert Resume Link</span>
                          <span className="text-[10px] text-muted-foreground">Add clickable web preview</span>
                        </div>
                        <Switch 
                          checked={csvOptions.insertResumeLink} 
                          onCheckedChange={(checked) => setCsvOptions({ ...csvOptions, insertResumeLink: checked })} 
                          className="data-[state=checked]:bg-blue-600"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5 justify-center">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Select Resume</label>
                        <Select 
                          value={csvOptions.resumeId} 
                          onValueChange={(val) => setCsvOptions({ ...csvOptions, resumeId: val || "" })}
                        >
                          <SelectTrigger className="h-9 bg-background/60 hover:bg-background/80 transition-all text-xs border-border/40 focus:ring-blue-500/30">
                            <SelectValue placeholder="Default Resume (Fallback)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Default Resume (Fallback)</SelectItem>
                            {resumes.map((r, i) => {
                              const displayName = r.name || r.title || `Resume ${r.id?.substring(0, 8)}...`;
                              return (
                                <SelectItem key={r.id || i} value={r.id || ""}>
                                  {displayName.length > 22 ? displayName.substring(0, 22) + "..." : displayName} {r.isDefault ? "(Default)" : ""}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex flex-col gap-1.5 justify-center sm:col-span-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Content Formatting</label>
                        <Select 
                          value={csvOptions.contentType} 
                          onValueChange={(val) => setCsvOptions({ ...csvOptions, contentType: val || "html", ...(val === "plain" ? { useTemplate: false } : {}) })}
                        >
                          <SelectTrigger className="h-9 bg-background/60 hover:bg-background/80 transition-all text-xs border-border/40 focus:ring-blue-500/30">
                            <SelectValue placeholder="HTML Formatted" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="html">HTML Formatted (Recommended)</SelectItem>
                            <SelectItem value="plain">Plain Text</SelectItem>
                            <SelectItem value="auto">Auto Detect</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {csvOptions.insertResumeLink && (
                      <div className="space-y-1.5 pt-2 animate-in fade-in slide-in-from-top-1 duration-300">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Button Label Text</label>
                        <Input 
                          value={csvOptions.resumeLinkLabel} 
                          onChange={(e) => setCsvOptions({ ...csvOptions, resumeLinkLabel: e.target.value })}
                          placeholder="e.g. View My Complete Resume"
                          className="h-9 bg-background/70 backdrop-blur-sm text-xs border-blue-100 dark:border-blue-900/50 focus-visible:ring-blue-500/30 transition-all shadow-inner"
                        />
                      </div>
                    )}
                  </div>

                  <Button 
                    className="w-full h-11 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-[1.01]" 
                    onClick={handleBulkCsvUpload} 
                    disabled={isUploadingCsv || !csvFile}
                  >
                    {isUploadingCsv ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloud className="w-5 h-5 mr-2" />} 
                    {isUploadingCsv ? "Uploading..." : "Upload & Send Bulk Campaign"}
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>

        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Saved Templates</h2>
        <Dialog open={isTemplateDialogOpen} onOpenChange={(open) => {
          setIsTemplateDialogOpen(open);
          if (!open) {
            setEditingTemplateId(null);
            setNewTemplate({ name: "", subject: "", body: "", plainText: "", linkLabel: "", linkUrl: "" });
          }
        }}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" onClick={() => {
              setEditingTemplateId(null);
              setNewTemplate({ name: "", subject: "", body: "", plainText: "", linkLabel: "", linkUrl: "" });
              setTemplatePreviewMode("html");
            }}>
              <Plus className="w-4 h-4 mr-2" /> New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[650px] max-h-[85vh] p-0 overflow-hidden gap-0 flex flex-col border border-border/60 shadow-2xl rounded-2xl bg-background">
            <DialogHeader className="px-6 py-4 border-b border-border/50 bg-muted/10 shrink-0">
              <DialogTitle className="text-lg">{editingTemplateId ? "Edit Template" : "Create Template"}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="px-6 py-2.5 border-b border-border/50 flex items-center group focus-within:bg-muted/5 transition-colors shrink-0">
                <span className="text-muted-foreground text-sm w-28 shrink-0">Template Name</span>
                <input 
                  className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground/70" 
                  value={newTemplate.name} 
                  onChange={e => setNewTemplate({...newTemplate, name: e.target.value})} 
                  placeholder="e.g. Standard Developer Follow-up" 
                />
              </div>
              <div className="px-6 py-3 border-b border-border/50 flex items-center focus-within:bg-muted/5 transition-colors shrink-0">
                <span className="text-muted-foreground text-sm w-28 shrink-0">Subject</span>
                <input 
                  className="flex-1 bg-transparent outline-none text-sm font-semibold placeholder:font-normal placeholder:text-muted-foreground/70" 
                  value={newTemplate.subject} 
                  onChange={e => setNewTemplate({...newTemplate, subject: e.target.value})} 
                  placeholder="Application for {{role}}" 
                />
              </div>
              
              {/* Extra Template Fields */}
              <div className="px-6 py-3 border-b border-border/50 grid grid-cols-2 gap-4 bg-muted/10 shrink-0">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Link Label (Optional)</label>
                  <input 
                    className="w-full bg-background border border-border/40 px-3 py-1.5 rounded-md text-sm outline-none focus:border-primary/50 transition-colors" 
                    value={newTemplate.linkLabel} 
                    onChange={e => setNewTemplate({...newTemplate, linkLabel: e.target.value})} 
                    placeholder="e.g. View My Resume" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center justify-between">
                    Link URL (Optional)
                    {newTemplate.linkUrl && (() => {
                      try { new URL(newTemplate.linkUrl); return null; }
                      catch { return <span className="text-destructive font-normal lowercase">Invalid URL</span>; }
                    })()}
                  </label>
                  <input 
                    className={`w-full bg-background border px-3 py-1.5 rounded-md text-sm outline-none transition-colors ${newTemplate.linkUrl && (() => { try { new URL(newTemplate.linkUrl); return false; } catch { return true; }})() ? 'border-destructive focus:border-destructive' : 'border-border/40 focus:border-primary/50'}`}
                    value={newTemplate.linkUrl} 
                    onChange={e => setNewTemplate({...newTemplate, linkUrl: e.target.value})} 
                    placeholder="https://..." 
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between px-6 py-2 border-b border-border/50 bg-muted/5 shrink-0">
                <span className="text-xs font-semibold text-muted-foreground">Message Body</span>
                <div className="flex items-center gap-3">
                  <Select onValueChange={(val) => {
                    const placeholder = `{{${val}}}`;
                    if (templatePreviewMode === "plain") {
                      // Basic append for textarea if cursor not tracked, but we can do a simple append.
                      setNewTemplate(prev => ({...prev, plainText: prev.plainText + placeholder}));
                    } else {
                      document.execCommand('insertText', false, placeholder);
                      setNewTemplate(prev => ({...prev, body: prev.body + (document.activeElement?.tagName === 'DIV' ? '' : placeholder)}));
                    }
                  }}>
                    <SelectTrigger className="h-7 w-[140px] text-[10px] bg-background">
                      <SelectValue placeholder="Insert Placeholder" />
                    </SelectTrigger>
                    <SelectContent>
                      {['name', 'role', 'company'].map(p => (
                        <SelectItem key={p} value={p}>{`{{${p}}}`}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex items-center bg-muted/50 p-0.5 rounded-lg border border-border/40">
                  <button
                    onClick={() => setTemplatePreviewMode("html")}
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide rounded-md transition-all ${templatePreviewMode === "html" ? "bg-background shadow-[0_1px_2px_rgba(0,0,0,0.1)] text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Visual / HTML
                  </button>
                  <button
                    onClick={() => setTemplatePreviewMode("plain")}
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide rounded-md transition-all ${templatePreviewMode === "plain" ? "bg-background shadow-[0_1px_2px_rgba(0,0,0,0.1)] text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Plain Text
                  </button>
                </div>
                </div>
              </div>

              {/* Scrollable Template Body Editor */}
              <div className="flex-1 overflow-y-auto bg-background flex flex-col min-h-0">
                <div className="px-6 py-4 flex-1 min-h-[300px]">
                  {templatePreviewMode === "plain" ? (
                    <textarea
                      className="w-full h-full min-h-[280px] bg-transparent outline-none resize-none text-sm text-foreground/90 font-mono leading-relaxed placeholder:text-muted-foreground/70"
                      value={newTemplate.plainText}
                      onChange={e => setNewTemplate({ ...newTemplate, plainText: e.target.value })}
                      placeholder="Write your plain text version here... Use placeholders like {{name}} or {{role}}."
                    />
                  ) : (
                    <div 
                      contentEditable
                      suppressContentEditableWarning
                      className="w-full h-full min-h-[280px] bg-transparent outline-none resize-none text-sm text-foreground/90 leading-relaxed empty:before:content-['Hi_{{name}},_write_your_template_body_here..._You_can_use_placeholders_like_{{name}},_{{company}},_and_{{role}}.'] empty:before:text-muted-foreground/70 prose prose-sm max-w-none"
                      onBlur={e => setNewTemplate({...newTemplate, body: e.currentTarget.innerHTML})} 
                      dangerouslySetInnerHTML={{ __html: newTemplate.body }}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="px-6 py-3 bg-muted/10 flex items-center justify-between border-t border-border/50 shrink-0">
              <Button className="px-6 rounded-full font-medium shadow-sm" onClick={handleSaveTemplate} disabled={isCreating}>
                {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-3.5 h-3.5 mr-2" />} 
                {editingTemplateId ? "Update Template" : "Save Template"}
              </Button>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:text-foreground" onClick={() => setIsTemplateDialogOpen(false)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="h-[260px] border-border/40 bg-card flex flex-col overflow-hidden relative">
              <CardHeader className="pb-4 pt-5 px-5 border-b border-border/20">
                <div className="space-y-3">
                  <Skeleton className="h-5 w-24 rounded-md" />
                  <Skeleton className="h-6 w-full rounded-md" />
                </div>
              </CardHeader>
              <CardContent className="flex-1 pt-5 pb-4 px-5">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[90%]" />
                  <Skeleton className="h-4 w-[80%]" />
                </div>
              </CardContent>
              <CardFooter className="pt-3 pb-5 px-5 bg-card mt-auto flex items-center gap-3 border-t border-border/10">
                <Skeleton className="h-10 flex-1 rounded-md" />
                <Skeleton className="h-10 w-[80px] rounded-md" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-10 bg-card rounded-xl border border-border/50">
          <Mail className="w-10 h-10 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium">No templates found</h3>
          <p className="text-muted-foreground text-sm mt-1">Create your first email template to speed up your workflow.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template, i) => (
            <motion.div
              key={template.id || template.id || i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05, ease: "easeOut" }}
              className="h-full"
            >
              <Card className="h-full border-border/40 bg-card hover:-translate-y-1.5 transition-all duration-300 flex flex-col group overflow-hidden relative hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-primary/30 dark:hover:shadow-[0_8px_30px_rgba(255,255,255,0.05)]">
                {/* Decorative top gradient border */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <CardHeader className="pb-4 pt-5 px-5 bg-gradient-to-b from-muted/30 to-transparent border-b border-border/20">
                  <div className="flex justify-between items-start gap-4 relative z-10">
                    <div className="space-y-2.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider bg-primary/10 text-primary border-primary/20 shadow-sm">Template</Badge>
                        <span className="text-xs font-medium text-muted-foreground truncate" title={template.name}>{template.name}</span>
                      </div>
                      <CardTitle className="text-base font-semibold leading-snug line-clamp-2 text-foreground/90 group-hover:text-primary transition-colors" title={template.subject}>
                        {template.subject || "(No Subject)"}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 pt-5 pb-4 px-5 relative z-10">
                  <div className="text-sm text-muted-foreground leading-relaxed line-clamp-4 font-sans max-w-none relative">
                    {template.plainText ? template.plainText : stripHtml(template.body)}
                  </div>
                </CardContent>
                <CardFooter className="pt-3 pb-5 px-5 bg-card mt-auto flex items-center gap-3 shrink-0 relative z-10 border-t border-border/10">
                  <Button 
                    className="flex-1 font-medium shadow-sm transition-all bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border-0 group-hover:shadow-md" 
                    onClick={() => openSendDialog(template)}
                  >
                    <Mail className="w-4 h-4 mr-2" /> Use Template
                  </Button>
                  <div className="flex items-center bg-muted/40 rounded-lg p-1 shrink-0 transition-colors group-hover:bg-muted/70">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-background rounded-md transition-all" 
                      onClick={() => openEditTemplateDialog(template)}
                      title="Edit Template"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all" 
                      onClick={() => handleDeleteTemplate(template.id || template.id || "")}
                      title="Delete Template"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
