"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Sparkles, Copy, RefreshCcw, Check, Bold, Italic, Link2, AlignLeft, List, Eye, FileCode, Send, Mail } from "lucide-react";
import * as motion from "framer-motion/client";
import { aiService } from "@/services/ai.service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AIEmailGeneratorPage() {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState("");
  const [copied, setCopied] = useState(false);

  const parseGeneratedDraft = (text: string) => {
    let subject = "Outreach Application";
    let body = text;

    // Check if the LLM output contains a subject line
    const subjectMatch = text.match(/subject:\s*(.*)/i);
    if (subjectMatch) {
      subject = subjectMatch[1].trim();
      // Remove subject line from body
      body = text.replace(/subject:\s*.*\n?/i, "").trim();
    }
    
    // Clean up any remaining codeblock markdown if AI outputs codeblocks
    body = body.replace(/^```html\s*/i, "").replace(/\s*```$/i, "");
    
    return { subject, body };
  };

  const handleQueueInOutbox = () => {
    const parsed = parseGeneratedDraft(generatedText);
    sessionStorage.setItem("pending_outbox_email", JSON.stringify({
      subject: parsed.subject,
      html: parsed.body,
      contentType: contentType
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
  const contentType = "plain";

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
      setGeneratedText("");
      
      const response = await aiService.generate({
        type: "job_application_email",
        payload: {
          name,
          company,
          role,
          tone,
          highlights,
          contentType,
          guidance: buildGenerationGuidance()
        }
      });
      
      // Handle various response structures
      const responseData = response?.data || response;
      const text = responseData?.text || responseData?.result || responseData?.content || 
                   responseData?.generated || responseData?.email || responseData?.output ||
                   (typeof responseData === 'string' ? responseData : JSON.stringify(responseData, null, 2));
      setGeneratedText(typeof text === 'string' ? text : JSON.stringify(text, null, 2));
      toast.success("Email generated!");
    } catch (error) {
      toast.error("Failed to generate email.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    if (generatedText) {
      navigator.clipboard.writeText(generatedText);
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
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Email Generator</h1>
          <p className="text-muted-foreground">Generate hyper-personalized outreach emails in seconds.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Configuration Column */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="border-b border-border/60 bg-gradient-to-r from-rose-500/10 via-transparent to-transparent">
              <CardTitle className="text-lg">Email Context</CardTitle>
              <CardDescription>Provide details to customize your outreach.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g., Alex" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="bg-background/60 border-border/60 focus-visible:ring-rose-500/30" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>
                <Input 
                  id="company" 
                  placeholder="e.g., Vercel" 
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  className="bg-background/60 border-border/60 focus-visible:ring-rose-500/30" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Target Role</Label>
                <Input 
                  id="role" 
                  placeholder="e.g., Frontend Engineer" 
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="bg-background/60 border-border/60 focus-visible:ring-rose-500/30" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tone">Email Tone</Label>
                <Select value={tone} onValueChange={(val) => val && setTone(val)}>
                  <SelectTrigger className="bg-background/60 border-border/60 focus-visible:ring-rose-500/30">
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional & Direct</SelectItem>
                    <SelectItem value="enthusiastic">Enthusiastic & Passionate</SelectItem>
                    <SelectItem value="casual">Casual & Friendly</SelectItem>
                  </SelectContent>
                </Select>
              </div>



              <div className="space-y-2">
                <Label htmlFor="highlights">Key Highlights to Include</Label>
                <Textarea 
                  id="highlights" 
                  placeholder="Mention my experience with Next.js and improving performance by 40%..." 
                  className="resize-none h-24 bg-background/60 border-border/60 focus-visible:ring-rose-500/30"
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
            </CardContent>
          </Card>
        </div>

        {/* Output Column */}
        <div className="lg:col-span-7">
          <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm flex flex-col min-h-[500px]">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/50">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">Generated Draft</CardTitle>
                <span className="text-[11px] font-medium text-rose-700 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
                  Ready to copy
                </span>
              </div>
              {generatedText && (
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
            <CardContent className="flex-1 p-0 relative flex flex-col">
              <div className="flex-1 flex flex-col">
                <div className="flex items-center gap-3 px-4 py-2 border-b border-rose-500/10 bg-rose-500/5">
                  <span className="text-xs text-rose-700 w-14 font-semibold">To</span>
                  <span className="text-sm text-foreground/70 flex-1">
                    {company ? `hiring@${company.toLowerCase().replace(/\s+/g, "")}.com` : "hiring@company.com"}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 border-b border-rose-500/10 bg-rose-500/5">
                  <span className="text-xs text-rose-700 w-14 font-semibold">Subject</span>
                  <span className="text-sm text-foreground/80 font-medium">
                    {generatedText ? parseGeneratedDraft(generatedText).subject : "(auto-generated)"}
                  </span>
                </div>
                
                {generatedText && (
                  <div className="flex items-center justify-between px-4 py-2 border-b border-rose-500/10 bg-gradient-to-r from-rose-500/10 via-transparent to-transparent">

                    
                    <Button 
                      onClick={handleQueueInOutbox}
                      size="sm"
                      className="h-7 text-xs font-bold bg-rose-600 hover:bg-rose-600/90 text-white shadow-sm px-3 rounded-md transition-all duration-250 active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5 mr-1.5" />
                      Queue in Outbox
                    </Button>
                  </div>
                )}

                <div className="relative flex-1 p-4 min-h-[400px]">
                  {!generatedText && !generating && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4">
                        <Sparkles className="w-7 h-7 text-rose-600" />
                      </div>
                      <p className="max-w-sm text-sm">Fill out the context on the left and click Generate to create a personalized email draft.</p>
                    </div>
                  )}

                  {generating && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                      <motion.div
                        className="w-12 h-12 mb-4 text-primary"
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      >
                        <Sparkles className="w-full h-full text-rose-600" />
                      </motion.div>
                      <h3 className="text-lg font-medium animate-pulse text-rose-600">Drafting your perfect email...</h3>
                    </div>
                  )}

                  {generatedText && !generating && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="h-full flex flex-col"
                    >
                        <Textarea 
                          value={generatedText}
                          onChange={(e) => setGeneratedText(e.target.value)}
                          className="w-full h-full min-h-[380px] resize-none border border-rose-500/10 bg-gradient-to-b from-rose-500/5 to-background/40 focus-visible:ring-2 focus-visible:ring-rose-500/30 text-xs font-mono leading-relaxed p-4 rounded-xl shadow-sm"
                        />
                    </motion.div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
