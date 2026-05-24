"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Bot, FileText, LayoutList, RefreshCcw, AlertTriangle, CheckCircle2, Clock, Loader2, Plus, Minus, Lightbulb, GraduationCap, Briefcase, Wrench, Hash } from "lucide-react";
import * as motion from "framer-motion/client";
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
      
      // Add to history
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
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
          <h1 className="text-3xl font-bold tracking-tight">ATS Analyzer</h1>
          <p className="text-muted-foreground">Score your resume against job descriptions to bypass the ATS.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Column */}
        <div className="space-y-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Select Resume
              </CardTitle>
            </CardHeader>
            <CardContent>
              {resumes.length === 0 ? (
                <div className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-md border border-border">
                  No resumes found. Please upload one first in the Resumes tab.
                </div>
              ) : (
                <Select value={selectedResumeId} onValueChange={(val) => val && setSelectedResumeId(val)}>
                  <SelectTrigger className="w-full text-left">
                    <SelectValue placeholder="Select a resume" />
                  </SelectTrigger>
                  <SelectContent>
                    {resumes.map(r => (
                      <SelectItem key={r._id || r.id} value={r._id || r.id || ""} className="cursor-pointer">
                        <div className="flex items-center gap-2 truncate max-w-[200px] sm:max-w-[400px]">
                          <FileText className="w-4 h-4 text-primary shrink-0" />
                          <span className="truncate" title={r.name}>{r.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm flex-1">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <LayoutList className="w-5 h-5 text-primary" />
                Job Description
              </CardTitle>
              <CardDescription>Paste the job description here to analyze match percentage.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea 
                placeholder="Paste job description here..." 
                className="min-h-[300px] resize-y bg-background/50"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
              <Button 
                className="w-full mt-6 h-12 text-base" 
                onClick={handleAnalyze}
                disabled={analyzing || resumes.length === 0}
              >
                {analyzing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  >
                    <RefreshCcw className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <>
                    <Bot className="w-5 h-5 mr-2" />
                    Analyze Match
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Column */}
        <div className="space-y-6">
          {!result && !analyzing && (
            <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm flex items-center justify-center min-h-[500px]">
              <div className="text-center text-muted-foreground flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Bot className="w-8 h-8 opacity-50" />
                </div>
                <p>Click &quot;Analyze Match&quot; to generate your ATS score and feedback.</p>
              </div>
            </Card>
          )}

          {analyzing && (
            <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm flex items-center justify-center min-h-[500px]">
              <div className="text-center flex flex-col items-center">
                <motion.div
                  className="w-24 h-24 rounded-full border-4 border-primary border-t-transparent mb-6"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                />
                <h3 className="text-xl font-bold animate-pulse">AI is scanning your resume...</h3>
                <p className="text-muted-foreground mt-2">Extracting keywords and calculating match score</p>
              </div>
            </Card>
          )}

          {result && !analyzing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-6 h-full"
            >
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden relative">
                <div className={`absolute top-0 left-0 w-full h-1 ${getScoreBg(result.matchPercent)}`}></div>
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-lg">Overall Match Score</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="relative w-48 h-48 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-muted" />
                      <motion.circle 
                        cx="50" cy="50" r="40" 
                        stroke="currentColor" 
                        strokeWidth="8" 
                        fill="none" 
                        strokeDasharray="251.2" 
                        strokeDashoffset="251.2"
                        className={getScoreColor(result.matchPercent)}
                        animate={{ strokeDashoffset: 251.2 - (251.2 * (result.matchPercent / 100)) }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className={`text-5xl font-bold ${getScoreColor(result.matchPercent)}`}>
                        {result.matchPercent}%
                      </span>
                      <span className="text-xs text-muted-foreground mt-1">
                        {result.matchPercent >= 80 ? "Excellent" : result.matchPercent >= 60 ? "Average" : "Poor"}
                      </span>
                    </div>
                  </div>
                  
                  {/* Score Breakdown */}
                  {result.scoreBreakdown && (
                    <div className="w-full mt-6 space-y-4">
                      <div className="text-sm font-medium mb-2 text-center text-muted-foreground">Score Breakdown</div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5"><Wrench className="w-3 h-3 text-primary" /> Skills</span>
                            <span className="font-medium">{result.scoreBreakdown.skills}%</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${result.scoreBreakdown.skills}%` }} transition={{ duration: 1, delay: 0.2 }} className="h-full bg-blue-500 rounded-full" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5"><Briefcase className="w-3 h-3 text-primary" /> Experience</span>
                            <span className="font-medium">{result.scoreBreakdown.experience}%</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${result.scoreBreakdown.experience}%` }} transition={{ duration: 1, delay: 0.3 }} className="h-full bg-indigo-500 rounded-full" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5"><GraduationCap className="w-3 h-3 text-primary" /> Education</span>
                            <span className="font-medium">{result.scoreBreakdown.education}%</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${result.scoreBreakdown.education}%` }} transition={{ duration: 1, delay: 0.4 }} className="h-full bg-violet-500 rounded-full" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5"><Hash className="w-3 h-3 text-primary" /> Keywords</span>
                            <span className="font-medium">{result.scoreBreakdown.keywords}%</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${result.scoreBreakdown.keywords}%` }} transition={{ duration: 1, delay: 0.5 }} className="h-full bg-purple-500 rounded-full" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Card className="border-border/50 bg-card/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" /> Matched Keywords
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {result.matchedKeywords?.map((kw: string) => (
                        <Badge key={kw} variant="secondary">{kw}</Badge>
                      ))}
                      {(!result.matchedKeywords || result.matchedKeywords.length === 0) && (
                        <span className="text-xs text-muted-foreground">None found</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-border/50 bg-card/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-500" /> Missing Keywords
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {result.missingKeywords?.map((kw: string) => (
                        <Badge key={kw} variant="outline" className="border-yellow-500/50 text-yellow-600 dark:text-yellow-400">{kw}</Badge>
                      ))}
                      {(!result.missingKeywords || result.missingKeywords.length === 0) && (
                        <span className="text-xs text-muted-foreground">None missing!</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-border/50 bg-card/50">
                <CardHeader>
                  <CardTitle className="text-lg">Detailed Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Strengths */}
                  {result.strengths && result.strengths.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold flex items-center gap-2 mb-3 text-green-600 dark:text-green-400">
                        <Plus className="w-4 h-4" /> Strengths
                      </h4>
                      <ul className="space-y-2">
                        {result.strengths.map((str: string, i: number) => (
                          <li key={i} className="text-sm flex items-start gap-2 text-muted-foreground">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500/50 shrink-0" />
                            <span className="leading-relaxed">{str}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Weaknesses */}
                  {result.weaknesses && result.weaknesses.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold flex items-center gap-2 mb-3 text-red-600 dark:text-red-400">
                        <Minus className="w-4 h-4" /> Weaknesses
                      </h4>
                      <ul className="space-y-2">
                        {result.weaknesses.map((wk: string, i: number) => (
                          <li key={i} className="text-sm flex items-start gap-2 text-muted-foreground">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500/50 shrink-0" />
                            <span className="leading-relaxed">{wk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations */}
                  {result.recommendations && result.recommendations.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold flex items-center gap-2 mb-3 text-blue-600 dark:text-blue-400">
                        <CheckCircle2 className="w-4 h-4" /> Recommendations
                      </h4>
                      <ul className="space-y-2">
                        {result.recommendations.map((rec: string, i: number) => (
                          <li key={i} className="text-sm flex items-start gap-2 text-muted-foreground">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500/50 shrink-0" />
                            <span className="leading-relaxed">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Suggestions */}
                  {result.suggestions && result.suggestions.length > 0 && (
                    <div className="pt-2 border-t border-border/50">
                      <h4 className="text-sm font-semibold flex items-center gap-2 mb-3 text-yellow-600 dark:text-yellow-400 mt-4">
                        <Lightbulb className="w-4 h-4" /> Suggestions for Improvement
                      </h4>
                      <ul className="space-y-2">
                        {result.suggestions.map((sug: string, i: number) => (
                          <li key={i} className="text-sm flex items-start gap-2 text-muted-foreground">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-yellow-500/50 shrink-0" />
                            <span className="leading-relaxed">{sug}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>

      {/* Past Analyses History */}
      <div className="space-y-4 mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Past Analyses</h2>
          {isLoadingHistory && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
        </div>

        {!isLoadingHistory && pastAnalyses.length === 0 ? (
          <div className="text-center py-8 bg-card rounded-xl border border-border/50">
            <Bot className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
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
                    className="border-border/50 bg-card/50 hover:bg-card/80 transition-colors cursor-pointer group"
                    onClick={() => setResult(record)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                            record.matchPercent >= 80 ? "bg-green-500/10 text-green-500" :
                            record.matchPercent >= 60 ? "bg-yellow-500/10 text-yellow-500" :
                            "bg-red-500/10 text-red-500"
                          }`}>
                            {record.matchPercent}%
                          </div>
                          <div>
                            <p className="text-sm font-medium leading-tight">
                              {record.matchPercent >= 80 ? "Excellent Match" :
                               record.matchPercent >= 60 ? "Average Match" : "Poor Match"}
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
                      <div className="flex flex-wrap gap-1 mt-2">
                        {record.matchedKeywords?.slice(0, 3).map(kw => (
                          <Badge key={kw} variant="secondary" className="text-[10px] px-1.5 py-0">{kw}</Badge>
                        ))}
                        {record.matchedKeywords && record.matchedKeywords.length > 3 && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">+{record.matchedKeywords.length - 3}</Badge>
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
