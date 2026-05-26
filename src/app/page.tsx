"use client";

import React, { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button, buttonVariants } from "@/components/ui/button";
import { 
  ArrowRight, Bot, Sparkles, ChevronRight, CheckCircle2, Briefcase,
  Send, MessageSquare, Terminal, FileText, Check, Search, User, RefreshCw, Star, X,
  Play, Pause, Paperclip, SendHorizontal, Mail, UploadCloud, Layers, Database, Code, Copy, Layout,
  ChevronDown, ChevronUp
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
  const [showUpcoming, setShowUpcoming] = useState<boolean>(false);
  const [isComingSoonOpen, setIsComingSoonOpen] = useState<boolean>(false);
  const [waitlistEmail, setWaitlistEmail] = useState<string>("");
  const [waitlistSubmitted, setWaitlistSubmitted] = useState<boolean>(false);

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

  const flowSteps = [
    {
      step: 1,
      label: "Profile Scan",
      desc: "Extracting parameters",
      icon: FileText,
      status: "Parsing identity"
    },
    {
      step: 2,
      label: "ATS Match",
      desc: "Checking keywords",
      icon: Search,
      status: "Scoring fit"
    },
    {
      step: 3,
      label: "Smart Draft",
      desc: "Writing outreach",
      icon: Sparkles,
      status: "Generating copy"
    },
    {
      step: 4,
      label: "Dispatch",
      desc: "Sending email",
      icon: Send,
      status: "Delivering"
    }
  ];
  const activeFlow = flowSteps.find(step => step.step === flowStep) ?? flowSteps[0];

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
                        <div className="flex items-center gap-3 border-b border-border/40 pb-2">
                          <span className="text-muted-foreground w-16 shrink-0">Recruiter:</span>
                          <span className="text-foreground truncate">hiring@stripe.com</span>
                        </div>
                        <div className="flex items-center gap-3 border-b border-border/40 pb-2">
                          <span className="text-muted-foreground w-16 shrink-0">Subject:</span>
                          <span className="text-foreground truncate">Application: Senior React Developer</span>
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
            <div className="text-center mb-24">
              <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3 block">Workflow</span>
              <h2 className="text-4xl md:text-5xl font-extrabold mb-4">How It Works</h2>
            </div>

            <div className="rounded-3xl border border-border/60 bg-gradient-to-br from-background via-background to-primary/5 p-8 md:p-12 shadow-2xl backdrop-blur-xl">
              <div className="mb-8">
                <span className="text-xs font-bold uppercase tracking-widest text-primary">Console</span>
                <h3 className="text-3xl font-extrabold mt-2">Live Simulation</h3>
              </div>

              <div className="grid gap-10 lg:grid-cols-[300px_1fr]">
                <div className="rounded-2xl border border-border/60 bg-card/50 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Steps</span>
                    <span className="text-[10px] font-mono text-muted-foreground">{flowStep} / 4</span>
                  </div>
                  <div className="relative flex flex-col">
                    {flowSteps.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <React.Fragment key={item.step}>
                          {index > 0 && (
                            <div className="w-px h-4 bg-border/60 ml-[30px] shrink-0"></div>
                          )}
                          <button
                            onClick={() => {
                            setFlowStep(item.step);
                            setIsFlowAutoPlay(false);
                          }}
                          className={`relative w-full rounded-2xl border px-4 py-4 text-left transition-all ${
                            flowStep === item.step
                              ? "border-primary/50 bg-primary/10 shadow-md"
                              : "border-border/50 bg-background/40 hover:bg-muted/30"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-full border ${
                                flowStep === item.step
                                  ? "border-primary/50 bg-primary/20 text-primary"
                                  : "border-border/60 bg-muted/40 text-muted-foreground"
                              }`}
                            >
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                            <div>
                              <p className={`text-xs font-bold ${flowStep === item.step ? "text-primary" : "text-foreground"}`}>
                                {item.label}
                              </p>
                              <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                            </div>
                          </div>
                          {flowStep === item.step && (
                            <div className="mt-2 text-[10px] font-semibold text-emerald-500">{item.status}</div>
                          )}
                        </button>
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>

                <div className="relative bg-card/40 border border-border/50 rounded-3xl p-8 md:p-12 min-h-[480px] shadow-xl flex flex-col justify-between overflow-hidden backdrop-blur-xl">
                  <div className="absolute inset-0 bg-grid-white/[0.02] -z-10"></div>
                  <div className="flex items-start justify-between gap-4 mb-8">
                    <div>
                      <h4 className="text-xl font-bold">Stage {activeFlow.step}: {activeFlow.label}</h4>
                    </div>
                    <button
                      onClick={() => setIsFlowAutoPlay(prev => !prev)}
                      className="px-3 py-1.5 rounded-full bg-muted/65 hover:bg-muted/100 border border-border/50 text-[10px] font-bold flex items-center gap-1.5 transition-all text-foreground"
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
                      className="w-full max-w-lg flex flex-col md:flex-row items-center justify-center gap-8"
                    >
                      <div className="bg-background/80 border border-border/60 rounded-full p-8 shadow-lg flex flex-col items-center justify-center relative w-48 h-48 shrink-0">
                        <div className="absolute inset-0 rounded-full border-4 border-dashed border-primary/20 animate-[spin_10s_linear_infinite]"></div>
                        <div className="absolute inset-2 rounded-full border border-primary/30 animate-[spin_4s_linear_infinite_reverse]"></div>
                        
                        <FileText className="w-8 h-8 text-primary mb-2" />
                        <span className="text-[10px] font-bold text-primary tracking-widest uppercase animate-pulse">Scanning</span>
                        <span className="text-xs font-mono mt-1 text-muted-foreground">profile.pdf</span>
                      </div>

                      <div className="space-y-4 max-w-xs text-center md:text-left">
                        <div>
                          <h4 className="text-lg font-bold">Extracting Data</h4>
                          <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                            Pulling structured parameters from your resume document.
                          </p>
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-start gap-2">
                          {["React", "TypeScript", "Tailwind"].map((tech, idx) => (
                            <motion.div
                              key={tech}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: idx * 0.2, duration: 0.3 }}
                              className="bg-primary/10 border border-primary/20 rounded-full px-3 py-1 text-[10px] text-primary font-bold flex items-center gap-1.5"
                            >
                              <Check className="w-3 h-3 stroke-[3]" /> {tech}
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
                      className="w-full max-w-xl flex flex-col md:flex-row items-center gap-10"
                    >
                      <div className="bg-card/40 border border-border/50 rounded-3xl p-8 flex flex-col items-center justify-center shrink-0 w-52 h-64 shadow-inner relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none"></div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-6">ATS Compatibility</span>
                        
                        <span className="text-5xl font-black text-foreground mb-8">94%</span>
                        
                        <span className="text-xs text-green-500 font-bold bg-green-500/10 border border-green-500/20 px-4 py-1.5 rounded-full">
                          Highly Qualified
                        </span>
                      </div>

                      <div className="flex-1 space-y-8">
                        <div>
                          <h4 className="text-lg font-bold mb-3">Auditing Profile</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            Comparing resume keywords against job requirements.
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                          <div className="flex items-center gap-2 text-sm text-green-500 font-bold">
                            <Check className="w-4 h-4 stroke-[3]" /> React, NextJS
                          </div>
                          <div className="flex items-center gap-2 text-sm text-green-500 font-bold">
                            <Check className="w-4 h-4 stroke-[3]" /> Tailwind, REST
                          </div>
                          <div className="flex items-start gap-2 text-amber-500 font-bold">
                            <RefreshCw className="w-4 h-4 mt-0.5 animate-spin-slow shrink-0" />
                            <div className="flex flex-col text-sm leading-tight gap-1">
                              <span>GraphQL</span>
                              <span className="text-amber-500/80">(Autofixed)</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-green-500 font-bold">
                            <Check className="w-4 h-4 stroke-[3]" /> TypeScript
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
                        
                        <motion.div 
                          className="mt-1 leading-normal"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 1 }}
                        >
                          <p>I noticed the opening for a Frontend Developer. My experience aligns closely with your tech-stack:</p>
                          <ul className="list-disc list-inside mt-1 pl-1 text-primary">
                            <li>Engineered interactive dashboards.</li>
                            <li>Leveraged Next.js Server Components.</li>
                          </ul>
                        </motion.div>
                        
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
                            initial={{ left: "0%", opacity: 0 }}
                            animate={{ left: "100%", opacity: [0, 1, 1, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
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
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="bg-green-500/10 border border-green-500/25 rounded-2xl px-5 py-3 flex items-center gap-2.5 text-green-500 text-xs font-bold shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Outreach Sent Successfully!</span>
                      </motion.div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>

                  <div className="flex items-center justify-center border-t border-border/20 pt-6 mt-8 shrink-0">
                    <span className="text-xs text-muted-foreground flex items-center gap-2 font-medium">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                      Step {flowStep} of 4
                    </span>
                  </div>
                </div>
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

        {/* TESTIMONIALS SECTION */}
        <section id="testimonials" className="py-24 bg-muted/10 border-y border-border/40 relative">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black mb-4">Loved by Candidates</h2>
              <p className="text-muted-foreground">See how ApplyFlow is accelerating careers.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                { 
                  name: "Sarah J.", 
                  role: "Frontend Engineer", 
                  image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
                  text: "ApplyFlow got me 3 interviews at top tech companies in my first week. The automated outreach is incredible." 
                },
                { 
                  name: "David M.", 
                  role: "Product Manager", 
                  image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop&crop=face",
                  text: "The ATS optimization alone is worth it. It spotted 5 missing keywords that I completely overlooked in my resume." 
                },
                { 
                  name: "Emily R.", 
                  role: "UX Designer", 
                  image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
                  text: "Finally, a tool that takes the busywork out of job hunting. I just load my profile and let the AI do the heavy lifting." 
                }
              ].map((t, i) => (
                <div key={i} className="bg-gradient-to-b from-card/80 to-card border border-border/50 rounded-3xl p-8 shadow-xl flex flex-col gap-6 hover:-translate-y-2 transition-transform duration-300 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-5 text-primary pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-12 group-hover:opacity-10">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14.017 18L14.017 10.609C14.017 4.905 17.748 1.039 23 0L23.995 2.151C21.563 3.068 20 5.789 20 8H24V18H14.017ZM0 18V10.609C0 4.905 3.748 1.038 9 0L9.996 2.151C7.563 3.068 6 5.789 6 8H9.983L9.983 18L0 18Z" />
                    </svg>
                  </div>
                  <div className="flex text-amber-500 gap-1 mb-2 z-10">
                    <Star className="fill-current w-4 h-4" /><Star className="fill-current w-4 h-4" /><Star className="fill-current w-4 h-4" /><Star className="fill-current w-4 h-4" /><Star className="fill-current w-4 h-4" />
                  </div>
                  <p className="text-base text-foreground/90 font-medium leading-relaxed flex-1 z-10">"{t.text}"</p>
                  <div className="flex items-center gap-4 mt-2 z-10">
                    <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full object-cover border-2 border-primary/20 shadow-sm" />
                    <div>
                      <p className="text-sm font-bold text-foreground">{t.name}</p>
                      <p className="text-xs font-semibold text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section id="pricing" className="py-32 relative">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black mb-4">Simple Pricing</h2>
              <p className="text-muted-foreground">Start for free, upgrade when you need more power.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Basic Plan */}
              <div className="bg-card/50 border border-border/60 rounded-3xl p-8 flex flex-col">
                <h3 className="text-2xl font-bold mb-2">Basic</h3>
                <div className="flex items-end gap-1 mb-6">
                  <span className="text-4xl font-black">$0</span>
                  <span className="text-muted-foreground text-sm mb-1">/ forever</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-sm"><Check className="w-4 h-4 text-primary" /> 1 Resume parsing limit</li>
                  <li className="flex items-center gap-3 text-sm"><Check className="w-4 h-4 text-primary" /> Basic ATS keyword checks</li>
                  <li className="flex items-center gap-3 text-sm"><Check className="w-4 h-4 text-primary" /> 5 AI email drafts / month</li>
                </ul>
                <Link href="/signup" className={buttonVariants({ variant: "outline", className: "w-full rounded-xl" })}>Get Started</Link>
              </div>
              
              {/* Pro Plan */}
              <div className="bg-gradient-to-b from-primary/10 to-card border border-primary/30 rounded-3xl p-8 flex flex-col relative shadow-2xl">
                <div className="absolute top-0 right-8 -translate-y-1/2 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">Most Popular</div>
                <h3 className="text-2xl font-bold mb-2 text-primary">Pro</h3>
                <div className="flex items-end gap-1 mb-6">
                  <span className="text-4xl font-black">$19</span>
                  <span className="text-muted-foreground text-sm mb-1">/ month</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-sm"><Check className="w-4 h-4 text-primary" /> Unlimited resume versions</li>
                  <li className="flex items-center gap-3 text-sm"><Check className="w-4 h-4 text-primary" /> Advanced ATS optimization</li>
                  <li className="flex items-center gap-3 text-sm"><Check className="w-4 h-4 text-primary" /> Unlimited automated outreach</li>
                  <li className="flex items-center gap-3 text-sm"><Check className="w-4 h-4 text-primary" /> Priority support</li>
                  
                  <li className="pt-2">
                    <button 
                      onClick={() => setShowUpcoming(!showUpcoming)}
                      className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                    >
                      {showUpcoming ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      {showUpcoming ? "Hide upcoming features" : "Show upcoming features"}
                    </button>
                    
                    <AnimatePresence>
                      {showUpcoming && (
                        <motion.ul 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="space-y-3 mt-4 overflow-hidden"
                        >
                          <li className="flex items-center gap-3 text-sm text-muted-foreground"><Sparkles className="w-4 h-4 text-indigo-400" /> LinkedIn Auto-Apply Bot</li>
                          <li className="flex items-center gap-3 text-sm text-muted-foreground"><Sparkles className="w-4 h-4 text-indigo-400" /> Custom Domain Email Sending</li>
                          <li className="flex items-center gap-3 text-sm text-muted-foreground"><Sparkles className="w-4 h-4 text-indigo-400" /> Interview Voice Coach AI</li>
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </li>
                </ul>
                <button
                  onClick={() => {
                    setWaitlistSubmitted(false);
                    setWaitlistEmail("");
                    setIsComingSoonOpen(true);
                  }}
                  className={buttonVariants({ className: "w-full rounded-xl font-bold" })}
                >
                  Upgrade to Pro
                </button>
              </div>
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

      {/* COMING SOON MODAL */}
      <AnimatePresence>
        {isComingSoonOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
            onClick={() => setIsComingSoonOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-primary/20 bg-card p-8 md:p-10 shadow-2xl text-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Glow background effect */}
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

              {/* Close Button */}
              <button
                onClick={() => setIsComingSoonOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full border border-border/40 bg-muted/20 hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all focus:outline-none"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Top Icon */}
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary animate-pulse">
                <Sparkles className="w-8 h-8" />
              </div>

              {/* Content */}
              <h3 className="text-2xl font-black text-foreground mb-3 tracking-tight">
                Pro Plan is Coming Soon!
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                We are putting the final touches on our automated recruiter engine. Be the first to unlock unlimited automated outreach, advanced ATS keyword optimization, and priority seatings.
              </p>

              {/* Waitlist Form */}
              {!waitlistSubmitted ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (waitlistEmail.trim()) {
                      setWaitlistSubmitted(true);
                    }
                  }}
                  className="space-y-3"
                >
                  <div className="flex flex-col gap-2">
                    <input
                      type="email"
                      required
                      placeholder="Enter your email address"
                      value={waitlistEmail}
                      onChange={(e) => setWaitlistEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/45 transition-all text-center"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-[0_4px_15px_rgba(var(--primary),0.2)] hover:shadow-[0_4px_20px_rgba(var(--primary),0.3)] transition-all flex items-center justify-center gap-2"
                  >
                    Join the Exclusive Waitlist <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-500/10 border border-green-500/25 rounded-2xl p-5 text-center"
                >
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20 text-green-500">
                    <Check className="w-5 h-5 stroke-[3]" />
                  </div>
                  <h4 className="text-sm font-bold text-green-500 mb-1">You are on the list!</h4>
                  <p className="text-[11px] text-green-400/90 leading-tight">
                    We'll email you at <span className="font-semibold">{waitlistEmail}</span> as soon as the Pro features launch.
                  </p>
                </motion.div>
              )}

              <div className="mt-6 text-[10px] text-muted-foreground font-medium flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Free early beta perks included
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
