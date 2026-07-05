"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Sparkles, Copy, RefreshCcw, Check, Send, Mail } from "lucide-react";
import * as motion from "framer-motion/client";
import { aiService } from "@/services/ai.service";
import { resumeService, Resume } from "@/services/resume.service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AIEmailGeneratorPage() {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState<{ subject: string, plainText: string, html: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [previewMode, setPreviewMode] = useState<"html" | "plain">("html");

  const handleQueueInOutbox = () => {
    if (!generatedDraft) return;
    sessionStorage.setItem("pending_outbox_email", JSON.stringify({
      subject: generatedDraft.subject,
      html: generatedDraft.html,
      plainText: generatedDraft.plainText,
      contentType: previewMode
    }));
    toast.success("AI draft prepared! Opening Outbox...");
    router.push("/dashboard/emails");
  };

  // Form State
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [tone, setTone] = useState("professional");
  const [highlights, setHighlights] = useState("");

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const data = await resumeService.getAll(1, 100);
        let resumesArray: Resume[] = [];
        if (Array.isArray(data)) resumesArray = data;
        else if (data?.data?.docs && Array.isArray(data.data.docs)) resumesArray = data.data.docs;
        else if (data?.data && Array.isArray(data.data)) resumesArray = data.data;
        else if (data?.docs && Array.isArray(data.docs)) resumesArray = data.docs;

        setResumes(resumesArray);
        if (resumesArray.length > 0) {
          setSelectedResumeId(resumesArray[0].id || resumesArray[0].id || "");
        }
      } catch (error) {
        toast.error("Failed to load resumes");
      }
    };
    fetchResumes();
  }, []);

  const buildGenerationGuidance = () => {
    const toneMap: Record<string, string> = {
      professional: "Professional, confident, and concise.",
      enthusiastic: "Warm, energetic, and positive without being pushy.",
      casual: "Friendly, conversational, and respectful."
    };

    return [
      "Write a polished outreach email to a hiring manager.",
      "Include a subject line.",
      "Use 2-3 short paragraphs and keep it under 140 words.",
      "Personalize with the role and company, and highlight the candidate's strengths.",
      "End with a clear, low-friction call to action.",
      toneMap[tone] || "Professional and concise.",
      "Use plain text only. Do not use HTML. Render links as plain URLs, not anchor tags."
    ].join(" ");
  };

  const handleGenerate = async () => {
    if (!company || !role) {
      toast.error("Company and Role are required.");
      return;
    }

    try {
      setGenerating(true);
      setGeneratedDraft(null);

      const response = await aiService.generate({
        type: "job_application_email",
        payload: {
          name,
          company,
          role,
          tone,
          highlights,
          resumeId: selectedResumeId || undefined,
          guidance: buildGenerationGuidance()
        }
      });

      // Handle structured response
      // Ensure we extract the deepest payload whether it's wrapped in { data: ... } or not
      const payload = response?.data?.data || response?.data || response;

      if (payload?.subject && (payload?.plainText || payload?.html || payload?.body)) {
        let finalHtml = payload.html || payload.body || "";
        // Fallback: if the backend sends plain text instead of real HTML, convert newlines to <br/>
        if (!finalHtml.includes('<p>') && !finalHtml.includes('<br')) {
          finalHtml = finalHtml.replace(/\n/g, '<br />');
        }

        setGeneratedDraft({
          subject: payload.subject,
          plainText: payload.plainText || payload.body || "",
          html: finalHtml
        });
      } else {
        // Fallback for older raw text payloads
        const text = payload?.text || payload?.result || payload?.content ||
          payload?.generated || payload?.email || payload?.output ||
          (typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2));

        let subject = "Outreach Application";
        let body = typeof text === 'string' ? text : JSON.stringify(text, null, 2);

        const subjectMatch = body.match(/subject:\s*(.*)/i);
        if (subjectMatch) {
          subject = subjectMatch[1].trim();
          body = body.replace(/subject:\s*.*\n?/i, "").trim();
        }
        body = body.replace(/^```html\s*/i, "").replace(/\s*```$/i, "");

        setGeneratedDraft({
          subject,
          plainText: body,
          html: body.replace(/\n/g, '<br />')
        });
      }
      toast.success("Email generated!");
    } catch (error) {
      toast.error("Failed to generate email.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    if (generatedDraft) {
      const textToCopy = previewMode === "html" ? generatedDraft.html : generatedDraft.plainText;
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs font-semibold text-muted-foreground">
            <Mail className="h-3.5 w-3.5" />
            AI Email Studio
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">AI Email Studio</h1>
          <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
            Generate hyper-personalized, high-converting outreach emails in seconds. Adjust the tone, add your resume context, and let our AI draft the perfect pitch.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Configuration Column */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-border/60 bg-card overflow-hidden shadow-sm">
            <CardHeader className="border-b border-border/60">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-rose-500" />
                Campaign Context
              </CardTitle>
              <CardDescription>Tell the AI who you are targeting to maximize your response rate.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold">
                    <div className="w-1 h-3.5 bg-blue-500 rounded-full"></div>
                    Your Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., Alex"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="bg-blue-50/30 border-blue-100 focus-visible:ring-blue-500/30 dark:bg-blue-950/10 dark:border-blue-900/30 shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company" className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-semibold">
                    <div className="w-1 h-3.5 bg-purple-500 rounded-full"></div>
                    Company Name
                  </Label>
                  <Input
                    id="company"
                    placeholder="e.g., Vercel"
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    className="bg-purple-50/30 border-purple-100 focus-visible:ring-purple-500/30 dark:bg-purple-950/10 dark:border-purple-900/30 shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-semibold">
                  <div className="w-1 h-3.5 bg-cyan-500 rounded-full"></div>
                  Target Role
                </Label>
                <Input
                  id="role"
                  placeholder="e.g., Frontend Engineer"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="bg-cyan-50/30 border-cyan-100 focus-visible:ring-cyan-500/30 dark:bg-cyan-950/10 dark:border-cyan-900/30 shadow-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="resume" className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-semibold">
                    <div className="w-1 h-3.5 bg-orange-500 rounded-full"></div>
                    Select Resume (Optional)
                  </Label>
                  <Select value={selectedResumeId} onValueChange={(val) => val && setSelectedResumeId(val)}>
                    <SelectTrigger className="bg-orange-50/30 border-orange-100 focus-visible:ring-orange-500/30 dark:bg-orange-950/10 dark:border-orange-900/30 shadow-sm">
                      <SelectValue placeholder="Select a resume" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Resume</SelectItem>
                      {resumes.map(r => {
                        let displayName = r.name || "Resume Document";
                        if (/^[0-9a-fA-F]{24}$/.test(displayName)) {
                          displayName = "Resume Document";
                        }
                        return (
                          <SelectItem key={r.id} value={r.id || ""}>
                            {displayName}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tone" className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <div className="w-1 h-3.5 bg-emerald-500 rounded-full"></div>
                    Email Tone
                  </Label>
                  <Select value={tone} onValueChange={(val) => val && setTone(val)}>
                    <SelectTrigger className="bg-emerald-50/30 border-emerald-100 focus-visible:ring-emerald-500/30 dark:bg-emerald-950/10 dark:border-emerald-900/30 shadow-sm">
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional & Direct</SelectItem>
                      <SelectItem value="enthusiastic">Enthusiastic & Passionate</SelectItem>
                      <SelectItem value="casual">Casual & Friendly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="highlights" className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold">
                  <div className="w-1 h-3.5 bg-rose-500 rounded-full"></div>
                  Strategic Highlights
                </Label>
                <Textarea
                  id="highlights"
                  placeholder="e.g., Mention my 5 years in React, leading the Vercel migration, and improving page speed by 40%..."
                  className="resize-none h-28 bg-rose-50/30 border-rose-100 focus-visible:ring-rose-500/30 text-sm leading-relaxed dark:bg-rose-950/10 dark:border-rose-900/30 shadow-sm"
                  value={highlights}
                  onChange={e => setHighlights(e.target.value)}
                />
              </div>

              <Button
                className="w-full mt-4 h-12 bg-rose-600 hover:bg-rose-600/90 text-white shadow-sm"
                onClick={handleGenerate}
                disabled={generating}
              >
                {generating ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  >
                    <RefreshCcw className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Email
                  </>
                )}
              </Button>
              <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                Tip: Add a specific outcome or metric in Highlights for a stronger hook.
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Output Column */}
        <div className="lg:col-span-7">
          <Card className="h-full border-border/60 bg-card flex flex-col min-h-[500px] shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/40 bg-muted/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-rose-500" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">Email Preview</CardTitle>
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    Ready to Send
                  </span>
                </div>
              </div>
              {generatedDraft && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleGenerate}>
                    <RefreshCcw className="w-4 h-4 mr-2" /> Regenerate
                  </Button>
                  <Button variant="secondary" size="sm" onClick={handleCopy}>
                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="flex-1 p-0 relative flex flex-col bg-[#fafafa] dark:bg-background/40">
              <article className="flex-1 flex flex-col">
                <header className="flex flex-col border-b border-border/30 bg-background shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                  {/* To Line */}
                  <div className="flex items-center gap-3 px-5 py-3 border-b border-border/20">
                    <div className="w-7 h-7 rounded-full bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center text-rose-700 dark:text-rose-400 font-bold text-[11px] shrink-0">
                      {company ? company.charAt(0).toUpperCase() : "H"}
                    </div>
                    <div className="flex items-center flex-1 gap-2 text-sm">
                      <span className="text-muted-foreground font-medium">To:</span>
                      <span className="font-semibold text-foreground/90 bg-muted/40 px-2.5 py-0.5 rounded-md border border-border/40">
                        {company ? `hiring@${company.toLowerCase().replace(/\s+/g, "")}.com` : "hiring@company.com"}
                      </span>
                    </div>
                  </div>
                  {/* Subject Line */}
                  <div className="flex items-center gap-3 px-5 py-3 border-b border-border/20">
                    <span className="text-sm text-muted-foreground font-medium shrink-0">Subject:</span>
                    <span className="text-sm text-foreground font-bold tracking-tight truncate">
                      {generatedDraft ? generatedDraft.subject : "(auto-generated)"}
                    </span>
                  </div>
                </header>

                {generatedDraft && (
                  <div className="flex items-center justify-between px-5 py-2.5 border-b border-border/30 bg-card shadow-sm z-10 relative">
                    <div className="flex items-center bg-muted/50 p-1 rounded-lg border border-border/40">
                      <button
                        onClick={() => setPreviewMode("html")}
                        className={`px-4 py-1.5 text-[11px] font-bold uppercase tracking-wide rounded-md transition-all ${previewMode === "html" ? "bg-background shadow-[0_1px_3px_rgba(0,0,0,0.1)] text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        Visual Preview
                      </button>
                      <button
                        onClick={() => setPreviewMode("plain")}
                        className={`px-4 py-1.5 text-[11px] font-bold uppercase tracking-wide rounded-md transition-all ${previewMode === "plain" ? "bg-background shadow-[0_1px_3px_rgba(0,0,0,0.1)] text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        Raw HTML
                      </button>
                    </div>

                    <Button
                      onClick={handleQueueInOutbox}
                      size="sm"
                      className="h-7 text-xs font-bold bg-rose-600 hover:bg-rose-600/90 text-white shadow-sm px-3 rounded-md transition-all duration-200 active:scale-95"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Use in Composer
                    </Button>
                  </div>
                )}

                <div className="relative flex-1 bg-background/50">
                  {!generatedDraft && !generating && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground p-8 text-center bg-card/30">
                      <div className="w-20 h-20 rounded-full bg-muted/40 border border-border/40 flex items-center justify-center mb-5 shadow-sm">
                        <Mail className="w-8 h-8 text-muted-foreground/60" />
                      </div>
                      <h3 className="text-base font-semibold text-foreground/80 mb-2">No Draft Yet</h3>
                      <p className="max-w-[260px] text-sm leading-relaxed">Fill out the campaign context on the left and click <span className="font-semibold text-foreground/80">Generate Email</span> to create your masterpiece.</p>
                    </div>
                  )}

                  {generating && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                      <motion.div
                        className="w-12 h-12 mb-4 text-primary"
                        animate={{ scale: [1, 1.08, 1] }}
                        transition={{ repeat: Infinity, duration: 1.6 }}
                      >
                        <Sparkles className="w-full h-full text-foreground/70" />
                      </motion.div>
                      <h3 className="text-lg font-medium text-foreground/70">Drafting your email...</h3>
                    </div>
                  )}

                  {generatedDraft && !generating && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="h-full flex flex-col absolute inset-0 p-5"
                    >
                      {previewMode === "plain" ? (
                        <Textarea
                          value={generatedDraft.plainText}
                          onChange={(e) => setGeneratedDraft({ ...generatedDraft, plainText: e.target.value })}
                          className="w-full h-full min-h-[400px] resize-none border-0 bg-transparent focus-visible:ring-0 text-xs font-mono leading-relaxed p-0 text-foreground/80"
                          placeholder="Raw text goes here..."
                        />
                      ) : (
                        <div
                          className="w-full h-full min-h-[400px] bg-transparent text-[15px] leading-relaxed p-0 overflow-y-auto prose prose-sm dark:prose-invert max-w-none text-foreground/90 font-serif"
                          dangerouslySetInnerHTML={{ __html: generatedDraft.html }}
                        />
                      )}
                    </motion.div>
                  )}
                </div>
              </article>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
