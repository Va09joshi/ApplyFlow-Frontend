"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Bot, FileText, LayoutList, RefreshCcw, AlertTriangle, CheckCircle2, Clock, Loader2, Plus, Minus, Lightbulb, GraduationCap, Briefcase, Wrench, Hash, TrendingUp, Zap, Target, ShieldCheck, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import * as motion from "framer-motion/client";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { atsService, ATSRecord } from "@/services/ats.service";
import { resumeService, Resume } from "@/services/resume.service";
import { toast } from "sonner";

export default function ATSAnalyzerPage() {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ATSRecord | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [pastAnalyses, setPastAnalyses] = useState<ATSRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [jobDescription, setJobDescription] = useState<string>("");

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
          setSelectedResumeId(resumesArray[0]._id || resumesArray[0].id || "");
        }
      } catch (error) {
        toast.error("Failed to load resumes");
      }
    };

    const fetchHistory = async () => {
      try {
        setIsLoadingHistory(true);
        const responseBody = await atsService.getAll();
        let arr: ATSRecord[] = [];
        if (Array.isArray(responseBody)) arr = responseBody;
        else if (responseBody?.data?.docs && Array.isArray(responseBody.data.docs)) arr = responseBody.data.docs;
        else if (responseBody?.data && Array.isArray(responseBody.data)) arr = responseBody.data;
        else if (responseBody?.docs && Array.isArray(responseBody.docs)) arr = responseBody.docs;
        setPastAnalyses(arr);
      } catch {
        // silently fail on history
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchResumes();
    fetchHistory();
  }, []);

  const handleAnalyze = async () => {
    if (!selectedResumeId) {
      toast.error("Please select a resume first.");
      return;
    }
    if (!jobDescription.trim()) {
      toast.error("Please provide a job description.");
      return;
    }

    try {
      setAnalyzing(true);
      setResult(null);
      
      const response = await atsService.analyze({
        resumeId: selectedResumeId,
        jobDescription
      });
      
      const data = response?.data || response;
      setResult(data);
      
      if (data) {
        setPastAnalyses(prev => [data, ...prev]);
      }
      toast.success("Analysis complete!");
    } catch (error) {
      toast.error("Failed to analyze resume.");
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return "from-emerald-400 to-green-500";
    if (score >= 60) return "from-amber-400 to-yellow-500";
    return "from-rose-400 to-red-500";
  };

  const getScoreStroke = (score: number) => {
    if (score >= 80) return "stroke-emerald-500";
    if (score >= 60) return "stroke-amber-500";
    return "stroke-rose-500";
  };

  const getScoreText = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-amber-500";
    return "text-rose-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Outstanding";
    if (score >= 80) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 60) return "Average";
    if (score >= 40) return "Needs Work";
    return "Poor";
  };

  const getScoreBgCard = (score: number) => {
    if (score >= 80) return "from-emerald-500/5 to-green-500/10";
    if (score >= 60) return "from-amber-500/5 to-yellow-500/10";
    return "from-rose-500/5 to-red-500/10";
  };

  const getScoreHex = (score: number) => {
    if (score >= 80) return "#10b981";
    if (score >= 60) return "#f59e0b";
    return "#ef4444";
  };

  // Build chart data from scoreBreakdown
  const getRadarData = () => {
    if (!result?.scoreBreakdown) return [];
    return [
      { subject: "Skills", value: result.scoreBreakdown.skills, fullMark: 100 },
      { subject: "Experience", value: result.scoreBreakdown.experience, fullMark: 100 },
      { subject: "Education", value: result.scoreBreakdown.education, fullMark: 100 },
      { subject: "Keywords", value: result.scoreBreakdown.keywords, fullMark: 100 },
    ];
  };

  const getBarData = () => {
    if (!result?.scoreBreakdown) return [];
    return [
      { name: "Skills", score: result.scoreBreakdown.skills, color: "#3b82f6" },
      { name: "Experience", score: result.scoreBreakdown.experience, color: "#6366f1" },
      { name: "Education", score: result.scoreBreakdown.education, color: "#8b5cf6" },
      { name: "Keywords", score: result.scoreBreakdown.keywords, color: "#a855f7" },
    ];
  };

  const selectedResumeName = resumes.find(r => (r._id || r.id) === selectedResumeId)?.name || "Select a resume";

  // ---------- RESULTS VIEW (Full-width centered) ----------
  if (result && !analyzing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-8 pb-10 max-w-5xl mx-auto"
      >
        {/* Back Button */}
        <Button variant="ghost" onClick={() => setResult(null)} className="text-muted-foreground hover:text-foreground -ml-2">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Analyzer
        </Button>

        {/* Score Hero */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className={`border-border/40 bg-gradient-to-br ${getScoreBgCard(result.matchPercent)} backdrop-blur-sm overflow-hidden relative shadow-sm`}>
            <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${getScoreGradient(result.matchPercent)}`} />
            <CardContent className="py-10 px-8">
              <div className="flex flex-col lg:flex-row items-center gap-10">
                {/* Left: Score Ring */}
                <div className="flex flex-col items-center">
                  <div className="relative w-52 h-52 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" strokeWidth="5" fill="none" className="stroke-muted/20" />
                      <motion.circle
                        cx="50" cy="50" r="42"
                        strokeWidth="5"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray="263.9"
                        strokeDashoffset="263.9"
                        className={getScoreStroke(result.matchPercent)}
                        animate={{ strokeDashoffset: 263.9 - (263.9 * (result.matchPercent / 100)) }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className={`text-6xl font-extrabold tracking-tighter ${getScoreText(result.matchPercent)}`}>
                        {result.matchPercent}%
                      </span>
                      <span className="text-xs font-semibold text-muted-foreground mt-1 uppercase tracking-widest">
                        {getScoreLabel(result.matchPercent)}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground text-center mt-3 max-w-[220px]">
                    Your resume matches <span className="font-semibold text-foreground">{result.matchPercent}%</span> of the job requirements.
                  </p>
                </div>

                {/* Right: Charts */}
                {result.scoreBreakdown && (
                  <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Radar Chart */}
                    <div className="flex flex-col items-center">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Radar Overview</h4>
                      <div className="w-full h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={getRadarData()} cx="50%" cy="50%" outerRadius="75%">
                            <PolarGrid stroke="hsl(var(--border))" strokeOpacity={0.5} />
                            <PolarAngleAxis
                              dataKey="subject"
                              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: 500 }}
                            />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar
                              name="Score"
                              dataKey="value"
                              stroke={getScoreHex(result.matchPercent)}
                              fill={getScoreHex(result.matchPercent)}
                              fillOpacity={0.2}
                              strokeWidth={2}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Bar Chart */}
                    <div className="flex flex-col items-center">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Category Scores</h4>
                      <div className="w-full h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={getBarData()} layout="vertical" margin={{ left: 5, right: 20, top: 5, bottom: 5 }}>
                            <XAxis type="number" domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis dataKey="name" type="category" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} width={75} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "12px",
                                fontSize: 12,
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                              }}
                              formatter={((value: unknown) => [`${value ?? 0}%`, "Score"]) as never}
                            />
                            <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={18}>
                              {getBarData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Score Progress Bars (below the main hero) */}
              {result.scoreBreakdown && (
                <div className="mt-8 pt-6 border-t border-border/30">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                      { label: "Skills", value: result.scoreBreakdown.skills, icon: Wrench, color: "bg-blue-500", iconColor: "text-blue-500", bgColor: "bg-blue-500/10" },
                      { label: "Experience", value: result.scoreBreakdown.experience, icon: Briefcase, color: "bg-indigo-500", iconColor: "text-indigo-500", bgColor: "bg-indigo-500/10" },
                      { label: "Education", value: result.scoreBreakdown.education, icon: GraduationCap, color: "bg-violet-500", iconColor: "text-violet-500", bgColor: "bg-violet-500/10" },
                      { label: "Keywords", value: result.scoreBreakdown.keywords, icon: Hash, color: "bg-purple-500", iconColor: "text-purple-500", bgColor: "bg-purple-500/10" },
                    ].map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + idx * 0.1 }}
                        className="text-center"
                      >
                        <div className={`w-10 h-10 rounded-xl ${item.bgColor} flex items-center justify-center mx-auto mb-2`}>
                          <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                        </div>
                        <p className="text-2xl font-bold">{item.value}%</p>
                        <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
                        <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden mt-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.value}%` }}
                            transition={{ duration: 1, delay: 0.4 + idx * 0.1 }}
                            className={`h-full ${item.color} rounded-full`}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Keywords Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          <Card className="border-border/40 bg-card/60 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-green-500" />
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                Matched Keywords
                {result.matchedKeywords && result.matchedKeywords.length > 0 && (
                  <Badge className="ml-auto bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 shadow-none text-[10px]">{result.matchedKeywords.length} found</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {result.matchedKeywords?.map((kw: string) => (
                  <Badge key={kw} className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 shadow-none text-xs font-medium px-2.5 py-1">{kw}</Badge>
                ))}
                {(!result.matchedKeywords || result.matchedKeywords.length === 0) && (
                  <span className="text-xs text-muted-foreground">None found</span>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border/40 bg-card/60 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                </div>
                Missing Keywords
                {result.missingKeywords && result.missingKeywords.length > 0 && (
                  <Badge className="ml-auto bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 shadow-none text-[10px]">{result.missingKeywords.length} missing</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {result.missingKeywords?.map((kw: string) => (
                  <Badge key={kw} className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20 shadow-none text-xs font-medium px-2.5 py-1">{kw}</Badge>
                ))}
                {(!result.missingKeywords || result.missingKeywords.length === 0) && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> All keywords matched!</span>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Detailed Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-border/40 bg-card/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-indigo-500" />
                </div>
                Detailed Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Strengths */}
                {result.strengths && result.strengths.length > 0 && (
                  <div className="p-5 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                    <h4 className="text-sm font-semibold flex items-center gap-2 mb-4 text-emerald-600 dark:text-emerald-400">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                        <Plus className="w-4 h-4" />
                      </div>
                      Strengths
                      <Badge className="ml-auto bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 shadow-none text-[10px]">{result.strengths.length}</Badge>
                    </h4>
                    <ul className="space-y-2.5">
                      {result.strengths.map((str: string, i: number) => (
                        <li key={i} className="text-sm flex items-start gap-2.5 text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                          <span className="leading-relaxed">{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Weaknesses */}
                {result.weaknesses && result.weaknesses.length > 0 && (
                  <div className="p-5 rounded-xl bg-rose-500/5 border border-rose-500/15">
                    <h4 className="text-sm font-semibold flex items-center gap-2 mb-4 text-rose-600 dark:text-rose-400">
                      <div className="w-7 h-7 rounded-lg bg-rose-500/15 flex items-center justify-center">
                        <Minus className="w-4 h-4" />
                      </div>
                      Weaknesses
                      <Badge className="ml-auto bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 shadow-none text-[10px]">{result.weaknesses.length}</Badge>
                    </h4>
                    <ul className="space-y-2.5">
                      {result.weaknesses.map((wk: string, i: number) => (
                        <li key={i} className="text-sm flex items-start gap-2.5 text-muted-foreground">
                          <AlertTriangle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                          <span className="leading-relaxed">{wk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                {result.recommendations && result.recommendations.length > 0 && (
                  <div className="p-5 rounded-xl bg-blue-500/5 border border-blue-500/15">
                    <h4 className="text-sm font-semibold flex items-center gap-2 mb-4 text-blue-600 dark:text-blue-400">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center">
                        <Lightbulb className="w-4 h-4" />
                      </div>
                      Recommendations
                      <Badge className="ml-auto bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 shadow-none text-[10px]">{result.recommendations.length}</Badge>
                    </h4>
                    <ul className="space-y-2.5">
                      {result.recommendations.map((rec: string, i: number) => (
                        <li key={i} className="text-sm flex items-start gap-2.5 text-muted-foreground">
                          <ArrowRight className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                          <span className="leading-relaxed">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggestions */}
                {result.suggestions && result.suggestions.length > 0 && (
                  <div className="p-5 rounded-xl bg-amber-500/5 border border-amber-500/15">
                    <h4 className="text-sm font-semibold flex items-center gap-2 mb-4 text-amber-600 dark:text-amber-400">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center">
                        <Zap className="w-4 h-4" />
                      </div>
                      Suggestions
                      <Badge className="ml-auto bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 shadow-none text-[10px]">{result.suggestions.length}</Badge>
                    </h4>
                    <ul className="space-y-2.5">
                      {result.suggestions.map((sug: string, i: number) => (
                        <li key={i} className="text-sm flex items-start gap-2.5 text-muted-foreground">
                          <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                          <span className="leading-relaxed">{sug}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* General Feedback Fallback */}
              {result.feedback && (!result.strengths?.length && !result.weaknesses?.length && !result.recommendations?.length) && (
                <div className="mt-5 p-5 rounded-xl bg-violet-500/5 border border-violet-500/15">
                  <h4 className="text-sm font-semibold flex items-center gap-2 mb-3 text-violet-600 dark:text-violet-400">
                    <div className="w-7 h-7 rounded-lg bg-violet-500/15 flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    AI Analysis Feedback
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {result.feedback}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  }

  // ---------- INPUT VIEW (Default) ----------
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 pb-10"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Target className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">ATS Analyzer</h1>
          </div>
          <p className="text-muted-foreground ml-[52px]">Score your resume against job descriptions to bypass the ATS.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Column */}
        <div className="space-y-5">
          <Card className="border-border/40 bg-card/60 backdrop-blur-sm shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500" />
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-violet-500" />
                </div>
                Select Resume
              </CardTitle>
            </CardHeader>
            <CardContent>
              {resumes.length === 0 ? (
                <div className="text-sm text-muted-foreground p-4 bg-amber-500/5 rounded-xl border border-amber-500/20 flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>No resumes found. Please upload one first in the Resumes tab.</span>
                </div>
              ) : (
                <Select value={selectedResumeId} onValueChange={(val) => val && setSelectedResumeId(val)}>
                  <SelectTrigger className="w-full text-left h-11 bg-background/60">
                    <SelectValue placeholder="Select a resume" />
                  </SelectTrigger>
                  <SelectContent>
                    {resumes.map(r => (
                      <SelectItem key={r._id || r.id} value={r._id || r.id || ""} className="cursor-pointer">
                        <div className="flex items-center gap-2 truncate max-w-[200px] sm:max-w-[400px]">
                          <FileText className="w-4 h-4 text-violet-500 shrink-0" />
                          <span className="truncate" title={r.name || "Unnamed Resume"}>
                            {r.name || "Unnamed Resume"}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/60 backdrop-blur-sm shadow-sm flex-1 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500" />
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <LayoutList className="w-4 h-4 text-blue-500" />
                </div>
                Job Description
              </CardTitle>
              <CardDescription className="text-xs">Paste the full job description to get accurate matching results.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea 
                placeholder="Paste the complete job description here..." 
                className="min-h-[280px] resize-y bg-background/50 border-border/50 focus:border-blue-500/50 transition-colors"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
              <Button 
                className="w-full mt-5 h-12 text-base bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/20 transition-all" 
                onClick={handleAnalyze}
                disabled={analyzing || resumes.length === 0}
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Analyze Match
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Empty State or Loading */}
        <div className="space-y-5">
          {!analyzing && (
            <Card className="h-full border-border/40 bg-card/60 backdrop-blur-sm flex items-center justify-center min-h-[500px] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/8 via-purple-500/4 to-pink-500/8 z-0" />
              <div className="absolute -top-32 -right-32 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl" />
              
              <div className="text-center flex flex-col items-center z-10 p-8 max-w-md">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-violet-500 to-purple-600 flex items-center justify-center mb-6 shadow-xl shadow-violet-500/25 transform -rotate-6">
                  <Bot className="w-10 h-10 text-white transform rotate-6" />
                </div>
                <h3 className="text-2xl font-bold mb-3 tracking-tight">Unlock Your ATS Potential</h3>
                <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
                  Paste a job description and select your resume. Our AI will instantly analyze keywords, experience, and skills to generate a comprehensive match score.
                </p>
                <div className="grid grid-cols-2 gap-3 w-full text-left">
                  {[
                    { icon: Hash, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Keyword Analysis" },
                    { icon: ShieldCheck, color: "text-blue-500", bg: "bg-blue-500/10", label: "Actionable Feedback" },
                    { icon: Wrench, color: "text-amber-500", bg: "bg-amber-500/10", label: "Skill Validation" },
                    { icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-500/10", label: "Score Breakdown" },
                  ].map((item, idx) => (
                    <div key={idx} className="bg-card/70 backdrop-blur p-3.5 rounded-xl border border-border/40 flex items-center gap-2.5 shadow-sm hover:shadow-md transition-shadow">
                      <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center shrink-0`}>
                        <item.icon className={`w-4 h-4 ${item.color}`} />
                      </div>
                      <span className="text-xs font-medium">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {analyzing && (
            <Card className="h-full border-border/40 bg-card/60 backdrop-blur-sm flex items-center justify-center min-h-[500px] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/8 to-transparent z-0 animate-pulse" />
              <div className="text-center flex flex-col items-center z-10">
                <div className="relative w-28 h-28 mb-6">
                  <motion.div className="absolute inset-0 rounded-full border-4 border-violet-500/15" />
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-violet-500 border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  />
                  <motion.div
                    className="absolute inset-3 rounded-full border-4 border-purple-400 border-b-transparent opacity-60"
                    animate={{ rotate: -360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  />
                  <Bot className="w-8 h-8 text-violet-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold mb-2">Analyzing Your Resume...</h3>
                <p className="text-muted-foreground text-sm max-w-xs">Extracting keywords, scoring experience, and compiling detailed feedback.</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Past Analyses History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-indigo-500" />
            </div>
            <h2 className="text-lg font-semibold">Past Analyses</h2>
          </div>
          {isLoadingHistory && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
        </div>

        {!isLoadingHistory && pastAnalyses.length === 0 ? (
          <div className="text-center py-12 bg-card/60 rounded-xl border border-border/40">
            <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Bot className="w-7 h-7 text-muted-foreground opacity-50" />
            </div>
            <p className="text-sm text-muted-foreground">No past analyses yet. Run your first scan above!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pastAnalyses.map((record, i) => {
              const recordId = record._id || record.id || String(i);
              return (
                <motion.div
                  key={recordId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <Card 
                    className="border-border/40 bg-card/60 hover:border-primary/30 hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden"
                    onClick={() => setResult(record)}
                  >
                    <div className={`absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r ${getScoreGradient(record.matchPercent)}`} />
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${getScoreGradient(record.matchPercent)} flex items-center justify-center font-bold text-sm text-white shadow-sm`}>
                            {record.matchPercent}%
                          </div>
                          <div>
                            <p className="text-sm font-semibold leading-tight">
                              {getScoreLabel(record.matchPercent)} Match
                            </p>
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Clock className="w-2.5 h-2.5" />
                              {record.createdAt ? new Date(record.createdAt).toLocaleDateString() : "Unknown"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {record.jobDescription?.substring(0, 120)}...
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {record.matchedKeywords?.slice(0, 3).map(kw => (
                          <Badge key={kw} className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 shadow-none text-[10px] px-1.5 py-0">{kw}</Badge>
                        ))}
                        {record.matchedKeywords && record.matchedKeywords.length > 3 && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border/50">+{record.matchedKeywords.length - 3}</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
