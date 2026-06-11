"use client";

import React, { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  ArrowRight, Bot, Sparkles, ChevronRight, CheckCircle2, Briefcase,
  Send, MessageSquare, Terminal, FileText, Check, Search, User, RefreshCw, Star, X,
  Play, Pause, Paperclip, SendHorizontal, Mail, UploadCloud, Layers, Database, Code, Copy, Layout,
  ChevronDown, ChevronUp, GitMerge, Workflow, BarChart3, Maximize2, ChevronLeft
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
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

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="group border-b border-border/40 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={question}
        className="w-full flex items-center justify-between py-6 text-left focus:outline-none"
      >
        <span className={`font-bold text-lg md:text-xl transition-colors duration-200 ${isOpen ? 'text-primary' : 'text-foreground group-hover:text-primary/80'}`}>
          {question}
        </span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 will-change-transform ${isOpen ? 'text-primary rotate-180' : 'text-muted-foreground group-hover:text-primary'}`}>
          <ChevronDown className="w-5 h-5" />
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -10 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-8 text-muted-foreground leading-relaxed md:text-lg pr-8">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Home() {
  // --- STATE 1: Automation Command Center Tab switcher ---
  const CMD_TABS = ["workflow", "single", "templates", "ats"] as const;
  const CMD_TAB_DURATION = 6000; // ms per tab
  const [activeCmdTab, setActiveCmdTab] = useState<string>("workflow");
  const [isCmdAutoCycling, setIsCmdAutoCycling] = useState<boolean>(true);
  const cmdAutoResumeRef = useRef<NodeJS.Timeout | null>(null);
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);
  const [showUpcoming, setShowUpcoming] = useState<boolean>(false);
  const [isComingSoonOpen, setIsComingSoonOpen] = useState<boolean>(false);
  const [waitlistEmail, setWaitlistEmail] = useState<string>("");
  const [waitlistSubmitted, setWaitlistSubmitted] = useState<boolean>(false);
  const [activeStackCard, setActiveStackCard] = useState<number>(0);

  // Auto-cycle the Stacked Cards
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.hidden) return;
      setActiveStackCard((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Auto-cycle Command Center tabs
  useEffect(() => {
    if (!isCmdAutoCycling) return;
    const progressInterval = setInterval(() => {
      if (document.hidden) return;
      setActiveCmdTab(current => {
        const idx = CMD_TABS.indexOf(current as typeof CMD_TABS[number]);
        return CMD_TABS[(idx + 1) % CMD_TABS.length];
      });
    }, CMD_TAB_DURATION);
    return () => clearInterval(progressInterval);
  }, [isCmdAutoCycling]);

  const handleCmdTabClick = (tabId: string) => {
    setActiveCmdTab(tabId);
    setIsCmdAutoCycling(false);
    // Resume auto-cycling after 12s of inactivity
    if (cmdAutoResumeRef.current) clearTimeout(cmdAutoResumeRef.current);
    cmdAutoResumeRef.current = setTimeout(() => setIsCmdAutoCycling(true), 12000);
  };

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
        if (document.hidden) return;
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
        <section className="relative pt-28 pb-48 md:pt-36 md:pb-64 overflow-hidden bg-gradient-to-b from-background via-primary/5 to-primary/10">

          <div className="absolute top-1/4 right-0 -z-10 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
          <div className="absolute bottom-10 left-0 -z-10 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[140px] opacity-70"></div>

          <div className="container mx-auto px-4 text-center z-10 relative">

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
                Get Started for Free <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
              <Link
                href="/#pricing"
                className={buttonVariants({ size: "lg", variant: "outline" }) + " w-full sm:w-auto rounded-full px-8 font-semibold bg-background hover:bg-muted/50 transition-all transform hover:-translate-y-0.5"}
              >
                View Pricing
              </Link>
            </motion.div>
          </div>

          {/* Organic, Realistic SVG Wave Divider - Themed for Light/Dark */}
          <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-0 translate-y-px">
            <svg className="relative block w-full h-[100px] md:h-[200px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
              {/* Back Layer: Indigo in light mode, dark bg in dark mode */}
              <path fill="currentColor" className="text-indigo-500/15 dark:text-background/30" d="M0,128L48,149.3C96,171,192,213,288,218.7C384,224,480,192,576,170.7C672,149,768,139,864,160C960,181,1056,235,1152,240C1248,245,1344,203,1392,181.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
              {/* Middle Layer: Primary tint in light mode, dark bg in dark mode */}
              <path fill="currentColor" className="text-primary/20 dark:text-background/60" d="M0,224L48,208C96,192,192,160,288,144C384,128,480,128,576,149.3C672,171,768,213,864,224C960,235,1056,213,1152,192C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
              {/* Front Layer: Solid background color to seamlessly blend into the next section */}
              <path fill="currentColor" className="text-background" d="M0,192L48,208C96,224,192,256,288,256C384,256,480,224,576,202.7C672,181,768,171,864,181.3C960,192,1056,224,1152,229.3C1248,235,1344,213,1392,202.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
          </div>
        </section>

        {/* TRUSTED BY / SOCIAL PROOF */}
        <section className="py-16 border-b border-border/40 bg-muted/20 relative z-10">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm font-semibold text-muted-foreground mb-8 uppercase tracking-widest">
              Trusted By
            </p>
            <div className="relative flex overflow-hidden w-full max-w-5xl mx-auto mb-12 select-none">
              {/* Fade masks for smooth edges */}
              <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-muted/20 to-transparent z-10 pointer-events-none"></div>
              <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-muted/20 to-transparent z-10 pointer-events-none"></div>

              <motion.div
                className="flex w-max items-center"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ repeat: Infinity, ease: "linear", duration: 20 }}
              >
                {/* We map twice to create the seamless infinite scroll effect */}
                {[0, 1].map((setIndex) => (
                  <div key={setIndex} className="flex items-center gap-16 md:gap-24 px-8 md:px-12" aria-hidden={setIndex === 1 ? "true" : undefined}>
                    {setIndex === 0 && <span className="sr-only">Trusted by Google, LinkedIn, Gmail, and Microsoft</span>}

                    <div className="flex items-center gap-2 text-2xl font-bold font-sans text-foreground/80 hover:text-foreground transition-colors cursor-default">
                      <svg className="w-8 h-8 text-[#4285F4]" viewBox="0 0 24 24" fill="currentColor"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.187 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" /></svg>
                      Google
                    </div>
                    <div className="flex items-center gap-2 text-2xl font-bold font-sans text-foreground/80 hover:text-foreground transition-colors cursor-default">
                      <svg className="w-8 h-8 text-[#0A66C2]" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                      LinkedIn
                    </div>
                    <div className="flex items-center gap-2 text-2xl font-bold font-sans text-foreground/80 hover:text-foreground transition-colors cursor-default">
                      <svg className="w-8 h-8 text-[#EA4335]" viewBox="0 0 24 24" fill="currentColor"><path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" /></svg>
                      Gmail
                    </div>
                    <div className="flex items-center gap-2 text-2xl font-bold font-sans text-foreground/80 hover:text-foreground transition-colors cursor-default">
                      <svg className="w-7 h-7 text-[#00A4EF]" viewBox="0 0 24 24" fill="currentColor"><path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z" /></svg>
                      Microsoft
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
            <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
              <div className="bg-background rounded-2xl p-4 shadow-sm border border-border/50">
                <span className="text-3xl font-black text-primary block">10,000+</span>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Applications Sent</span>
              </div>
              <div className="bg-background rounded-2xl p-4 shadow-sm border border-border/50">
                <span className="text-3xl font-black text-primary block">99%</span>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Automation Success Rate</span>
              </div>
            </div>
          </div>
        </section>



        {/* SECTION 1: INTERACTIVE AUTOMATION COMMAND CENTER — Theme Styled */}
        <section id="automation-center" className="py-24 md:py-36 bg-background relative overflow-hidden">

          <div className="container mx-auto px-4 max-w-[1100px] relative z-10">

            {/* Massive headline — overlapping composition */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7 }}
              className="text-center relative"
            >
              {/* Icon above headline */}
              <div className="flex justify-center mb-5">
                <div className="w-14 h-14 rounded-[14px] bg-card border border-border/50 flex items-center justify-center shadow-sm">
                  <Bot className="w-7 h-7 text-primary" />
                </div>
              </div>

              <h2 className="text-[56px] md:text-[80px] lg:text-[100px] font-bold text-foreground tracking-[-0.10em] leading-[0.88] relative z-20 flex flex-col items-center justify-center">
                <span className="flex gap-4 md:gap-6">
                  <motion.span
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >Search.</motion.span>
                  <motion.span
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >Build.</motion.span>
                </span>
                <motion.span
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="relative z-10 text-primary mt-2"
                >Automate.</motion.span>
              </h2>
            </motion.div>

            {/* Dark floating search bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="relative z-30 flex justify-center mt-6 md:mt-10 mb-8"
            >
              <div className="bg-primary text-primary-foreground rounded-[12px] px-6 py-4 flex items-center gap-4 w-full max-w-[520px] shadow-xl">
                <div className="w-px h-5 bg-primary-foreground/30"></div>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={activeCmdTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="text-primary-foreground text-base md:text-lg font-medium tracking-[-0.02em] flex-1"
                  >
                    {activeCmdTab === "workflow" && "Build outreach pipeline..."}
                    {activeCmdTab === "single" && "Draft cold email for Stripe..."}
                    {activeCmdTab === "templates" && "Clone Next.js pitch template..."}
                    {activeCmdTab === "ats" && "Score resume vs job description..."}
                  </motion.span>
                </AnimatePresence>
                <RefreshCw className="w-5 h-5 text-primary-foreground/60 animate-spin" style={{ animationDuration: '3s' }} />
              </div>
            </motion.div>

            {/* Filter chips row */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap justify-center gap-2 mb-14 relative z-20"
            >
              {[
                { id: "workflow", label: "Visual Builder", icon: <GitMerge className="w-3.5 h-3.5" />, shortcut: "V" },
                { id: "single", label: "Email Dispatch", icon: <Send className="w-3.5 h-3.5" />, shortcut: "E" },
                { id: "templates", label: "Templates", icon: <Layout className="w-3.5 h-3.5" />, shortcut: "T" },
                { id: "ats", label: "ATS Auditor", icon: <Layers className="w-3.5 h-3.5" />, shortcut: "A" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleCmdTabClick(tab.id)}
                  className={`relative flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-semibold tracking-[-0.01em] transition-all duration-300 overflow-hidden ${activeCmdTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                >
                  {/* Auto-cycle progress bar */}
                  {activeCmdTab === tab.id && isCmdAutoCycling && (
                    <motion.div
                      key={`progress-${tab.id}`}
                      className="absolute bottom-0 left-0 h-[2px] bg-primary-foreground/40 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: CMD_TAB_DURATION / 1000, ease: "linear" }}
                    />
                  )}
                  <span className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold ${activeCmdTab === tab.id
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted-foreground/20 text-muted-foreground group-hover:text-foreground"
                    }`}>
                    {tab.shortcut}
                  </span>
                  {tab.label}
                </button>
              ))}
            </motion.div>

            {/* Floating cards showcase */}
            <div className="min-h-[420px] flex items-center justify-center relative w-full">

              <AnimatePresence mode="wait">

                {/* Visual Workflow — Layered card composition */}
                {activeCmdTab === "workflow" && (
                  <motion.div
                    key="cmd-workflow"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="w-full max-w-4xl flex flex-col items-center relative"
                  >
                    {/* Main white card */}
                    <div className="bg-card border border-border/50 rounded-[12px] w-full max-w-[620px] overflow-hidden relative shadow-lg">
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(var(--foreground-rgb),0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(var(--foreground-rgb),0.03)_1px,transparent_1px)] bg-[size:28px_28px] dark:opacity-20"></div>

                      <div className="relative p-8 flex flex-col items-center gap-3">
                        {/* Workflow nodes */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className="bg-background border-[1.5px] border-border rounded-[12px] p-4 w-full max-w-[360px] flex items-center gap-4 hover:border-primary transition-colors cursor-pointer group shadow-sm"
                        >
                          <div className="w-10 h-10 rounded-[10px] bg-primary/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <Search className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-[0.04em]">Trigger</p>
                            <p className="text-[15px] font-semibold text-foreground tracking-[-0.02em]">Job Match Found</p>
                          </div>
                        </motion.div>

                        <div className="h-6 w-px bg-border"></div>

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.25 }}
                          className="bg-background border-[1.5px] border-primary rounded-[12px] p-4 w-full max-w-[360px] flex items-center gap-4 cursor-pointer group ring-[3px] ring-primary/10 shadow-sm"
                        >
                          <div className="w-10 h-10 rounded-[10px] bg-foreground/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <Bot className="w-5 h-5 text-foreground" />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-[0.04em]">AI Action</p>
                            <p className="text-[15px] font-semibold text-foreground tracking-[-0.02em]">Draft Cold Email</p>
                          </div>
                        </motion.div>

                        <div className="h-6 w-px bg-border"></div>

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          className="bg-background border-[1.5px] border-border rounded-[12px] p-4 w-full max-w-[360px] flex items-center gap-4 hover:border-emerald-500 transition-colors cursor-pointer group shadow-sm"
                        >
                          <div className="w-10 h-10 rounded-[10px] bg-emerald-500/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <Send className="w-5 h-5 text-emerald-500" />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-[0.04em]">Action</p>
                            <p className="text-[15px] font-semibold text-foreground tracking-[-0.02em]">Send via Gmail</p>
                          </div>
                        </motion.div>
                      </div>
                    </div>

                    {/* Side floating feature pills */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      className="absolute -right-2 md:right-4 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-3"
                    >
                      {[
                        { icon: <Sparkles className="w-4 h-4 text-primary" />, label: "AI Integration", sub: "Native LLM nodes" },
                        { icon: <GitMerge className="w-4 h-4 text-indigo-500" />, label: "Conditional Logic", sub: "Split by fit score" }
                      ].map((feat, i) => (
                        <div key={i} className="bg-card border border-border/50 rounded-[12px] px-4 py-3 flex items-center gap-3 w-[200px] shadow-md">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                            {feat.icon}
                          </div>
                          <div>
                            <p className="text-[13px] font-bold text-foreground">{feat.label}</p>
                            <p className="text-[11px] text-muted-foreground">{feat.sub}</p>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  </motion.div>
                )}

                {/* Email Dispatch — Transaction card style */}
                {activeCmdTab === "single" && (
                  <motion.div
                    key="cmd-single"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="w-full max-w-[620px] mx-auto"
                  >
                    <div className="bg-card border border-border/50 rounded-[12px] overflow-hidden shadow-lg">
                      {/* macOS-style titlebar */}
                      <div className="bg-muted border-b border-border/50 px-5 py-3 flex items-center gap-4">
                        <div className="flex gap-2">
                          <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
                          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                          <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
                        </div>
                        <span className="text-[12px] font-semibold text-muted-foreground tracking-[-0.02em] flex-1 text-center pr-8 font-mono">
                          outbox_composer.exe
                        </span>
                      </div>

                      {/* Email fields */}
                      <div className="p-6 space-y-4 bg-card">
                        <div className="flex items-center justify-between border-b border-border/50 pb-3">
                          <span className="text-[11px] uppercase font-bold text-muted-foreground tracking-[0.04em]">To</span>
                          <span className="text-[15px] font-semibold text-foreground tracking-[-0.02em]">hiring@stripe.com</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-border/50 pb-3">
                          <span className="text-[11px] uppercase font-bold text-muted-foreground tracking-[0.04em]">Subject</span>
                          <span className="text-[15px] font-bold text-foreground tracking-[-0.02em]">Application: Senior React Developer</span>
                        </div>
                        <div className="text-foreground/80 leading-relaxed text-[15px] pt-2 tracking-[-0.02em]">
                          <p>Hi Recruiting Team,</p>
                          <p className="mt-3">I noticed your opening for a UI Developer. My background matches your tech-stack: React, Next.js, and TypeScript. I recently built a highly responsive dashboard showing...</p>
                        </div>
                      </div>
                    </div>

                    {/* Feature toggles floating right */}
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex flex-wrap justify-center gap-3 mt-5"
                    >
                      {[
                        { label: "HTML Card", active: true },
                        { label: "PDF Attached", active: true },
                        { label: "Tracking Links", active: false }
                      ].map((toggle, i) => (
                        <div key={i} className="bg-card border border-border/50 rounded-full px-4 py-2 flex items-center gap-2.5 text-[13px] font-semibold shadow-sm">
                          <span className="text-foreground">{toggle.label}</span>
                          <div className={`w-8 h-[18px] rounded-full relative ${toggle.active ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
                            <div className={`absolute top-[2px] w-[14px] h-[14px] rounded-full bg-background shadow-sm transition-all ${toggle.active ? 'right-[2px]' : 'left-[2px]'}`}></div>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  </motion.div>
                )}

                {/* Template Engine — Stacked cards */}
                {activeCmdTab === "templates" && (
                  <motion.div
                    key="cmd-templates"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="w-full max-w-[620px] mx-auto flex flex-col gap-4"
                  >
                    {[
                      {
                        id: "temp-1",
                        title: "Next.js Pitch Template",
                        subject: "Impressed by Next.js load structures",
                        desc: "Personalized cold pitch targeting React engineering openings.",
                        tag: "ENGINEERING"
                      },
                      {
                        id: "temp-2",
                        title: "DevOps Deploy Template",
                        subject: "Automating AWS Cloud Pipelines",
                        desc: "Refined cover template optimized for infrastructure teams.",
                        tag: "DEVOPS"
                      }
                    ].map((temp, i) => (
                      <motion.div
                        key={temp.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.15 }}
                        className="bg-card border border-border/50 rounded-[12px] p-5 flex items-center justify-between gap-4 cursor-pointer hover:translate-y-[-2px] transition-transform shadow-md"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1.5">
                            <span className="text-[15px] font-bold text-foreground tracking-[-0.02em]">{temp.title}</span>
                            <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-0.5 rounded tracking-[0.04em]">{temp.tag}</span>
                          </div>
                          <p className="text-[13px] text-muted-foreground truncate">{temp.desc}</p>
                        </div>
                        <button
                          onClick={() => handleCopyCode(temp.subject, temp.id)}
                          className="bg-primary text-primary-foreground text-[12px] font-semibold px-4 py-2 rounded-full hover:bg-primary/90 transition-colors flex items-center gap-1.5 shrink-0"
                        >
                          <Copy className="w-3 h-3" />
                          {copiedTemplate === temp.id ? "Copied!" : "Clone"}
                        </button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {/* ATS Auditor — Score card */}
                {activeCmdTab === "ats" && (
                  <motion.div
                    key="cmd-ats"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="w-full max-w-[620px] mx-auto"
                  >
                    <div className="bg-card border border-border/50 rounded-[12px] p-8 text-center shadow-lg">
                      {/* Score circle */}
                      <div className="relative w-32 h-32 flex items-center justify-center mx-auto mb-6">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="16" fill="none" className="stroke-muted" strokeWidth="2.5" />
                          <motion.circle
                            cx="18"
                            cy="18"
                            r="16"
                            fill="none"
                            className="stroke-primary"
                            strokeWidth="2.5"
                            strokeDasharray="100"
                            initial={{ strokeDashoffset: 100 }}
                            animate={{ strokeDashoffset: 8 }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="absolute text-[36px] font-bold text-foreground tracking-[-0.04em]">92%</span>
                      </div>

                      {/* Stat row */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-muted rounded-[12px] p-4 text-center">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-[0.04em] block mb-1">Keywords Match</span>
                          <span className="text-[18px] font-bold text-foreground">12 Found</span>
                        </div>
                        <div className="bg-muted rounded-[12px] p-4 text-center">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-[0.04em] block mb-1">Gaps Found</span>
                          <span className="text-[18px] font-bold text-foreground">2 Missing</span>
                        </div>
                      </div>

                      {/* Tag chips */}
                      <div className="flex flex-wrap justify-center gap-2">
                        {["GraphQL", "REST API", "Docker", "Next.js", "Server Nodes"].map(tag => (
                          <span key={tag} className="text-[12px] bg-muted text-foreground px-3 py-1 rounded-full font-semibold tracking-[-0.01em]">
                            ✓ {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>
        </section>


        {/* SECTION 2.5: AI AGENT SHOWCASE */}
        <section className="pt-40 pb-28 relative overflow-hidden bg-gradient-to-b from-primary/10 via-primary/5 to-background">
          {/* Top Simple Wave Divider */}
          <div className="absolute top-0 left-0 w-full overflow-hidden leading-none z-0 rotate-180 -translate-y-px">
            <svg className="relative block w-full h-[60px] md:h-[120px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
              <path fill="currentColor" className="text-background" d="M0,192L48,208C96,224,192,256,288,256C384,256,480,224,576,202.7C672,181,768,171,864,181.3C960,192,1056,224,1152,229.3C1248,235,1344,213,1392,202.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[150px]"></div>

          <div className="container mx-auto px-4 max-w-5xl relative z-10">
            <div className="grid md:grid-cols-2 gap-16 items-center">

              {/* Interactive Stacked Cards Showcase — Replaces Bot.png */}
              <div className="relative w-full max-w-[420px] h-[450px] mx-auto md:order-last flex items-center justify-center perspective-[1200px]">
                {[
                  {
                    tag: "EMAIL DRAFTED",
                    title: "Application: UI Developer",
                    company: "Stripe",
                    time: "Just now",
                    icon: <Send className="w-5 h-5 text-primary" />
                  },
                  {
                    tag: "RESUME AUDIT",
                    title: "Match Score: 94%",
                    company: "Airbnb",
                    time: "2 mins ago",
                    icon: <Layers className="w-5 h-5 text-indigo-500" />
                  },
                  {
                    tag: "AUTO-APPLY",
                    title: "Frontend Lead",
                    company: "Vercel",
                    time: "15 mins ago",
                    icon: <Bot className="w-5 h-5 text-emerald-500" />
                  }
                ].map((card, i) => {
                  const offset = (i - activeStackCard + 3) % 3;
                  // offset 0 is front, 1 is behind, 2 is furthest back.

                  return (
                    <motion.div
                      key={i}
                      className="absolute w-full h-[320px] rounded-3xl bg-card border border-border/50 p-8 flex flex-col justify-between shadow-2xl cursor-pointer overflow-hidden group"
                      animate={{
                        y: offset * 35,
                        scale: 1 - offset * 0.05,
                        opacity: 1 - offset * 0.15,
                        zIndex: 3 - offset,
                        rotateX: offset * 2
                      }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                      onClick={() => setActiveStackCard(i)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
                            {card.tag}
                          </span>
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center border border-border/50 shadow-sm">
                            {card.icon}
                          </div>
                        </div>

                        <h4 className="text-2xl font-bold text-foreground mb-2">{card.title}</h4>
                        <p className="text-muted-foreground font-medium">{card.company}</p>
                      </div>

                      <div className="relative z-10 flex items-center gap-2 pt-6 border-t border-border/40 mt-auto">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{card.time}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Simple text describing what the AI agent does */}
              <div className="space-y-8 md:order-first">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3 block">Your AI Agent</span>
                  <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                    It Works While You Sleep
                  </h2>
                  <p className="text-muted-foreground text-sm leading-relaxed mt-4">
                    Your dedicated AI agent handles everything — from scanning jobs to landing in recruiter inboxes. Fully automated.
                  </p>
                </div>

                <div className="relative space-y-6 py-2">
                  {/* Vertical connecting line */}
                  <div className="absolute left-[11px] top-5 bottom-5 w-px bg-border/70 z-0"></div>

                  {[
                    { text: "Email Outreach Automation" },
                    { text: "ATS Resume Scoring & Fixes" },
                    { text: "Smart Job Matching" },
                    { text: "Cover Letter Generation" },
                    { text: "24/7 Background Processing" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-5 group relative z-10">
                      {/* Sleek Timeline Dot */}
                      <div className="w-[23px] h-[23px] rounded-full bg-background border-2 border-border/80 flex items-center justify-center group-hover:border-foreground transition-colors shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-border group-hover:bg-foreground transition-colors"></div>
                      </div>
                      <span className="text-base font-semibold text-muted-foreground group-hover:text-foreground transition-colors">{item.text}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setWaitlistSubmitted(false);
                    setWaitlistEmail("");
                    setIsComingSoonOpen(true);
                  }}
                  className={buttonVariants({ className: "rounded-xl font-bold shadow-none hover:shadow-none" })}
                >
                  Get Started Free <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        </section>


        {/* SECTION 3: SIMPLE WORKFLOW EXPLAINER */}
        <section id="explainer-section" className="py-24 relative overflow-hidden bg-background" itemScope itemType="https://schema.org/HowTo">
          <div className="absolute -top-40 right-10 -z-10 w-[450px] h-[450px] bg-primary/5 rounded-full blur-[120px]"></div>

          <div className="container mx-auto px-4 max-w-6xl relative z-10">
            <div className="text-center mb-20">
              <span className="inline-block py-1.5 px-4 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-5">Workflow</span>
              <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight drop-shadow-sm" itemProp="name">How It Works</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg font-medium leading-relaxed" itemProp="description">
                Just type in 'Workday' for example and see all the times you have spent manually re-entering your resume. Then type 'Interview Scheduled', realise there's no such emails. Look yourself in the mirror, stop applying manually and let ApplyFlow do it for you.
              </p>
            </div>

            {/* Structured CSS Grid Bento Box */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-6xl mx-auto mt-12 p-6 md:p-8 bg-[#0a0f1c] rounded-[2.5rem] border border-slate-800 shadow-2xl">

              {/* Left Column (Span 4) */}
              <div className="col-span-1 md:col-span-4 flex flex-col gap-6">
                {/* Top Left Widget: ATS Scanner */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="flex-1 p-6 rounded-3xl bg-[#111827] border border-slate-800 shadow-xl flex flex-col items-start justify-center gap-4"
                >
                  <h3 className="text-white font-bold text-sm">ATS Scanner</h3>
                  <div className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span className="text-slate-300 text-xs font-semibold">Keyword Found</span>
                  </div>
                </motion.div>

                {/* Bottom Left Widget: Company Stripe */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex-1 p-6 rounded-3xl bg-[#111827] border border-slate-800 shadow-xl flex items-center justify-between gap-6"
                >
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Company</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-xl">Stripe</span>
                      <span className="text-emerald-500 font-bold text-lg">98%</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <Layers className="w-5 h-5 text-emerald-500" />
                  </div>
                </motion.div>
              </div>

              {/* Center Main Widget: Automation Pipelines (Span 8) */}
              <div className="col-span-1 md:col-span-8 flex flex-col gap-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="h-[280px] md:h-full p-8 rounded-3xl bg-gradient-to-br from-[#111827] to-[#0d131f] border border-slate-800 shadow-[0_20px_60px_rgba(0,0,0,0.6)] flex flex-col items-center justify-center"
                >
                  <h3 className="text-white font-bold text-2xl mb-10 text-center">Automation Pipelines</h3>
                  <div className="flex items-center justify-center gap-4 md:gap-8 w-full max-w-lg">
                    <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-2xl bg-slate-800/40 flex items-center justify-center border border-slate-700/50"><FileText className="w-8 h-8 text-slate-400" /></div>
                    <div className="h-[2px] flex-1 bg-slate-800 relative min-w-[20px] max-w-[80px]"><div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-slate-600"></div></div>
                    <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-2xl bg-slate-800/40 flex items-center justify-center border border-slate-700/50"><Bot className="w-8 h-8 text-slate-400" /></div>
                    <div className="h-[2px] flex-1 bg-slate-800 relative min-w-[20px] max-w-[80px]"><div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div></div>
                    <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-[1.5rem] bg-blue-600/10 border-2 border-blue-500/30 flex items-center justify-center shadow-[0_0_25px_rgba(59,130,246,0.15)]"><Send className="w-10 h-10 text-blue-500" /></div>
                  </div>
                </motion.div>
              </div>

              {/* Bottom Row (Span 12 split into 3x4) */}
              <div className="col-span-1 md:col-span-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="h-full p-6 rounded-3xl bg-[#111827] border border-slate-800 shadow-xl flex items-center justify-between gap-4"
                >
                  <div className="w-14 h-14 rounded-2xl bg-slate-800/50 flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-slate-400" />
                  </div>
                  <h3 className="text-white font-bold text-sm text-right">Auto-Apply<br /><span className="text-muted-foreground text-xs font-normal">Enabled</span></h3>
                </motion.div>
              </div>

              <div className="col-span-1 md:col-span-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="h-full p-6 rounded-3xl bg-[#111827] border border-slate-800 shadow-xl flex items-center justify-between gap-4"
                >
                  <h3 className="text-white font-bold text-sm">Email Drafter<br /><span className="text-blue-400 text-xs font-normal">AI Powered</span></h3>
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-blue-500" />
                  </div>
                </motion.div>
              </div>

              <div className="col-span-1 md:col-span-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="h-full p-6 rounded-3xl bg-[#111827] border border-slate-800 shadow-xl flex flex-col justify-center gap-4"
                >
                  <h3 className="text-white font-bold text-sm mb-1">Track Progress</h3>
                  <div className="w-full mt-auto">
                    <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden mb-2">
                      <div className="h-full w-[65%] bg-blue-600 rounded-full"></div>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold uppercase">
                      <span className="text-slate-500">Applied</span>
                      <span className="text-blue-500">Interviewing</span>
                    </div>
                  </div>
                </motion.div>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 4: ANALYTICS SHOWCASE */}
        <section id="analytics-showcase" className="pt-24 pb-0 relative overflow-hidden bg-background border-t border-border/40" itemScope itemType="https://schema.org/SoftwareApplication">
          <meta itemProp="name" content="ApplyFlow Pipeline Analytics" />
          <meta itemProp="applicationCategory" content="BusinessApplication" />
          <div className="container mx-auto px-4 max-w-6xl relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-center gap-12 lg:gap-24 relative w-full">

              {/* The Dashboard Mockup */}
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="flex-none relative z-10 w-full max-w-[500px] md:ml-12 flex justify-center"
              >
                <div className="bg-card rounded-t-[3rem] border-[10px] border-b-0 border-border shadow-2xl overflow-hidden h-[650px] w-full relative flex flex-col">
                  {/* Dashboard Header */}
                  <div className="px-6 py-5 border-b border-border/50 flex items-center justify-between">
                    <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                    <h3 className="text-foreground font-bold tracking-wide text-sm">Pipeline Health</h3>
                    <Maximize2 className="w-4 h-4 text-muted-foreground" />
                  </div>

                  {/* Dashboard Content */}
                  <div className="p-8 flex-1 flex flex-col relative">
                    <h4 className="text-foreground text-2xl font-bold mb-1">Momentum High</h4>
                    <p className="text-muted-foreground text-base mb-8">You are converting 12% above average this month.</p>

                    {/* Chart lines simulation */}
                    <div className="absolute left-6 bottom-10 right-6 top-32">
                      <motion.svg
                        initial={{ pathLength: 0, opacity: 0 }}
                        whileInView={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
                        className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none"
                      >
                        <motion.path initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.5 }} d="M0,80 Q25,20 50,50 T100,10" fill="none" stroke="#10b981" strokeWidth="2.5" />
                        <motion.path initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.7 }} d="M0,60 Q25,80 50,40 T100,30" fill="none" stroke="#ef4444" strokeWidth="2.5" />
                        <motion.path initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.9 }} d="M0,90 Q25,95 50,85 T100,70" fill="none" stroke="#3b82f6" strokeWidth="2.5" />
                      </motion.svg>

                      {/* Vertical line marker */}
                      <motion.div
                        initial={{ height: 0 }}
                        whileInView={{ height: "100%" }}
                        transition={{ duration: 0.8, delay: 1.0 }}
                        className="absolute right-[35%] top-0 w-px bg-border z-0"
                      ></motion.div>

                      {/* Tooltips */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 1.2 }}
                        className="absolute right-[20%] top-[10%] z-10"
                      >
                        <div className="bg-emerald-500 text-primary-foreground text-[10px] font-bold px-3 py-0.5 rounded-t-lg text-center uppercase tracking-wider">Interviews</div>
                        <div className="bg-background border border-emerald-500 text-emerald-500 font-black px-3 py-1.5 rounded-b-lg text-base text-center shadow-md">+ 12</div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 1.4 }}
                        className="absolute right-[20%] top-[40%] z-10"
                      >
                        <div className="bg-red-500 text-primary-foreground text-[10px] font-bold px-3 py-0.5 rounded-t-lg text-center uppercase tracking-wider">Rejections</div>
                        <div className="bg-background border border-red-500 text-red-500 font-black px-3 py-1.5 rounded-b-lg text-base text-center shadow-md">- 3</div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 1.6 }}
                        className="absolute right-[20%] bottom-[10%] z-10"
                      >
                        <div className="bg-blue-500 text-primary-foreground text-[10px] font-bold px-3 py-0.5 rounded-t-lg text-center uppercase tracking-wider">Applied</div>
                        <div className="bg-background border border-blue-500 text-blue-500 font-black px-3 py-1.5 rounded-b-lg text-base text-center shadow-md">145</div>
                      </motion.div>
                    </div>

                    {/* Bottom Nav Simulation */}
                    <div className="mt-auto flex justify-between text-muted-foreground text-sm font-semibold px-4 pb-4">
                      <span>Mar</span>
                      <span>Apr</span>
                      <span className="text-foreground">May</span>
                      <span>Jun</span>
                      <span>Jul</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right Column Text Block (Replacing Feature Points) */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="flex-1 max-w-[500px] space-y-8"
              >
                <div className="w-16 h-16 rounded-[1.2rem] bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center border-4 border-background shadow-xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-grid-white/[0.2] [mask-image:linear-gradient(to_bottom,transparent,black)]"></div>
                  <span className="text-3xl font-black text-white relative z-10 tracking-tighter">AF</span>
                </div>

                <h2 className="text-6xl lg:text-[5.5rem] font-black text-slate-800 dark:text-white tracking-tighter leading-[0.95]">
                  Analyze &<br />Optimize.
                </h2>

                <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  Understand your application health without drowning in spreadsheets. Each resume scan, each email draft and each interview request gives real actionable insights. Take decisions, backed by ApplyFlow.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* SECTION 2.75: CORE FEATURES GRID */}
        <section className="py-24 relative overflow-hidden bg-white">
          <div className="container mx-auto px-4 max-w-7xl relative z-10">

            {/* Section Header */}
            <div className="text-center mb-16 flex flex-col items-center">
              <span className="inline-block py-1.5 px-4 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[11px] font-bold uppercase tracking-[0.1em] mb-6 shadow-sm">
                Application Suite
              </span>
              <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-slate-900">
                Fast-Track Your Placement
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto text-base md:text-lg leading-relaxed font-medium">
                Stop wasting hours on repetitive cold forms. ApplyFlow is your 24/7 autonomous recruiter, powered by state-of-the-art AI.
              </p>
            </div>

            {/* 3-Column Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

              {/* Feature Card 1 */}
              <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 flex flex-col items-start hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 group shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-8 border border-slate-100/50">
                  <Sparkles className="w-7 h-7 text-blue-500 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-slate-900 text-[22px] font-bold mb-4 tracking-tight">AI-Powered Workflows</h3>
                <p className="text-slate-500 leading-relaxed font-medium mb-2 flex-1">
                  Generate complex automation pipelines just by typing a prompt. Our engine instantly maps out triggers and actions.
                </p>
              </div>

              {/* Feature Card 2 */}
              <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 flex flex-col items-start hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 group shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-8 border border-slate-100/50">
                  <FileText className="w-7 h-7 text-emerald-500 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-slate-900 text-[22px] font-bold mb-4 tracking-tight">Smart ATS Matching</h3>
                <p className="text-slate-500 leading-relaxed font-medium mb-2 flex-1">
                  Scan your resume against live requirements in real-time. Instantly spot missing structural keywords to rank higher.
                </p>
              </div>

              {/* Feature Card 3 */}
              <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 flex flex-col items-start hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 group shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-8 border border-slate-100/50">
                  <Send className="w-7 h-7 text-orange-500 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-slate-900 text-[22px] font-bold mb-4 tracking-tight">Autopilot Outreach</h3>
                <p className="text-slate-500 leading-relaxed font-medium mb-2 flex-1">
                  Select individual job contacts or drop standard spreadsheets to automatically deliver contextual email pitches.
                </p>
              </div>

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
                  name: "Jane Doe",
                  role: "Software Engineer",
                  image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
                  text: "ApplyFlow saved me 20 hours a week and helped me land 5 interviews!"
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
                    <Image src={t.image} alt={t.name} width={48} height={48} unoptimized className="w-12 h-12 rounded-full object-cover border-2 border-primary/20 shadow-sm" />
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
                <h3 className="text-2xl font-bold mb-2">Free</h3>
                <p className="text-muted-foreground text-sm mb-4">Perfect for getting started.</p>
                <div className="flex items-end gap-1 mb-6">
                  <span className="text-4xl font-black">$0</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-sm"><Check className="w-4 h-4 text-primary" /> 1 Active Workflow</li>
                  <li className="flex items-center gap-3 text-sm"><Check className="w-4 h-4 text-primary" /> Basic AI Generation</li>
                  <li className="flex items-center gap-3 text-sm"><Check className="w-4 h-4 text-primary" /> Community Support</li>
                </ul>
                <Link href="/signup" className={buttonVariants({ variant: "outline", className: "w-full rounded-xl" })}>Start Free</Link>
              </div>

              {/* Pro Plan */}
              <div className="bg-gradient-to-b from-primary/10 to-card border border-primary/30 rounded-3xl p-8 flex flex-col relative shadow-2xl">
                <div className="absolute top-0 right-8 -translate-y-1/2 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">Most Popular</div>
                <h3 className="text-2xl font-bold mb-2 text-primary">Pro</h3>
                <p className="text-muted-foreground text-sm mb-4">Perfect for getting started.</p>
                <div className="flex items-end gap-1 mb-6">
                  <span className="text-4xl font-black">$15</span>
                  <span className="text-muted-foreground text-sm mb-1">/ month</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-sm"><Check className="w-4 h-4 text-primary" /> Unlimited Workflows</li>
                  <li className="flex items-center gap-3 text-sm"><Check className="w-4 h-4 text-primary" /> Priority Support</li>

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

        {/* FAQ SECTION */}
        <section id="faq" className="py-24 bg-muted/10 border-y border-border/40 relative">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black mb-4">Frequently Asked Questions</h2>
              <p className="text-muted-foreground">Everything you need to know about ApplyFlow AI.</p>
            </div>
            <div className="max-w-3xl mx-auto border-t border-border/40 mt-8">
              {[
                { q: "Do I need to know how to code?", a: "No! Our visual builder and AI generator let you build workflows with plain text." },
                { q: "What email providers do you support?", a: "We natively support Gmail, Outlook, and custom IMAP/SMTP domains for seamless sending." },
                { q: "How many workflows can I build?", a: "Free users can build 1 active workflow, while Pro users have unlimited workflows and advanced AI generation capabilities." },
                { q: "Is my data secure?", a: "Absolutely. We use enterprise-grade encryption and never sell your data to third parties. Your email credentials are fully encrypted." }
              ].map((faq, i) => (
                <FAQItem key={i} question={faq.q} answer={faq.a} />
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
      <footer className="relative pt-24 pb-10 bg-muted/40 dark:bg-card mt-10">
        {/* Top Simple Wave Divider */}
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-none z-0 rotate-180 -translate-y-px">
          <svg className="relative block w-full h-[40px] md:h-[80px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="currentColor" className="text-background" d="M0,192L48,208C96,224,192,256,288,256C384,256,480,224,576,202.7C672,181,768,171,864,181.3C960,192,1056,224,1152,229.3C1248,235,1344,213,1392,202.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>

        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left relative z-10">
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
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
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
