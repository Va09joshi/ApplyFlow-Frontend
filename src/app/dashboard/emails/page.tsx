"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send, Settings2, Plus, Mail, Trash2, Loader2, Play, UploadCloud, Edit2, CheckCircle2, LogOut } from "lucide-react";
import * as motion from "framer-motion/client";
import { templateService, Template } from "@/services/template.service";
import { emailService, GmailStatus } from "@/services/email.service";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { resumeService, Resume } from "@/services/resume.service";

export default function EmailAutomationsPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Gmail connection state
  const [gmailStatus, setGmailStatus] = useState<GmailStatus | null>(null);
  const [isCheckingGmail, setIsCheckingGmail] = useState(true);
  const [isConnectingGmail, setIsConnectingGmail] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // New/Edit Template Form
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [newTemplate, setNewTemplate] = useState({ name: "", subject: "", body: "" });
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
    contentType: "html"
  });
  const [isSending, setIsSending] = useState(false);

  // Bulk CSV Form
  const [isCsvDialogOpen, setIsCsvDialogOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);
  const [csvOptions, setCsvOptions] = useState({
    useTemplate: true,
    attachResume: true,
    insertResumeLink: false,
    resumeLinkLabel: "View My Resume",
    resumeId: "",
    contentType: "html"
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
        const popup = window.open(
          res.data.url,
          'Gmail Connect',
          `width=${width},height=${height},left=${left},top=${top}`
        );

        // Actively poll the backend status while popup is open.
        // The backend callback processes the OAuth code and stores credentials,
        // but the popup just shows the raw JSON response — it never sends
        // a postMessage back. So we poll every 2s to detect when the backend
        // has recorded the connection, then auto-close the popup.
        let resolved = false;
        const pollInterval = setInterval(async () => {
          if (resolved) return;

          // If popup was closed by user, do one final check and stop
          if (!popup || popup.closed) {
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
              try { popup?.close(); } catch { /* cross-origin or already closed */ }
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
    } catch {
      toast.error("Failed to disconnect Gmail");
    } finally {
      setIsDisconnecting(false);
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
      }
      setResumes(resumesArray);
      if (resumesArray.length > 0) {
        const defaultResume = resumesArray.find(r => r.isDefault) || resumesArray[0];
        const defaultId = defaultResume._id || defaultResume.id || "";
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
          const defaultResumeId = resumes.find(r => r.isDefault)?._id || resumes[0]?._id || resumes[0]?.id || "";
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
    const id = template._id || template.id;
    if (!id) return;
    setEditingTemplateId(id);
    setNewTemplate({ name: template.name, subject: template.subject, body: template.body });
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
      setNewTemplate({ name: "", subject: "", body: "" });
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
      setTemplates(prev => prev.filter(t => (t._id || t.id) !== id));
      toast.success("Template deleted successfully.");
    } catch (error) {
      toast.error("Failed to delete template.");
    }
  };

  const handleSendEmail = async () => {
    try {
      setIsSending(true);
      const emailData = {
        ...sendForm,
        fromEmail: gmailStatus?.email || sendForm.fromEmail,
      };
      await emailService.queue(emailData);
      toast.success("Email queued for sending!");
      setIsSendDialogOpen(false);
      
      const defaultResumeId = resumes.find(r => r.isDefault)?._id || resumes[0]?._id || resumes[0]?.id || "";
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
        contentType: "html"
      });
    } catch (error) {
      toast.error("Failed to queue email. Please ensure you have connected Gmail.");
    } finally {
      setIsSending(false);
    }
  };

  const handleBulkCsvUpload = async () => {
    if (!csvFile) return toast.error("Please select a CSV file first.");
    try {
      setIsUploadingCsv(true);
      await emailService.bulkCsv(csvFile, csvOptions);
      toast.success("Bulk emails queued successfully!");
      setIsCsvDialogOpen(false);
      setCsvFile(null);
      
      const defaultResumeId = resumes.find(r => r.isDefault)?._id || resumes[0]?._id || resumes[0]?.id || "";
      setCsvOptions({
        useTemplate: true,
        attachResume: true,
        insertResumeLink: false,
        resumeLinkLabel: "View My Resume",
        resumeId: defaultResumeId,
        contentType: "html"
      });
    } catch (error) {
      toast.error("Failed to upload CSV.");
    } finally {
      setIsUploadingCsv(false);
    }
  };

  const openSendDialog = (template?: Template) => {
    const defaultResumeId = resumes.find(r => r.isDefault)?._id || resumes[0]?._id || resumes[0]?.id || "";
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
        contentType: "html"
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
        contentType: "html"
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
    let text = html.replace(/<[^>]*>/g, ' ');
    text = text
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ')
      .trim();
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
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all duration-200"
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
              <DialogHeader className="px-6 py-4 border-b border-border/50 bg-muted/10 shrink-0">
                <DialogTitle className="text-lg">New Message</DialogTitle>
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
                    <input 
                      className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground/70 shrink-0" 
                      value={sendForm.fromEmail} 
                      onChange={e => setSendForm({...sendForm, fromEmail: e.target.value})} 
                      placeholder="you@gmail.com" 
                    />
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

                          <div className="flex flex-col gap-1">
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
                                {resumes.map((r, i) => (
                                  <SelectItem key={r._id || r.id || i} value={r._id || r.id || ""}>
                                    {r.name} {r.isDefault ? "(Default)" : ""}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {sendForm.insertResumeLink && (
                          <div className="md:col-span-2 space-y-1 animate-in fade-in duration-200">
                            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Button Label Text</label>
                            <Input 
                              value={sendForm.resumeLinkLabel} 
                              onChange={(e) => setSendForm({ ...sendForm, resumeLinkLabel: e.target.value })}
                              placeholder="View My Resume"
                              className="h-8 bg-background/50 text-xs border-border/40"
                            />
                          </div>
                        )}
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
                <Button className="px-6 rounded-full font-medium shadow-sm" onClick={handleSendEmail} disabled={isSending || (!gmailStatus && !sendForm.fromEmail)}>
                  {isSending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-3.5 h-3.5 mr-2" />} Send
                </Button>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:text-foreground" onClick={() => setIsSendDialogOpen(false)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
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
                <DialogTitle>Upload Bulk CSV</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>CSV File</Label>
                  <Input 
                    type="file" 
                    accept=".csv"
                    onChange={e => setCsvFile(e.target.files?.[0] || null)} 
                  />
                  <p className="text-xs text-muted-foreground mt-1">Upload a CSV file containing email data.</p>
                  <div className="mt-2.5 p-2.5 rounded-lg border border-primary/20 bg-primary/5 text-[11px] text-muted-foreground leading-relaxed animate-in fade-in duration-200">
                    💡 <strong>Pro Tip</strong>: You can personalize content types per recipient! Include a column named <code>contentType</code> with the value <code>plain</code> inside your CSV file to send lightweight plain-text emails for individual rows.
                  </div>
                </div>

                {/* Global CSV Options */}
                <div className="space-y-3 p-3 rounded-lg border border-border/40 bg-muted/10">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                    <Settings2 className="w-3.5 h-3.5 text-primary animate-pulse" />
                    Global CSV Delivery Settings
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="flex items-center justify-between p-2 rounded-md border border-border/40 bg-background/50">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-semibold text-foreground">Wrap in Premium Card</span>
                        <span className="text-[9px] text-muted-foreground">Apply template wrapper</span>
                      </div>
                      <Switch 
                        checked={csvOptions.useTemplate} 
                        onCheckedChange={(checked) => setCsvOptions({ ...csvOptions, useTemplate: checked })} 
                      />
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-md border border-border/40 bg-background/50">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-semibold text-foreground">Attach Resume PDF</span>
                        <span className="text-[9px] text-muted-foreground">Attach physical PDF file</span>
                      </div>
                      <Switch 
                        checked={csvOptions.attachResume} 
                        onCheckedChange={(checked) => setCsvOptions({ ...csvOptions, attachResume: checked })} 
                      />
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-md border border-border/40 bg-background/50">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-semibold text-foreground">Insert Resume Link</span>
                        <span className="text-[9px] text-muted-foreground">Embed a clickable preview button</span>
                      </div>
                      <Switch 
                        checked={csvOptions.insertResumeLink} 
                        onCheckedChange={(checked) => setCsvOptions({ ...csvOptions, insertResumeLink: checked })} 
                      />
                    </div>

                    <div className="flex flex-col gap-0.5 justify-center">
                      <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Select Resume</label>
                      <Select 
                        value={csvOptions.resumeId} 
                        onValueChange={(val) => setCsvOptions({ ...csvOptions, resumeId: val || "" })}
                      >
                        <SelectTrigger className="h-8 bg-background/50 text-[11px] border-border/40 focus:ring-0">
                          <SelectValue placeholder="Default Resume (Fallback)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Default Resume (Fallback)</SelectItem>
                          {resumes.map((r, i) => (
                            <SelectItem key={r._id || r.id || i} value={r._id || r.id || ""}>
                              {r.name} {r.isDefault ? "(Default)" : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-0.5 justify-center">
                      <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Content Type</label>
                      <Select 
                        value={csvOptions.contentType} 
                        onValueChange={(val) => setCsvOptions({ ...csvOptions, contentType: val || "html", ...(val === "plain" ? { useTemplate: false } : {}) })}
                      >
                        <SelectTrigger className="h-8 bg-background/50 text-[11px] border-border/40 focus:ring-0">
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

                  {csvOptions.insertResumeLink && (
                    <div className="space-y-1 pt-1 animate-in fade-in duration-200">
                      <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Button Label Text</label>
                      <Input 
                        value={csvOptions.resumeLinkLabel} 
                        onChange={(e) => setCsvOptions({ ...csvOptions, resumeLinkLabel: e.target.value })}
                        placeholder="View My Resume"
                        className="h-8 bg-background/50 text-xs border-border/40"
                      />
                    </div>
                  )}
                </div>

                <Button className="w-full" onClick={handleBulkCsvUpload} disabled={isUploadingCsv || !csvFile}>
                  {isUploadingCsv ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />} 
                  {isUploadingCsv ? "Uploading..." : "Upload & Send"}
                </Button>
              </div>
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
            setNewTemplate({ name: "", subject: "", body: "" });
          }
        }}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" onClick={() => {
              setEditingTemplateId(null);
              setNewTemplate({ name: "", subject: "", body: "" });
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
              
              {/* Scrollable Template Body Editor */}
              <div className="flex-1 overflow-y-auto bg-background flex flex-col min-h-0">
                <div className="px-6 py-4 flex-1 min-h-[300px]">
                  <div 
                    contentEditable
                    suppressContentEditableWarning
                    className="w-full h-full min-h-[280px] bg-transparent outline-none resize-none text-sm text-foreground/90 leading-relaxed empty:before:content-['Hi_{{name}},_write_your_template_body_here..._You_can_use_placeholders_like_{{name}},_{{company}},_and_{{role}}.'] empty:before:text-muted-foreground/70"
                    onBlur={e => setNewTemplate({...newTemplate, body: e.currentTarget.innerHTML})} 
                    dangerouslySetInnerHTML={{ __html: newTemplate.body }}
                  />
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
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
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
              key={template._id || template.id || i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
            >
              <Card className="h-full border-border/50 bg-card hover:shadow-md hover:border-border transition-all flex flex-col group overflow-hidden relative">
                <CardHeader className="pb-3 bg-muted/10 border-b border-border/30">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider bg-background/50">Template</Badge>
                        <span className="text-xs font-medium text-muted-foreground truncate" title={template.name}>{template.name}</span>
                      </div>
                      <CardTitle className="text-base font-semibold leading-snug line-clamp-2" title={template.subject}>
                        {template.subject || "(No Subject)"}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 pt-4 pb-2 px-5">
                  <div className="text-sm text-foreground/80 leading-relaxed line-clamp-4 font-sans max-w-none">
                    {stripHtml(template.body)}
                  </div>
                </CardContent>
                <CardFooter className="pt-2 pb-4 px-5 bg-gradient-to-t from-card via-card to-transparent mt-auto flex items-center gap-2 shrink-0">
                  <Button variant="secondary" className="flex-1 font-medium shadow-sm border border-border/50 bg-background hover:bg-muted" onClick={() => openSendDialog(template)}>
                    <Mail className="w-4 h-4 mr-2 text-primary" /> Use Template
                  </Button>
                  <div className="flex items-center bg-background rounded-md shadow-sm border border-border/50 p-0.5 shrink-0">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-md" 
                      onClick={() => openEditTemplateDialog(template)}
                      title="Edit Template"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-md" 
                      onClick={() => handleDeleteTemplate(template._id || template.id || "")}
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
