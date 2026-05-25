"use client";

import React, { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button, buttonVariants } from "@/components/ui/button";
import { 
  ArrowRight, Bot, Sparkles, ChevronRight, CheckCircle2, Briefcase,
  Send, MessageSquare, Terminal, FileText, Check, Search, User, RefreshCw, Star, X,
  Play, Pause, Paperclip, SendHorizontal, Mail, UploadCloud, Layers, Database, Code, Copy, Layout
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// Types
interface Job {
  company: string;
  title: string;
  salary: string;
  fit: number;
  logo: string;
}

interface Category {
  id: string;
  label: string;
  score: number;
  skills: string[];
  missing: string[];
  jobs: Job[];
}

interface Message {
  sender: "user" | "bot";
  text: string;
  isTyping?: boolean;
  widget?: "jobs" | "ats" | "email" | "bullets";
  widgetData?: any;
}

// Mock database
const MOCK_CATEGORIES: Category[] = [
  {
    id: "frontend",
    label: "React Developer",
    score: 84,
    skills: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
    missing: ["GraphQL", "Jest"],
    jobs: [
      { company: "Vercel", title: "Senior Frontend Engineer", salary: "$140k - $180k", fit: 96, logo: "▲" },
      { company: "Stripe", title: "UI Developer", salary: "$135k - $170k", fit: 92, logo: "💳" }
    ]
  },
  {
    id: "devops",
    label: "DevOps Engineer",
    score: 76,
    skills: ["Docker", "Kubernetes", "AWS", "GitHub Actions"],
    missing: ["Terraform", "Prometheus"],
    jobs: [
      { company: "HashiCorp", title: "Cloud Ops Engineer", salary: "$150k - $190k", fit: 95, logo: "⬡" },
      { company: "Amazon AWS", title: "Infrastructure Architect", salary: "$165k - $210k", fit: 91, logo: "☁" }
    ]
  },
  {
    id: "product",
    label: "Product Manager",
    score: 80,
    skills: ["Product Roadmap", "User Research", "SQL", "Agile"],
    missing: ["A/B Testing", "Mixpanel"],
    jobs: [
      { company: "Airbnb", title: "Growth Product Manager", salary: "$145k - $185k", fit: 94, logo: "🏡" },
      { company: "Linear", title: "Technical Product Manager", salary: "$150k - $195k", fit: 90, logo: "⧉" }
    ]
  },
  {
    id: "data",
    label: "Data Scientist",
    score: 72,
    skills: ["Python", "SQL", "Pandas", "Machine Learning"],
    missing: ["Snowflake", "PyTorch"],
    jobs: [
      { company: "Spotify", title: "Lead Data Scientist", salary: "$130k - $165k", fit: 95, logo: "🎧" },
      { company: "Netflix", title: "Analytics Architect", salary: "$150k - $190k", fit: 91, logo: "🎬" }
    ]
  }
];

export default function Home() {
  // --- STATE 1: Automation Command Center Tab switcher ---
  const [activeCmdTab, setActiveCmdTab] = useState<string>("single");
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);

  const handleCopyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTemplate(id);
    setTimeout(() => setCopiedTemplate(null), 2000);
  };


  // --- STATE 3: Step-by-step Workflow Animation ---
  const [flowStep, setFlowStep] = useState<number>(1);
  const [isFlowAutoPlay, setIsFlowAutoPlay] = useState<boolean>(true);
  const flowIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isFlowAutoPlay) {
      flowIntervalRef.current = setInterval(() => {
        setFlowStep(prev => (prev === 4 ? 1 : prev + 1));
      }, 4000);
    } else {
      if (flowIntervalRef.current) clearInterval(flowIntervalRef.current);
    }
    return () => {
      if (flowIntervalRef.current) clearInterval(flowIntervalRef.current);
    };
  }, [isFlowAutoPlay]);

  // --- STATE 4: Interactive Chatbot ---
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "👋 Hi! I'm your **ApplyFlow AI Copilot**. I can scan your resume, score your fit score for Stripe or Vercel, improve your resume bullets, or draft perfect outreaches on autopilot! \n\nClick one of the suggested prompts below to test me out!"
    }
  ]);
  const [chatInput, setChatInput] = useState<string>("🔍 Suggest high-paying React roles");
  const [isBotTyping, setIsBotTyping] = useState<boolean>(false);

  // Auto-scroll chatbot
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isBotTyping]);

  const triggerBotReply = (userQuery: string) => {
    setIsBotTyping(true);

    setTimeout(() => {
      setIsBotTyping(false);
      let botReply: Message = { sender: "bot", text: "" };

      const queryNormalized = userQuery.toLowerCase();
      if (queryNormalized.includes("react") || queryNormalized.includes("role") || queryNormalized.includes("job")) {
        botReply.text = "🎯 I searched through 140+ remote platforms. Based on your profile skills in **React, TypeScript, Next.js, and Tailwind CSS**, here are two premium matching roles with strong referral indicators:";
        botReply.widget = "jobs";
      } else if (queryNormalized.includes("stripe") || queryNormalized.includes("audit") || queryNormalized.includes("score")) {
        botReply.text = "📊 I audited your uploaded resume against the **Stripe UI Developer** job description. Your profile scores highly, but you have 2 critical missing keywords. Click **'Fix Resume'** to automatically inject optimized project descriptions!";
        botReply.widget = "ats";
      } else if (queryNormalized.includes("outreach") || queryNormalized.includes("email") || queryNormalized.includes("vercel")) {
        botReply.text = "✉️ I generated a hyper-personalized, context-aware cold outreach email for Vercel based on your Next.js dashboard project. Here is your automated draft:";
        botReply.widget = "email";
      } else if (queryNormalized.includes("bullet") || queryNormalized.includes("improve") || queryNormalized.includes("resume")) {
        botReply.text = "✨ I refactored your generic resume bullets to showcase impact, action-verbs, and metrics that appeal directly to technical recruiters:";
        botReply.widget = "bullets";
      } else {
        botReply.text = `Thank you for asking! I'm scanning matching records for "${userQuery}". Try clicking one of the premium quick-actions below to experience my specialized features!`;
      }

      setMessages(prev => [...prev, botReply]);
    }, 1200);
  };

  const handleSendMessage = (textToSend?: string) => {
    const finalQuery = textToSend || chatInput;
    if (!finalQuery.trim()) return;

    setMessages(prev => [...prev, { sender: "user", text: finalQuery }]);
    if (!textToSend) setChatInput("");

    triggerBotReply(finalQuery);
  };

  const handleQuickAction = (actionText: string) => {
    handleSendMessage(actionText);
  };


  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/20">
      <Navbar />

      <main className="flex-1">
        
        {/* HERO SECTION */}
        <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
          <div className="absolute top-1/4 right-0 -z-10 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
          <div className="absolute bottom-10 left-0 -z-10 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[140px] opacity-70"></div>

          <div className="container mx-auto px-4 text-center z-10 relative">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold mb-6 text-primary shadow-[0_0_15px_rgba(var(--primary),0.05)]"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
              <span>ApplyFlow AI 2.0: Automated Job Outbox</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 max-w-5xl mx-auto leading-tight"
            >
              Land Interviews on <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-blue-500 font-extrabold">Autopilot.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed"
            >
              Audit resume keyword scores, generate bespoke outreach drafts, and queue deliverable cold emails directly into recruiters' inboxes in under 1 minute.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link 
                href="/signup"
                className={buttonVariants({ size: "lg" }) + " w-full sm:w-auto rounded-full px-8 font-semibold shadow-[0_4px_20px_rgba(var(--primary),0.35)] hover:shadow-[0_4px_30px_rgba(var(--primary),0.5)] transition-all transform hover:-translate-y-0.5"}
              >
                Get Started Free <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
              <a 
                href="#automation-center"
                className={buttonVariants({ variant: "outline", size: "lg" }) + " w-full sm:w-auto rounded-full px-8 border-border/60 hover:bg-muted/50 font-medium"}
              >
                Explore Command Center <ChevronRight className="ml-2 w-4 h-4 text-muted-foreground" />
              </a>
            </motion.div>
          </div>
        </section>

        {/* SECTION 1: INTERACTIVE AUTOMATION COMMAND CENTER */}
        <section id="automation-center" className="py-20 bg-background border-t border-border/40 relative">
          <div className="absolute inset-0 bg-grid-white/[0.01] -z-10"></div>
          <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

          <div className="container mx-auto px-4 max-w-6xl relative z-10">
            <div className="text-center mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-primary mb-2 block">Application Suite</span>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-3">Automation Command Center</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
                Interact with the actual visual models of the ApplyFlow engine. Switch tabs below to see how our core outbox pipeline handles candidate delivery.
              </p>
            </div>

            {/* Tab Swappers */}
            <div className="flex flex-wrap justify-center gap-2 mb-10 max-w-4xl mx-auto bg-muted/30 p-1.5 rounded-2xl border border-border/40">
              {[
                { id: "single", label: "Single Outreach", icon: <Send className="w-3.5 h-3.5" /> },
                { id: "bulk", label: "CSV Bulk Sharing", icon: <UploadCloud className="w-3.5 h-3.5" /> },
                { id: "ats", label: "ATS Auditor", icon: <Layers className="w-3.5 h-3.5" /> },
                { id: "occupancy", label: "Company Occupancy", icon: <Database className="w-3.5 h-3.5" /> },
                { id: "templates", label: "Reusable Templates", icon: <Layout className="w-3.5 h-3.5" /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCmdTab(tab.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 transition-all ${
                    activeCmdTab === tab.id
                      ? "bg-card text-primary shadow-sm border border-border/50 ring-1 ring-primary/10"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Interactive Showcase Window */}
            <div className="bg-card/70 border border-border/50 rounded-3xl p-6 md:p-10 shadow-2xl backdrop-blur-xl min-h-[420px] flex items-center justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full blur-2xl pointer-events-none"></div>

              <AnimatePresence mode="wait">
                
                {/* Single Outreach Mockup */}
                {activeCmdTab === "single" && (
                  <motion.div
                    key="cmd-single"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
                  >
                    <div className="md:col-span-7 bg-background border border-border/60 rounded-2xl overflow-hidden shadow-lg flex flex-col">
                      <div className="bg-muted/40 border-b border-border/50 px-4 py-3 flex items-center justify-between">
                        <span className="text-xs font-bold font-mono text-muted-foreground flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-primary" /> outbox_composer.exe
                        </span>
                        <div className="flex gap-1">
                          <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                          <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                          <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                        </div>
                      </div>
                      
                      {/* Email Composer Fields */}
                      <div className="p-4 space-y-3 font-mono text-xs">
                        <div className="flex items-center gap-2 border-b border-border/40 pb-2">
                          <span className="text-muted-foreground w-12 shrink-0">Recruiter:</span>
                          <span className="text-foreground">hiring@stripe.com</span>
                        </div>
                        <div className="flex items-center gap-2 border-b border-border/40 pb-2">
                          <span className="text-muted-foreground w-12 shrink-0">Subject:</span>
                          <span className="text-foreground">Application: Senior React Developer</span>
                        </div>
                        
                        <div className="bg-muted/30 border border-border/40 rounded-xl p-3 text-[11px] leading-relaxed text-muted-foreground h-32 overflow-y-auto">
                          <p>Hi Recruiting Team,</p>
                          <p className="mt-2">I noticed your opening for a UI Developer. My background matches your tech-stack: React, Next.js, and TypeScript. I recently built a highly responsive dashboard showing...</p>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-5 space-y-4">
                      <div>
                        <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">Generic Outbox Mailer</span>
                        <h4 className="text-xl font-extrabold text-foreground">Personalized Outreach, Delivered Orgnaically</h4>
                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                          Our single email outbox wraps outreach emails dynamically. Toggle premium card headers, secure PDF resume attachments, and embed interactive tracking action buttons automatically!
                        </p>
                      </div>

                      {/* Outbox features toggles mockup */}
                      <div className="bg-background/80 border border-border/40 rounded-xl p-3 space-y-2.5">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-primary" /> Wrap in Premium HTML Card</span>
                          <span className="text-green-500">Enabled</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-primary" /> Attach Verified PDF Resume</span>
                          <span className="text-green-500">Enabled</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Embed View Resume Link</span>
                          <span className="text-amber-500">Auto (Based on score)</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* CSV Bulk Upload Mockup */}
                {activeCmdTab === "bulk" && (
                  <motion.div
                    key="cmd-bulk"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
                  >
                    <div className="md:col-span-7 bg-background border border-border/60 rounded-2xl overflow-hidden shadow-lg p-5 flex flex-col gap-4">
                      
                      {/* Upload Box Mock */}
                      <div className="border-2 border-dashed border-primary/20 rounded-xl p-6 text-center bg-primary/5 hover:bg-primary/10 transition-colors flex flex-col items-center justify-center gap-2">
                        <UploadCloud className="w-8 h-8 text-primary animate-bounce" />
                        <span className="text-xs font-bold font-mono">active_recruiting_leads.csv</span>
                        <span className="text-[10px] text-muted-foreground font-medium">Mapped Headers Detected (140 rows)</span>
                      </div>

                      {/* Header Mapping Ledgers */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase text-muted-foreground block">Data Fields Mapping</span>
                        <div className="grid grid-cols-3 gap-2 text-[10px] font-mono font-bold bg-muted/40 border border-border/40 p-2.5 rounded-lg">
                          <div className="text-primary">CSV Column</div>
                          <div className="text-center text-muted-foreground">&rarr;</div>
                          <div className="text-right text-foreground">Outbox Field</div>
                          
                          <div className="border-t border-border/20 pt-1.5">recipient_email</div>
                          <div className="text-center text-muted-foreground border-t border-border/20 pt-1.5">&rarr;</div>
                          <div className="text-right text-green-500 border-t border-border/20 pt-1.5">to (Email)</div>

                          <div className="border-t border-border/20 pt-1">company_name</div>
                          <div className="text-center text-muted-foreground border-t border-border/20 pt-1">&rarr;</div>
                          <div className="text-right text-green-500 border-t border-border/20 pt-1">company</div>

                          <div className="border-t border-border/20 pt-1">contentType</div>
                          <div className="text-center text-muted-foreground border-t border-border/20 pt-1">&rarr;</div>
                          <div className="text-right text-indigo-400 border-t border-border/20 pt-1">plain (Escaped Text)</div>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-5 space-y-4">
                      <div>
                        <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">Bulk Mail Sharing</span>
                        <h4 className="text-xl font-extrabold text-foreground">Spreadsheet Leads, Dispatched in 1 Click</h4>
                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                          Drop lead lists containing columns like email, company, and first name. Map headers effortlessly, select HTML/Plain text formatting presets, and let ApplyFlow schedule individual, organic delivery packages globally.
                        </p>
                      </div>

                      {/* Pro tip callout matching the email settings */}
                      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 flex items-start gap-2.5">
                        <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] font-bold text-indigo-300 block">Pro Tip Integration</span>
                          <p className="text-[10px] text-indigo-200 leading-tight mt-0.5">
                            Include a `contentType` column in your spreadsheet with value `plain` to send organic raw text outreaches to recruiters automatically!
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ATS Score auditor mockup */}
                {activeCmdTab === "ats" && (
                  <motion.div
                    key="cmd-ats"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
                  >
                    <div className="md:col-span-7 bg-background border border-border/60 rounded-2xl overflow-hidden shadow-lg p-6 flex flex-col items-center">
                      <div className="relative w-28 h-28 flex items-center justify-center mb-4">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="16" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" className="opacity-20" />
                          <motion.circle
                            cx="18"
                            cy="18"
                            r="16"
                            fill="none"
                            stroke="hsl(var(--primary))"
                            strokeWidth="3"
                            strokeDasharray="100"
                            initial={{ strokeDashoffset: 100 }}
                            animate={{ strokeDashoffset: 8 }} // 92%
                            transition={{ duration: 1, ease: "easeOut" }}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="absolute text-3xl font-black text-foreground">92%</span>
                      </div>
                      
                      <div className="w-full grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-green-500/5 border border-green-500/10 rounded-xl p-3 text-center">
                          <span className="text-[9px] uppercase tracking-wider text-green-500 font-bold block mb-1">Keywords Match</span>
                          <span className="font-extrabold text-green-400">12 Mapped Features</span>
                        </div>
                        <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 text-center">
                          <span className="text-[9px] uppercase tracking-wider text-amber-500 font-bold block mb-1">Structural Gaps</span>
                          <span className="font-extrabold text-amber-400">2 Recommended</span>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-5 space-y-4">
                      <div>
                        <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">ATS Score Auditor</span>
                        <h4 className="text-xl font-extrabold text-foreground">Beat the Bots. Secure Audited Audits</h4>
                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                          We calculate your matching index instantly by cross-referencing your resume text against direct vacancy criteria. Our AI optimizer injects action bullets, raising your success dial into targeted interview levels.
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {["GraphQL", "REST API", "Docker", "Next.js", "Server Nodes"].map((tag, idx) => (
                          <span key={tag} className="text-[9px] bg-muted/60 border border-border/50 text-muted-foreground px-2 py-0.5 rounded font-mono font-bold">
                            ✓ {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Company Occupancy Mockup */}
                {activeCmdTab === "occupancy" && (
                  <motion.div
                    key="cmd-occupancy"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
                  >
                    <div className="md:col-span-7 bg-background border border-border/60 rounded-2xl overflow-hidden shadow-lg p-4 flex flex-col gap-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block border-b border-border/40 pb-2">
                        Company Occupancy & Hiring Statistics
                      </span>
                      
                      <div className="space-y-2">
                        {[
                          { name: "Vercel Inc.", occupancy: "14 Active Roles", referrals: "82% success", rate: "High" },
                          { name: "Stripe", occupancy: "28 Active Roles", referrals: "76% success", rate: "High" },
                          { name: "HashiCorp", occupancy: "8 Active Roles", referrals: "64% success", rate: "Medium" },
                          { name: "Linear App", occupancy: "4 Active Roles", referrals: "90% success", rate: "Very High" }
                        ].map((company, idx) => (
                          <div key={company.name} className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-muted/20 text-xs font-medium">
                            <span className="font-bold text-foreground">{company.name}</span>
                            <span className="text-muted-foreground font-mono">{company.occupancy}</span>
                            <span className="text-indigo-400 font-mono">{company.referrals}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                              company.rate.includes("Very") ? "bg-green-500/10 text-green-500" : "bg-primary/10 text-primary"
                            }`}>
                              {company.rate}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="md:col-span-5 space-y-4">
                      <div>
                        <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">Company Occupancy stats</span>
                        <h4 className="text-xl font-extrabold text-foreground">Target Hiring Hotbeds Automatically</h4>
                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                          Track which major corporations have active roles, high-occupancy hiring budgets, and low-competition referral avenues. Secure a clear view of open vacancies mapping to your profile index.
                        </p>
                      </div>

                      <div className="bg-primary/5 border border-primary/15 rounded-xl p-3 flex items-center justify-between text-xs">
                        <span className="font-bold text-primary">Connected Channels</span>
                        <span className="font-bold font-mono text-foreground">140+ Platforms</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Reusable templates mockup */}
                {activeCmdTab === "templates" && (
                  <motion.div
                    key="cmd-templates"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
                  >
                    <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        {
                          id: "temp-1",
                          title: "Next.js Pitch Template",
                          subject: "Impressed by Next.js load structures",
                          desc: "Personalized cold pitch targeting React engineering openings."
                        },
                        {
                          id: "temp-2",
                          title: "DevOps Deploy Template",
                          subject: "Automating AWS Cloud Pipelines",
                          desc: "Refined cover template optimized for infrastructure teams."
                        }
                      ].map(temp => (
                        <div 
                          key={temp.id} 
                          className="bg-background border border-border/60 rounded-xl p-4 flex flex-col justify-between shadow hover:border-primary/40 transition-colors group"
                        >
                          <div>
                            <div className="flex items-center justify-between border-b border-border/30 pb-2 mb-2">
                              <span className="text-xs font-bold text-foreground">{temp.title}</span>
                              <Layout className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <span className="text-[10px] text-muted-foreground leading-tight block mb-2">{temp.desc}</span>
                            <span className="text-[9px] font-mono bg-muted border border-border/40 px-2 py-0.5 rounded text-foreground font-bold">
                              Sub: {temp.subject.substring(0, 24)}...
                            </span>
                          </div>

                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/30">
                            <span className="text-[9px] text-green-500 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Saved
                            </span>
                            <button
                              onClick={() => handleCopyCode(temp.subject, temp.id)}
                              className="px-2 py-1 bg-muted hover:bg-primary hover:text-primary-foreground border border-border/40 hover:border-primary text-[9px] font-bold rounded flex items-center gap-1 transition-colors"
                            >
                              <Copy className="w-2.5 h-2.5" />
                              {copiedTemplate === temp.id ? "Copied!" : "Share / Copy"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="md:col-span-5 space-y-4">
                      <div>
                        <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">Save & Share Templates</span>
                        <h4 className="text-xl font-extrabold text-foreground">Standardized Quality. Dispatched at Scale</h4>
                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                          Stop starting from scratch. Construct specialized outreach cover outlines, save drafts securely into your workspace dashboard library, and quickly clone or share them to fast-track your campaign.
                        </p>
                      </div>

                      <div className="bg-background/80 border border-border/40 rounded-xl p-3 flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-mono text-muted-foreground font-semibold">Automatic regex clean strips raw HTML tags</span>
                      </div>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>
        </section>


        {/* SECTION 3: WORKFLOW EXPLAINER ANIMATIONS ("How It Works") */}
        <section id="explainer-section" className="py-24 relative overflow-hidden bg-background">
          <div className="absolute -top-40 right-10 -z-10 w-[450px] h-[450px] bg-primary/5 rounded-full blur-[120px]"></div>
          
          <div className="container mx-auto px-4 max-w-5xl relative z-10">
            <div className="text-center mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-primary mb-2 block">System Workflow</span>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-3">How ApplyFlow Automates Your Search</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
                Watch our background AI engine handle the entire pipeline from candidate profiling to final outbox delivery.
              </p>
            </div>

            {/* Stepper progress headers */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
              {[
                { step: 1, label: "1. Profile Scan", desc: "Extracting resume parameters" },
                { step: 2, label: "2. ATS Keyword Match", desc: "Analyzing compatibility index" },
                { step: 3, label: "3. Smart Outreach Write", desc: "Generating bespoke drafts" },
                { step: 4, label: "4. Outbox Dispatch", desc: "Autopilot email delivery" }
              ].map(item => (
                <button
                  key={item.step}
                  onClick={() => {
                    setFlowStep(item.step);
                    setIsFlowAutoPlay(false);
                  }}
                  className={`p-4 rounded-xl text-left border transition-all ${
                    flowStep === item.step
                      ? "bg-card border-primary/50 shadow-md ring-1 ring-primary/20"
                      : "bg-muted/10 border-border/40 hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-xs font-bold ${flowStep === item.step ? "text-primary" : "text-muted-foreground"}`}>
                      {item.label}
                    </span>
                    {flowStep === item.step && (
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-ping"></span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-tight hidden sm:block">{item.desc}</p>
                </button>
              ))}
            </div>

            {/* Explainer Interactive Screen Container */}
            <div className="relative bg-card/40 border border-border/50 rounded-3xl p-6 md:p-10 h-[380px] shadow-xl flex flex-col justify-between overflow-hidden backdrop-blur-xl">
              <div className="absolute inset-0 bg-grid-white/[0.02] -z-10"></div>
              
              <div className="flex-1 flex items-center justify-center relative">
                <AnimatePresence mode="wait">
                  
                  {/* Step 1 Content: Parsing Resume */}
                  {flowStep === 1 && (
                    <motion.div
                      key="step-1"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4 }}
                      className="w-full max-w-md bg-background/80 border border-border/60 rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col gap-3"
                    >
                      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary to-indigo-500 animate-pulse"></div>
                      
                      <motion.div 
                        className="absolute inset-x-0 h-6 bg-gradient-to-b from-primary/20 to-transparent border-t border-primary/40 -z-10 shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                        animate={{ top: ["0%", "90%", "0%"] }}
                        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                      />

                      <div className="flex justify-between items-center border-b border-border/40 pb-2.5">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary" />
                          <span className="text-xs font-bold font-mono">vaibhav_joshi_resume.pdf</span>
                        </div>
                        <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded font-mono font-bold animate-pulse">
                          PARSING...
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="h-2 w-3/4 bg-muted rounded-full"></div>
                        <div className="h-2 w-1/2 bg-muted rounded-full"></div>
                        <div className="grid grid-cols-3 gap-2 mt-4 pt-2 border-t border-border/20">
                          {["React", "TypeScript", "Tailwind"].map((tech, idx) => (
                            <motion.div
                              key={tech}
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.15 }}
                              className="bg-primary/5 border border-primary/10 rounded px-1.5 py-1 text-[10px] text-center font-mono text-primary font-semibold flex items-center justify-center gap-1"
                            >
                              <Check className="w-2.5 h-2.5 stroke-[3]" /> {tech}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2 Content: ATS Match Score */}
                  {flowStep === 2 && (
                    <motion.div
                      key="step-2"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.4 }}
                      className="w-full max-w-lg flex flex-col md:flex-row items-center gap-6"
                    >
                      <div className="bg-background/80 border border-border/60 rounded-2xl p-6 shadow-lg flex flex-col items-center shrink-0 w-44">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-3">ATS Compatibility</span>
                        <div className="relative w-24 h-24 flex items-center justify-center mb-1">
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="16" fill="none" stroke="hsl(var(--muted))" strokeWidth="2.5" className="opacity-20" />
                            <motion.circle
                              cx="18"
                              cy="18"
                              r="16"
                              fill="none"
                              stroke="hsl(var(--primary))"
                              strokeWidth="2.5"
                              strokeDasharray="100"
                              initial={{ strokeDashoffset: 100 }}
                              animate={{ strokeDashoffset: 6 }}
                              transition={{ duration: 1.2, ease: "easeOut" }}
                              strokeLinecap="round"
                            />
                          </svg>
                          <span className="absolute text-2xl font-black text-foreground">94%</span>
                        </div>
                        <span className="text-[10px] text-green-500 font-bold bg-green-500/10 px-2 py-0.5 rounded-full mt-2">
                          Highly Qualified
                        </span>
                      </div>

                      <div className="flex-1 space-y-4">
                        <div>
                          <h4 className="text-sm font-bold mb-2">Auditing: Vercel Frontend Engineer</h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            ApplyFlow parses the job description in real-time, auditing structural keywords against your verified resume assets.
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 bg-background/50 border border-border/40 p-3 rounded-xl">
                          <div className="flex items-center gap-1.5 text-xs text-green-500 font-semibold">
                            <Check className="w-3.5 h-3.5 stroke-[3]" /> React, NextJS
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-green-500 font-semibold">
                            <Check className="w-3.5 h-3.5 stroke-[3]" /> Tailwind, REST
                          </div>
                          <div className="flex items-center gap-1.5 text-amber-500 font-semibold">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" /> GraphQL (Autofixed)
                          </div>
                          <div className="flex items-center gap-1.5 text-green-500 font-semibold">
                            <Check className="w-3.5 h-3.5 stroke-[3]" /> TypeScript
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3 Content: Smart Outreach Write */}
                  {flowStep === 3 && (
                    <motion.div
                      key="step-3"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4 }}
                      className="w-full max-w-xl bg-background/80 border border-border/60 rounded-2xl p-5 shadow-lg relative flex flex-col gap-3.5 font-mono"
                    >
                      <div className="flex items-center justify-between border-b border-border/40 pb-2 shrink-0">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Terminal className="w-3 h-3 text-primary" /> draft_outreach_vercel.html
                        </span>
                        <div className="flex gap-1">
                          <div className="w-2 h-2 rounded-full bg-red-500/60"></div>
                          <div className="w-2 h-2 rounded-full bg-yellow-500/60"></div>
                          <div className="w-2 h-2 rounded-full bg-green-500/60"></div>
                        </div>
                      </div>

                      <div className="text-[11px] leading-relaxed text-muted-foreground h-36 overflow-hidden relative">
                        <div className="text-foreground font-bold mb-1">Subject: Optimizing dashboard load speeds at Vercel</div>
                        
                        <p className="mt-2 text-foreground font-semibold">Hi hiring team,</p>
                        
                        <motion.p 
                          className="mt-1 leading-normal"
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 2 }}
                        >
                          I noticed the opening for a Frontend Developer. My experience aligns closely with your tech-stack:
                        </motion.p>
                        <ul className="list-disc list-inside mt-1 pl-1 text-primary">
                          <li>Engineered interactive dashboards rendering 500+ elements per node.</li>
                          <li>Leveraged Next.js Server Components to trim response speeds by 30%.</li>
                        </ul>
                        
                        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-background/90 to-transparent"></div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4 Content: Outbox dispatch */}
                  {flowStep === 4 && (
                    <motion.div
                      key="step-4"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.4 }}
                      className="w-full max-w-lg flex flex-col items-center justify-center gap-6 relative"
                    >
                      <div className="flex items-center gap-12 justify-center relative w-full">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col items-center justify-center relative shadow-[0_0_20px_rgba(var(--primary),0.05)] z-10 shrink-0">
                          <Send className="w-7 h-7 text-primary animate-pulse" />
                          <span className="text-[8px] font-mono font-bold text-primary mt-1">OUTBOX</span>
                        </div>

                        <div className="absolute inset-x-12 h-0.5 border-t-2 border-dashed border-border flex items-center justify-center z-0">
                          <motion.div
                            initial={{ left: 0, opacity: 0 }}
                            animate={{ left: "100%", opacity: [0, 1, 1, 0] }}
                            transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                            className="absolute"
                          >
                            <SendHorizontal className="w-5 h-5 text-indigo-400 rotate-0 translate-y-[-10px] transform drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                          </motion.div>
                        </div>

                        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col items-center justify-center relative z-10 shrink-0">
                          <Mail className="w-7 h-7 text-indigo-400" />
                          <span className="text-[8px] font-mono font-bold text-indigo-400 mt-1">RECRUITER</span>
                        </div>
                      </div>

                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="bg-green-500/10 border border-green-500/25 rounded-2xl px-5 py-3 flex items-center gap-2.5 text-green-500 text-xs font-bold shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Recruiter Outreach Sent Automatically! (100% Organic Delivery Rate)</span>
                      </motion.div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>

              <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-4 shrink-0">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1.5 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span>
                  Currently viewing Step {flowStep} of 4
                </span>
                
                <button
                  onClick={() => setIsFlowAutoPlay(prev => !prev)}
                  className="px-3.5 py-1.5 rounded-full bg-muted/65 hover:bg-muted/100 border border-border/50 text-[10px] font-bold flex items-center gap-1.5 transition-all text-foreground"
                >
                  {isFlowAutoPlay ? (
                    <>
                      <Pause className="w-3 h-3 text-primary shrink-0" /> Pause Simulation
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 text-primary shrink-0 animate-pulse" /> Play Simulation
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>
        </section>

        {/* SECTION 4: INTERACTIVE AI CHATBOT ASSISTANT */}
        <section className="py-20 bg-muted/20 border-t border-border/40 relative">
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[350px] h-[350px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="container mx-auto px-4 max-w-4xl relative z-10">
            <div className="text-center mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-primary mb-2 block">Conversational AI</span>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-3">Ask Your Career Copilot</h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-sm">
                Interact directly with ApplyFlow's conversational assistant to audit files, generate tailored outreaches, or query metrics.
              </p>
            </div>

            {/* Chatbot Interface Container */}
            <div className="bg-card border border-border/60 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[520px] max-w-3xl mx-auto backdrop-blur-xl">
              
              {/* Header */}
              <div className="bg-muted/40 border-b border-border/50 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center shadow-inner relative shrink-0">
                    <Bot className="w-5 h-5 text-primary-foreground" />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border border-card"></span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm leading-none flex items-center gap-1.5">
                      ApplyFlow Copilot <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                    </h3>
                    <p className="text-[10px] text-green-500 font-semibold mt-0.5">Online Career Assistant</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono bg-background border border-border/50 px-2 py-0.5 rounded text-muted-foreground">
                    Model: applyflow-ultra-v2
                  </span>
                </div>
              </div>

              {/* Chat Messages Frame */}
              <div className="flex-1 p-5 md:p-6 overflow-y-auto space-y-4 bg-background/30 flex flex-col">
                {messages.map((msg, i) => (
                  <div 
                    key={i}
                    className={`flex gap-3 max-w-[85%] ${msg.sender === "user" ? "self-end flex-row-reverse" : "self-start"}`}
                  >
                    {msg.sender === "bot" && (
                      <div className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      <div className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                        msg.sender === "user" 
                          ? "bg-primary text-primary-foreground rounded-tr-none font-medium" 
                          : "bg-card border border-border/50 text-foreground rounded-tl-none font-medium"
                      }`}>
                        {msg.text.split("\n\n").map((para, idx) => (
                          <p key={idx} className={idx > 0 ? "mt-2" : ""}>
                            {para.split("**").map((part, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="font-bold">{part}</strong> : part)}
                          </p>
                        ))}
                      </div>

                      {/* Render Widget Attachments */}
                      {msg.widget && (
                        <div className="bg-background/80 border border-border/50 rounded-xl p-3.5 shadow-sm space-y-3 max-w-full">
                          
                          {/* Widget A: Suggested Jobs */}
                          {msg.widget === "jobs" && (
                            <div className="space-y-2.5">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground block border-b border-border/30 pb-1">
                                Integrated Search Results
                              </span>
                              {[
                                { title: "Vercel Lead Dev", fit: 96, salary: "$160k - $200k" },
                                { title: "Stripe UI Architect", fit: 92, salary: "$150k - $185k" }
                              ].map(job => (
                                <div key={job.title} className="flex justify-between items-center gap-2 border border-border/40 rounded-lg p-2 bg-card/50">
                                  <div>
                                    <h4 className="text-xs font-bold text-foreground leading-none mb-1">{job.title}</h4>
                                    <p className="text-[10px] text-muted-foreground font-medium">{job.salary} &bull; {job.fit}% ATS Fit</p>
                                  </div>
                                  <Link 
                                    href="/signup"
                                    className="px-2.5 py-1 bg-primary hover:bg-primary/95 text-primary-foreground text-[10px] font-bold rounded shadow-sm"
                                  >
                                    Apply
                                  </Link>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Widget B: ATS Audit Review */}
                          {msg.widget === "ats" && (
                            <div className="space-y-3">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground block border-b border-border/30 pb-1">
                                ATS Compatibility Dashboard
                              </span>
                              
                              <div className="flex items-center gap-3">
                                <div className="text-lg font-black text-amber-500">82% Score</div>
                                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div className="h-full bg-amber-500" style={{ width: "82%" }}></div>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2 text-[10px]">
                                <div className="text-green-500 font-semibold bg-green-500/5 border border-green-500/10 px-2 py-1 rounded">✅ 4 Matches</div>
                                <div className="text-amber-500 font-semibold bg-amber-500/5 border border-amber-500/10 px-2 py-1 rounded">⚠️ 2 Missing</div>
                              </div>

                              <button 
                                onClick={() => {
                                  setMessages(prev => [...prev, {
                                    sender: "bot",
                                    text: "🔧 **Keywords injected successfully!** I updated your resume profile data for the Stripe UI Developer description. Your updated compatibility score is now **98%**! 🚀"
                                  }]);
                                }}
                                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] font-bold rounded py-1.5 transition-colors flex items-center justify-center gap-1 shadow-sm"
                              >
                                <Sparkles className="w-3.5 h-3.5" /> Fix Keywords with AI
                              </button>
                            </div>
                          )}

                          {/* Widget C: Outreach Code Mock */}
                          {msg.widget === "email" && (
                            <div className="space-y-2">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground block border-b border-border/30 pb-1">
                                Outbox Email Draft Preview
                              </span>
                              <div className="bg-card border border-border/60 rounded-lg p-2.5 font-mono text-[10px] text-muted-foreground leading-relaxed h-28 overflow-y-auto">
                                <div className="text-foreground font-semibold">To: hiring@vercel.com</div>
                                <div className="text-foreground font-semibold border-b border-border/40 pb-1 mb-1">Subject: Frontend Stack Optimizations</div>
                                <p>Hi Vercel team,</p>
                                <p className="mt-1">I recently engineered a highly animated dashboard and wanted to offer my React skills...</p>
                              </div>
                              <Link 
                                href="/signup"
                                className="w-full bg-primary hover:bg-primary/95 text-primary-foreground text-[10px] font-bold rounded py-1.5 text-center block shadow-sm"
                              >
                                Deliver Instantly via Outbox
                              </Link>
                            </div>
                          )}

                          {/* Widget D: Bullet Points Comparisons */}
                          {msg.widget === "bullets" && (
                            <div className="space-y-2.5">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground block border-b border-border/30 pb-1">
                                Resume Refactoring
                              </span>
                              <div className="space-y-2 text-[10px]">
                                <div className="border border-red-500/10 bg-red-500/5 p-2 rounded leading-tight">
                                  <div className="text-red-500 font-bold uppercase text-[8px] mb-0.5">Original generic bullet</div>
                                  <p className="text-muted-foreground">"I worked as a frontend developer writing React dashboard pages and optimizing components."</p>
                                </div>
                                <div className="border border-green-500/15 bg-green-500/5 p-2 rounded leading-tight">
                                  <div className="text-green-500 font-bold uppercase text-[8px] mb-0.5">ApplyFlow AI Refactored Bullet</div>
                                  <p className="text-foreground font-medium">"Architected modular React core pages; trimmed payload speeds by **34%** and cut bundle overhead through Server Components."</p>
                                </div>
                              </div>
                            </div>
                          )}

                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isBotTyping && (
                  <div className="flex gap-3 self-start">
                    <div className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                    <div className="bg-card border border-border/50 rounded-2xl rounded-tl-none p-3.5 text-xs text-muted-foreground flex items-center gap-1.5 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                )}
                
                <div ref={chatBottomRef} />
              </div>

              {/* Quick Suggestions Pills */}
              <div className="bg-muted/20 border-t border-border/40 p-3 flex flex-wrap gap-1.5 shrink-0 justify-center">
                {[
                  { text: "Suggest high-paying React roles 🔍", key: "react" },
                  { text: "Audit my resume for Stripe UI position 📊", key: "stripe" },
                  { text: "Draft outreach email to Vercel ✉️", key: "vercel" },
                  { text: "Enhance my resume summary ✨", key: "bullets" }
                ].map(pill => (
                  <button
                    key={pill.key}
                    onClick={() => handleQuickAction(pill.text)}
                    className="px-3 py-1.5 rounded-full bg-card hover:bg-muted border border-border/40 hover:border-primary/30 text-[10px] font-bold text-muted-foreground hover:text-foreground shadow-sm transition-all"
                  >
                    {pill.text}
                  </button>
                ))}
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 bg-muted/40 border-t border-border/50 shrink-0">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex gap-2"
                >
                  <div className="relative flex-1 flex items-center">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask the AI recruiter anything..."
                      className="w-full bg-background border border-border/60 rounded-xl pl-3.5 pr-10 py-3 text-xs focus:outline-none focus:border-primary font-medium"
                    />
                    <button
                      type="button"
                      className="absolute right-3 text-muted-foreground hover:text-foreground"
                    >
                      <Paperclip className="w-4 h-4 shrink-0" />
                    </button>
                  </div>
                  
                  <Button 
                    type="submit"
                    className="rounded-xl px-4 bg-primary hover:bg-primary/95 shadow-md flex items-center justify-center shrink-0"
                  >
                    <SendHorizontal className="w-4 h-4" />
                  </Button>
                </form>
              </div>

            </div>
          </div>
        </section>

        {/* CORE FEATURES LIST SECTION */}
        <section id="features" className="py-32 border-y border-border/40 relative overflow-hidden">
          <div className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-60 mix-blend-screen" style={{ backgroundImage: "url('/hero-bg.png')" }}></div>
          <div className="absolute inset-0 z-0 bg-gradient-to-t from-background via-background/40 to-background/80"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <span className="inline-flex text-xs font-bold uppercase tracking-widest text-primary mb-4 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-md">Application Suite</span>
              <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Fast-Track Your Placement</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg">
                Stop wasting hours on repetitive cold forms. ApplyFlow is your 24/7 autonomous recruiter, powered by state-of-the-art AI.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                {
                  title: "Beat ATS Systems",
                  description: "Scan your resume against live requirements in real-time. Instantly spot missing structural keywords and inject optimized bullet accomplishments in 1 click."
                },
                {
                  title: "Autopilot Sends",
                  description: "Select individual job contacts or drop standard spreadsheets. ApplyFlow parses leads and automatically delivers contextual, tailored pitches at optimal schedules."
                },
                {
                  title: "Bespoke Outreach",
                  description: "No generic templates. The engine structures natural cold pitches specific to hiring companies, matching referral criteria to bypass standard applicant filter lines."
                }
              ].map((feature, i) => (
                <div
                  key={i}
                  className="p-8 rounded-3xl bg-background/50 backdrop-blur-xl border border-white/5 shadow-2xl hover:bg-white/5 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-center text-center group"
                >
                  <h3 className="text-xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING & CONVERT CTA */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-primary/10 rounded-full blur-[110px] pointer-events-none"></div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="max-w-4xl mx-auto bg-card border border-border/50 rounded-[2.5rem] p-10 md:p-16 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-grid-white/[0.01] -z-10"></div>
              
              <h2 className="text-3xl md:text-5xl font-extrabold mb-5 tracking-tight leading-tight">
                Ready to Get Placed?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-10 text-sm md:text-base leading-relaxed">
                Join thousands of candidates securing premium responses from major tech firms with ApplyFlow AI outbox delivery.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-6 mb-10">
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> No Credit Card Required
                </div>
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> 14-Day Free Evaluation Trial
                </div>
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> 100% Secure Encrypted Outbox
                </div>
              </div>

              <Link 
                href="/signup"
                className={buttonVariants({ size: "lg" }) + " rounded-full px-10 bg-primary hover:bg-primary/95 text-primary-foreground font-bold shadow-[0_4px_25px_rgba(var(--primary),0.3)] transform hover:-translate-y-0.5 transition-all"}
              >
                Start Free Evaluation <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border/40 py-10 bg-card">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-inner">
              <Bot className="w-4.5 h-4.5 text-primary-foreground" />
            </div>
            <span className="font-extrabold tracking-tight text-sm text-foreground">ApplyFlow <span className="text-primary font-black">AI</span></span>
          </div>
          <p className="text-muted-foreground text-xs font-medium">
            © {new Date().getFullYear()} ApplyFlow AI Inc. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs font-semibold text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
