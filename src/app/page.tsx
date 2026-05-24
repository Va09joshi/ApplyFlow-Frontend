import { Navbar } from "@/components/layout/Navbar";
import { Button, buttonVariants } from "@/components/ui/button";
import { ArrowRight, Bot, Sparkles, Zap, Shield, ChevronRight, CheckCircle2, Briefcase } from "lucide-react";
import Link from "next/link";
import * as motion from "framer-motion/client";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-24 pb-16 md:pt-36 md:pb-24 overflow-hidden">
          {/* Animated background gradients */}
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/15 via-background to-background"></div>
          <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] opacity-50 mix-blend-screen animate-pulse"></div>
          <div className="absolute bottom-0 left-0 -z-10 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] opacity-50 mix-blend-screen"></div>

          <div className="container mx-auto px-4 text-center z-10 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium mb-6 text-primary"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>ApplyFlow AI 2.0 is now live</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 max-w-4xl mx-auto leading-tight"
            >
              Your Job Search, on <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-blue-500">Autopilot.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Instantly find roles, bypass ATS filters with AI-tailored resumes, and send personalized emails to hiring managers. Land more interviews with zero effort.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              <Link 
                href="/signup"
                className={buttonVariants({ size: "default" }) + " w-full sm:w-auto rounded-full px-6 shadow-[0_0_20px_rgba(var(--primary),0.2)] hover:shadow-[0_0_30px_rgba(var(--primary),0.4)] transition-all"}
              >
                Start Free Trial <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
              <Link 
                href="/dashboard"
                className={buttonVariants({ variant: "outline", size: "default" }) + " w-full sm:w-auto rounded-full px-6 border-border/50 hover:bg-muted/50"}
              >
                View Demo <ChevronRight className="ml-2 w-4 h-4 text-muted-foreground" />
              </Link>
            </motion.div>
          </div>

          {/* Hero UI Showcase (Code-based) */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-16 container mx-auto px-4 max-w-6xl relative"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Main Dashboard Mockup */}
              <div className="md:col-span-8 relative rounded-2xl overflow-hidden border border-border/50 shadow-2xl bg-card/80 backdrop-blur-xl z-20 group h-[500px] flex flex-col">
                <div className="h-10 bg-muted/40 border-b border-border/50 flex items-center px-4 gap-2 shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]"></div>
                  <div className="ml-4 flex-1 flex justify-center">
                    <div className="h-5 w-48 bg-background/50 rounded-md border border-border/50 flex items-center px-2">
                      <span className="text-[10px] text-muted-foreground font-mono">applyflow.ai/dashboard</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 flex overflow-hidden">
                  {/* Mock Sidebar */}
                  <div className="w-48 border-r border-border/50 bg-muted/20 p-4 flex flex-col gap-2 shrink-0 hidden sm:flex">
                    <div className="flex items-center gap-2 mb-6">
                      <span className="font-bold text-sm tracking-tight">ApplyFlow <span className="text-primary">AI</span></span>
                    </div>
                    {["Overview", "Applications", "Resumes", "Automations"].map((item, i) => (
                      <div key={item} className={`h-8 rounded-md flex items-center px-2 text-xs font-medium ${i === 0 ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50"}`}>
                        {item}
                      </div>
                    ))}
                  </div>
                  
                  {/* Mock Main Content */}
                  <div className="flex-1 p-6 overflow-hidden flex flex-col gap-4">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <h3 className="font-bold text-lg">Overview</h3>
                        <p className="text-xs text-muted-foreground">Welcome back to your dashboard.</p>
                      </div>
                      <div className="h-8 w-24 bg-primary rounded-full flex items-center justify-center text-xs text-primary-foreground font-medium shadow-sm">
                        Apply Now
                      </div>
                    </div>
                    
                    {/* Mock Stats Cards */}
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: "Total Applications", value: "342", trend: "+12%" },
                        { label: "Interviews", value: "24", trend: "+3%" },
                        { label: "Response Rate", value: "7.2%", trend: "+1.1%" },
                      ].map((stat, i) => (
                        <div key={i} className="bg-background rounded-xl border border-border/50 p-4 shadow-sm">
                          <p className="text-[10px] text-muted-foreground font-medium mb-1">{stat.label}</p>
                          <div className="flex items-end justify-between">
                            <span className="text-xl font-bold">{stat.value}</span>
                            <span className="text-[10px] text-green-500 font-medium bg-green-500/10 px-1.5 py-0.5 rounded-sm">{stat.trend}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Mock Chart Area */}
                    <div className="flex-1 bg-background rounded-xl border border-border/50 p-4 shadow-sm relative overflow-hidden mt-2">
                      <p className="text-xs font-bold mb-4">Application Velocity</p>
                      <div className="absolute bottom-0 left-0 right-0 h-32 flex items-end gap-2 px-4 pb-4">
                        {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                          <motion.div 
                            key={i}
                            className="flex-1 bg-primary/20 rounded-t-sm relative group overflow-hidden"
                            initial={{ height: 0 }}
                            animate={{ height: `${height}%` }}
                            transition={{ duration: 1, delay: 0.5 + (i * 0.1), type: "spring" }}
                          >
                            <motion.div 
                              className="absolute bottom-0 w-full bg-primary"
                              initial={{ height: "0%" }}
                              animate={{ height: `${height * 0.7}%` }}
                              transition={{ duration: 1, delay: 0.8 + (i * 0.1) }}
                            />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stacked Side Mockups */}
              <div className="md:col-span-4 flex flex-col gap-6 z-10">
                {/* ATS Match Analyzer */}
                <motion.div 
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="relative rounded-2xl overflow-hidden border border-border/50 shadow-2xl bg-card/80 backdrop-blur-xl group"
                >
                  <div className="h-8 bg-muted/40 border-b border-border/50 flex items-center px-4">
                    <span className="text-[10px] text-muted-foreground font-mono">ATS Analyzer</span>
                  </div>
                  <div className="p-5 flex items-center gap-5">
                    <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
                        <path strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(var(--primary), 0.2)" strokeWidth="3" />
                        <motion.path 
                          strokeDasharray="92, 100" 
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                          fill="none" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth="3"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1.5, delay: 1 }}
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-sm font-bold text-primary">92%</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold mb-2">Resume Match Score</p>
                      <div className="flex flex-wrap gap-1.5">
                        {["React", "TypeScript", "Next.js", "Tailwind"].map((tech, i) => (
                          <span key={tech} className="text-[9px] bg-green-500/10 text-green-500 border border-green-500/20 px-1.5 py-0.5 rounded-sm">✓ {tech}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Email Automation */}
                <motion.div 
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="relative rounded-2xl overflow-hidden border border-border/50 shadow-2xl bg-card/80 backdrop-blur-xl group"
                >
                  <div className="h-8 bg-muted/40 border-b border-border/50 flex items-center justify-between px-4">
                    <span className="text-[10px] text-muted-foreground font-mono">New Message</span>
                    <Bot className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-2 border-b border-border/50 pb-2">
                      <span className="text-[10px] text-muted-foreground w-6">To:</span>
                      <div className="h-4 w-32 bg-background border border-border/50 rounded flex items-center px-1.5">
                        <span className="text-[10px]">hiring@stripe.com</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 border-b border-border/50 pb-2">
                      <span className="text-[10px] text-muted-foreground w-6">Sub:</span>
                      <div className="h-4 w-full bg-background border border-border/50 rounded flex items-center px-1.5">
                        <span className="text-[10px]">Application: Frontend Engineer</span>
                      </div>
                    </div>
                    <div className="bg-background border border-border/50 rounded-md p-2 h-24 relative overflow-hidden">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 1.5 }}
                      >
                        <p className="text-[9px] leading-relaxed font-mono text-muted-foreground">
                          Hi Team,<br/><br/>
                          I noticed the Frontend Engineer opening and noticed you use React & Tailwind. I recently built a heavily animated dashboard using...
                        </p>
                      </motion.div>
                      <motion.div 
                        className="w-1.5 h-3 bg-primary inline-block absolute bottom-2"
                        animate={{ opacity: [1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                      />
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-muted/20 border-y border-border/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful tools to land your dream job</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Stop wasting hours manually applying. ApplyFlow acts as your personal AI recruiter, advocating for you 24/7.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                {
                  icon: <Bot className="w-6 h-6 text-primary" />,
                  title: "Beat the ATS System",
                  description: "Instantly score your resume against job descriptions. Our AI rewrites your bullets to perfectly match required keywords."
                },
                {
                  icon: <Zap className="w-6 h-6 text-blue-500" />,
                  title: "1-Click Applications",
                  description: "Apply to hundreds of roles automatically with tailored resumes and cover letters crafted specifically for each position."
                },
                {
                  icon: <Shield className="w-6 h-6 text-green-500" />,
                  title: "HR Email Outreach",
                  description: "Generate highly personalized cold emails for recruiters and hiring managers, drastically improving your interview rates."
                }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="p-6 rounded-3xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden"
                >
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing CTA */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="max-w-3xl mx-auto bg-card/80 backdrop-blur-xl rounded-[2.5rem] p-10 md:p-16 border border-border/50 shadow-xl">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Ready to get hired?</h2>
              <p className="text-muted-foreground mb-8">
                Join thousands of candidates landing interviews faster with ApplyFlow AI.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
                <div className="flex items-center justify-center gap-1.5 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> No credit card required
                </div>
                <div className="flex items-center justify-center gap-1.5 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> 14-day free trial
                </div>
              </div>

              <Link 
                href="/signup"
                className={buttonVariants({ size: "default" }) + " rounded-full px-8 shadow-[0_0_20px_rgba(var(--primary),0.2)]"}
              >
                Start Automating Free <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 bg-background">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tight">ApplyFlow <span className="text-primary">AI</span></span>
          </div>
          <p className="text-muted-foreground text-xs font-medium">
            © {new Date().getFullYear()} ApplyFlow AI. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs font-medium text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
