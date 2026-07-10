"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Bot, FileText, LayoutList, AlertTriangle, CheckCircle2, Clock, Loader2, Plus, Minus, Lightbulb, GraduationCap, Briefcase, Wrench, Hash, TrendingUp, Zap, Target, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
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

  // Normalize any ATS result to ensure consistent field names and types
  const normalizeResult = (raw: any): ATSRecord => {
    if (!raw || typeof raw !== "object") {
      return { resumeId: "", jobDescription: "", matchPercent: 0, scoreBreakdown: { skills: 0, experience: 0, education: 0, keywords: 0 }, matchedKeywords: [], missingKeywords: [], weaknesses: [], recommendations: [], suggestions: [], createdAt: new Date().toISOString() };
    }

    const r = raw;

    // Extract score — try all known field names
    const matchPercent = Number(r.matchPercent ?? r.matchScore ?? r.score ?? r.overallScore ?? r.match_percent ?? r.overall) || 0;

    // Extract scoreBreakdown — ensure each value is a number
    const bd = r.scoreBreakdown || r.breakdown || r.scores || r.categoryScores || {};
    const toNum = (val: unknown) => (typeof val === "number" ? val : 0);
    const scoreBreakdown = {
      skills: toNum(bd.skills ?? bd.skillsScore ?? r.skillsScore),
      experience: toNum(bd.experience ?? bd.experienceScore ?? r.experienceScore),
      education: toNum(bd.education ?? bd.educationScore ?? r.educationScore),
      keywords: toNum(bd.keywordsScore ?? (typeof bd.keywords === "number" ? bd.keywords : undefined) ?? r.keywordsScore),
    };

    // Extract arrays — ensure they are arrays of strings
    const toArr = (val: unknown) => (Array.isArray(val) ? val : []);
    const matchedKeywords = toArr(r.matchedKeywords || r.matched_keywords || r.matchedSkills);
    const missingKeywords = toArr(r.missingKeywords || r.missing_keywords || r.missingSkills);

    return {
      id: r.id,
      resumeId: r.resumeId || "",
      jobDescription: r.jobDescription || jobDescription || "",
      matchPercent,
      scoreBreakdown,
      matchedKeywords,
      missingKeywords,
      feedback: r.feedback || r.summary || "",
      strengths: toArr(r.strengths || r.pros),
      weaknesses: toArr(r.weaknesses || r.cons),
      recommendations: toArr(r.recommendations || r.tips),
      suggestions: toArr(r.suggestions || r.improvements),
      createdAt: r.createdAt || r.created_at || new Date().toISOString(),
    };
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
      setPastAnalyses(arr.map((r: any) => normalizeResult(r)));
    } catch {
      // silently fail on history
    } finally {
      setIsLoadingHistory(false);
    }
  };

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
    fetchHistory();
  }, []);



  // Helper: deeply unwrap API response to find the actual result object
  const unwrapResponse = (response: any): any => {
    if (!response) return response;
    // Try common nesting patterns
    const candidates = [
      response?.data?.record,
      response?.record,
      response?.data?.analysis,
      response?.data?.result,
      response?.data?.data,
      response?.analysis,
      response?.result,
      response?.data,
      response,
    ];
    // Return the first candidate that looks like an ATS result (has matchPercent or matchScore or scoreBreakdown)
    for (const c of candidates) {
      if (c && typeof c === "object" && !Array.isArray(c)) {
        if ("matchPercent" in c || "matchScore" in c || "score" in c || "scoreBreakdown" in c || "matchedKeywords" in c) {
          return c;
        }
      }
    }
    // Fallback: return deepest .data
    return response?.data || response;
  };

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
      
      console.log("[ATS] Raw API response:", JSON.stringify(response, null, 2));

      const raw = unwrapResponse(response);
      const data = normalizeResult(raw);

      console.log("[ATS] Normalized result:", data);

      setResult(data);
      
      if (data && data.matchPercent > 0) {
        await fetchHistory(); // Refetch from backend to get the upserted record properly
      }
      toast.success("Analysis complete!");
    } catch (error) {
      console.error("[ATS] Analyze error:", error);
      toast.error("Failed to analyze resume.");
    } finally {
      setAnalyzing(false);
    }
  };

  // Load a past analysis — normalize it before displaying
  const viewPastResult = (record: ATSRecord) => {
    setResult(normalizeResult(record));
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return { text: "text-emerald-400", bg: "bg-emerald-500", ring: "stroke-emerald-400", hex: "#34d399", badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" };
    if (score >= 60) return { text: "text-amber-400", bg: "bg-amber-500", ring: "stroke-amber-400", hex: "#fbbf24", badge: "bg-amber-500/15 text-amber-400 border-amber-500/25" };
    return { text: "text-rose-400", bg: "bg-rose-500", ring: "stroke-rose-400", hex: "#fb7185", badge: "bg-rose-500/15 text-rose-400 border-rose-500/25" };
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Outstanding";
    if (score >= 80) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 60) return "Average";
    if (score >= 40) return "Needs Work";
    return "Poor";
  };

  // Chart data from scoreBreakdown
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
      { name: "Skills", score: result.scoreBreakdown.skills, color: "#60a5fa" },
      { name: "Experience", score: result.scoreBreakdown.experience, color: "#818cf8" },
      { name: "Education", score: result.scoreBreakdown.education, color: "#a78bfa" },
      { name: "Keywords", score: result.scoreBreakdown.keywords, color: "#c084fc" },
    ];
  };

  // ---------- RESULTS VIEW ----------
  if (result && !analyzing) {
    const colors = getScoreColor(result.matchPercent);
    const breakdown = result.scoreBreakdown;
    const categories = breakdown ? [
      { label: "Skills", value: breakdown.skills, icon: Wrench, color: "text-blue-400", barColor: "bg-blue-400" },
      { label: "Experience", value: breakdown.experience, icon: Briefcase, color: "text-indigo-400", barColor: "bg-indigo-400" },
      { label: "Education", value: breakdown.education, icon: GraduationCap, color: "text-violet-400", barColor: "bg-violet-400" },
      { label: "Keywords", value: breakdown.keywords, icon: Hash, color: "text-purple-400", barColor: "bg-purple-400" },
    ] : [];

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-6 pb-10 max-w-5xl mx-auto"
      >
        <Button variant="ghost" onClick={() => setResult(null)} className="text-muted-foreground hover:text-foreground -ml-2">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Analyzer
        </Button>

        {/* Score Overview */}
        <Card className="border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">

              {/* Score Ring */}
              <div className="flex flex-col items-center shrink-0">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" strokeWidth="4" fill="none" className="stroke-muted/15" />
                    <motion.circle
                      cx="50" cy="50" r="42"
                      strokeWidth="4"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray="263.9"
                      strokeDashoffset="263.9"
                      className={colors.ring}
                      animate={{ strokeDashoffset: 263.9 - (263.9 * (result.matchPercent / 100)) }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className={`text-5xl font-bold tracking-tight ${colors.text}`}>
                      {result.matchPercent}%
                    </span>
                    <span className="text-[11px] font-medium text-muted-foreground mt-1 uppercase tracking-wider">
                      {getScoreLabel(result.matchPercent)}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-3 max-w-[200px]">
                  Resume matches <span className="font-medium text-foreground">{result.matchPercent}%</span> of job requirements.
                </p>
              </div>

              {/* Charts */}
              {breakdown && (
                <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Radar */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Overview</p>
                    <div className="w-full h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={getRadarData()} cx="50%" cy="50%" outerRadius="72%">
                          <PolarGrid stroke="var(--border)" strokeOpacity={0.4} />
                          <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                          />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                          <Radar
                            dataKey="value"
                            stroke={colors.hex}
                            fill={colors.hex}
                            fillOpacity={0.15}
                            strokeWidth={2}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Bar */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Scores</p>
                    <div className="w-full h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getBarData()} layout="vertical" margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
                          <XAxis type="number" domain={[0, 100]} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} axisLine={false} tickLine={false} />
                          <YAxis dataKey="name" type="category" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} width={72} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "var(--card)",
                              border: "1px solid var(--border)",
                              borderRadius: "8px",
                              fontSize: 12,
                            }}
                            formatter={((value: unknown) => [`${value ?? 0}%`, "Score"]) as never}
                          />
                          <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={16}>
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

            {/* Category Bars */}
            {breakdown && (
              <div className="mt-6 pt-6 border-t border-border/30 grid grid-cols-2 md:grid-cols-4 gap-5">
                {categories.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + idx * 0.08 }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                      <span className="text-sm font-semibold">{item.value}%</span>
                    </div>
                    <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.value}%` }}
                        transition={{ duration: 0.8, delay: 0.3 + idx * 0.08 }}
                        className={`h-full ${item.barColor} rounded-full`}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Keywords */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-border/50 bg-card/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Matched Keywords
                </span>
                {result.matchedKeywords && result.matchedKeywords.length > 0 && (
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-none text-[10px]">{result.matchedKeywords.length}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {result.matchedKeywords?.map((kw: string) => (
                  <Badge key={kw} className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-none text-xs px-2 py-0.5">{kw}</Badge>
                ))}
                {(!result.matchedKeywords || result.matchedKeywords.length === 0) && (
                  <span className="text-xs text-muted-foreground">None found</span>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border/50 bg-card/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Missing Keywords
                </span>
                {result.missingKeywords && result.missingKeywords.length > 0 && (
                  <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-none text-[10px]">{result.missingKeywords.length}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {result.missingKeywords?.map((kw: string) => (
                  <Badge key={kw} className="bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-none text-xs px-2 py-0.5">{kw}</Badge>
                ))}
                {(!result.missingKeywords || result.missingKeywords.length === 0) && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> All keywords matched!</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Feedback */}
        <Card className="border-border/50 bg-card/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Detailed Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.strengths && result.strengths.length > 0 && (
                <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                  <h4 className="text-sm font-medium flex items-center gap-2 mb-3 text-emerald-400">
                    <Plus className="w-3.5 h-3.5" />
                    Strengths
                  </h4>
                  <ul className="space-y-2">
                    {result.strengths.map((str: string, i: number) => (
                      <li key={i} className="text-sm flex items-start gap-2 text-muted-foreground">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {result.weaknesses && result.weaknesses.length > 0 && (
                <div className="p-4 rounded-lg bg-rose-500/5 border border-rose-500/10">
                  <h4 className="text-sm font-medium flex items-center gap-2 mb-3 text-rose-400">
                    <Minus className="w-3.5 h-3.5" />
                    Weaknesses
                  </h4>
                  <ul className="space-y-2">
                    {result.weaknesses.map((wk: string, i: number) => (
                      <li key={i} className="text-sm flex items-start gap-2 text-muted-foreground">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" />
                        <span>{wk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.recommendations && result.recommendations.length > 0 && (
                <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/10">
                  <h4 className="text-sm font-medium flex items-center gap-2 mb-3 text-blue-400">
                    <Lightbulb className="w-3.5 h-3.5" />
                    Recommendations
                  </h4>
                  <ul className="space-y-2">
                    {result.recommendations.map((rec: string, i: number) => (
                      <li key={i} className="text-sm flex items-start gap-2 text-muted-foreground">
                        <ArrowRight className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.suggestions && result.suggestions.length > 0 && (
                <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/10">
                  <h4 className="text-sm font-medium flex items-center gap-2 mb-3 text-amber-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    Suggestions
                  </h4>
                  <ul className="space-y-2">
                    {result.suggestions.map((sug: string, i: number) => (
                      <li key={i} className="text-sm flex items-start gap-2 text-muted-foreground">
                        <Zap className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                        <span>{sug}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* General Feedback Fallback */}
            {result.feedback && (!result.strengths?.length && !result.weaknesses?.length && !result.recommendations?.length) && (
              <div className="mt-4 p-4 rounded-lg bg-muted/20 border border-border/50">
                <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                  <Bot className="w-3.5 h-3.5 text-muted-foreground" />
                  Feedback
                </h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{result.feedback}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // ---------- INPUT VIEW ----------
  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6 pb-10"
    >
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">ATS Analyzer</h1>
        <p className="text-sm text-muted-foreground mt-1">Score your resume against a job description.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Column */}
        <div className="space-y-4">
          <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Select Resume</CardTitle>
            </CardHeader>
            <CardContent>
              {resumes.length === 0 ? (
                <div className="text-sm text-muted-foreground p-3 bg-amber-500/5 rounded-lg border border-amber-500/15 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <span>No resumes found. Upload one in the Resumes tab first.</span>
                </div>
              ) : (
                <Select value={selectedResumeId} onValueChange={(val) => val && setSelectedResumeId(val)}>
                  <SelectTrigger className="w-full h-10">
                    <SelectValue placeholder="Select a resume" />
                  </SelectTrigger>
                  <SelectContent>
                    {resumes.map(r => (
                      <SelectItem key={r.id} value={r.id || ""} className="cursor-pointer">
                        <span className="truncate">{r.name || "Unnamed Resume"}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Job Description</CardTitle>
              <CardDescription className="text-xs">Paste the full job description for accurate results.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea 
                placeholder="Paste the complete job description here..." 
                className="min-h-[260px] resize-y"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
              <Button 
                className="w-full mt-4 h-10" 
                onClick={handleAnalyze}
                disabled={analyzing || resumes.length === 0}
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Analyze Match
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div>
          {!analyzing && (
            <Card className="h-full border-border/50 bg-card/60 backdrop-blur-sm flex items-center justify-center min-h-[460px]">
              <div className="text-center p-8 max-w-sm">
                <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-5">
                  <Bot className="w-7 h-7 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Ready to Analyze</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Select a resume and paste a job description to get a detailed ATS match score with keyword analysis and actionable feedback.
                </p>
              </div>
            </Card>
          )}

          {analyzing && (
            <Card className="h-full border-border/50 bg-card/60 backdrop-blur-sm flex items-center justify-center min-h-[460px]">
              <div className="text-center flex flex-col items-center">
                <div className="relative w-20 h-20 mb-5">
                  <motion.div className="absolute inset-0 rounded-full border-2 border-muted/20" />
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  />
                  <Bot className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <h3 className="text-base font-semibold mb-1">Analyzing...</h3>
                <p className="text-sm text-muted-foreground">Scoring keywords, experience, and skills.</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Past Analyses */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Past Analyses</h2>
          {isLoadingHistory && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
        </div>

        {!isLoadingHistory && pastAnalyses.length === 0 ? (
          <div className="text-center py-10 bg-card/60 rounded-xl border border-border/50">
            <p className="text-sm text-muted-foreground">No past analyses yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pastAnalyses.map((record, i) => {
              const recordId = record.id || String(i);
              const rColors = getScoreColor(record.matchPercent);
              return (
                <motion.div
                  key={recordId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                >
                  <Card 
                    className="border-border/50 bg-card/60 hover:border-border transition-colors cursor-pointer"
                    onClick={() => viewPastResult(record)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`text-sm font-bold ${rColors.text}`}>
                          {record.matchPercent}%
                        </div>
                        <span className="text-sm font-medium">
                          {getScoreLabel(record.matchPercent)}
                        </span>
                        <span className="text-[10px] text-muted-foreground ml-auto">
                          {record.createdAt ? new Date(record.createdAt).toLocaleDateString() : ""}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {record.jobDescription?.substring(0, 100)}...
                      </p>
                      {record.matchedKeywords && record.matchedKeywords.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {record.matchedKeywords.slice(0, 3).map(kw => (
                            <Badge key={kw} className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-none text-[10px] px-1.5 py-0">{kw}</Badge>
                          ))}
                          {record.matchedKeywords.length > 3 && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border/50">+{record.matchedKeywords.length - 3}</Badge>
                          )}
                        </div>
                      )}
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
