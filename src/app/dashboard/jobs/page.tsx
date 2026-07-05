"use client";

import { useEffect, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Sparkles, Building2, MapPin, DollarSign, Globe, Loader2, Compass, MoreHorizontal, Edit2, Trash2, ArrowUpRight, Briefcase, Clock, RefreshCw, CheckCircle2, BookmarkCheck, Zap } from "lucide-react";
import * as motion from "framer-motion/client";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { jobsService, Job } from "@/services/jobs.service";

const getInitials = (name?: string) => {
  if (!name) return "C";
  return name.substring(0, 2).toUpperCase();
};

const formatRelativeTime = (dateString?: string) => {
  if (!dateString) return null;
  if (dateString.toLowerCase().includes('ago') || dateString.toLowerCase().includes('posted')) {
    return dateString.toLowerCase().startsWith('posted') ? dateString : `Posted ${dateString}`;
  }
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return `Posted ${dateString}`;
    const diffInSeconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return `Posted just now`;
    if (diffInSeconds < 3600) return `Posted ${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `Posted ${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `Posted ${Math.floor(diffInSeconds / 86400)}d ago`;
    return `Posted ${Math.floor(diffInSeconds / 2592000)}mo ago`;
  } catch {
    return `Posted ${dateString}`;
  }
};

const getJobUrl = (job: Job) => {
  if (job.applyUrl) return job.applyUrl;
  if (job.linkedinUrl) return job.linkedinUrl;
  const query = encodeURIComponent(`${job.title} ${job.companyName || job.company}`);
  return `https://www.google.com/search?q=${query}&ibp=htl;jobs`;
};

export default function JobsPage() {
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [suggestions, setSuggestions] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"suggestions" | "saved">("suggestions");

  const [isSuggestDialogOpen, setIsSuggestDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestParams, setSuggestParams] = useState({ targetRole: "", location: "", count: 5, employmentType: "", experienceLevel: "", preferredCompanies: "", avoidCompanies: "", skills: "" });

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [editForm, setEditForm] = useState({ status: "", notes: "" });
  const [isSaving, setIsSaving] = useState(false);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const res = await jobsService.getAll();
      let jobsArray = [];
      if (Array.isArray(res)) jobsArray = res;
      else if (res?.data?.docs && Array.isArray(res.data.docs)) jobsArray = res.data.docs;
      else if (res?.data && Array.isArray(res.data)) jobsArray = res.data;
      setSavedJobs(jobsArray);
    } catch {
      toast.error("Failed to fetch jobs.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      const res = await jobsService.generateSuggestions({
        ...suggestParams,
        employmentType: suggestParams.employmentType === "any" ? undefined : suggestParams.employmentType,
        experienceLevel: suggestParams.experienceLevel === "any" ? undefined : suggestParams.experienceLevel,
        preferredCompanies: suggestParams.preferredCompanies ? suggestParams.preferredCompanies.split(',').map(c => c.trim()).filter(Boolean) : undefined,
        avoidCompanies: suggestParams.avoidCompanies ? suggestParams.avoidCompanies.split(',').map(c => c.trim()).filter(Boolean) : undefined,
        skills: suggestParams.skills ? suggestParams.skills.split(',').map(c => c.trim()).filter(Boolean) : undefined,
      });
      let suggestions: Job[] = [];
      if (Array.isArray(res)) suggestions = res;
      else if (res?.data && Array.isArray(res.data)) suggestions = res.data;
      else if (res?.data?.docs && Array.isArray(res.data.docs)) suggestions = res.data.docs;
      
      suggestions = suggestions.map((j: Job) => ({...j, id: undefined }));
      setSuggestions(suggestions);
      setActiveTab("suggestions");
      
      toast.success(`${suggestions.length} suggestions found! Click Save to keep them.`);
      setIsSuggestDialogOpen(false);
    } catch {
      toast.error("Failed to generate suggestions.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingJob) return;
    const id = editingJob.id || editingJob.id;
    if (!id) return;
    try {
      setIsSaving(true);
      await jobsService.update(id, editForm);
      toast.success("Job updated!");
      setIsEditDialogOpen(false);
      fetchJobs();
    } catch {
      toast.error("Failed to update job.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveJob = async (job: Job, index: number) => {
    try {
      // Only send fields the backend schema accepts – extra fields cause validation errors
      const payload: Record<string, unknown> = {
        title: job.title,
        company: job.companyName || job.company,
      };
      // Add optional fields only when they have a value
      if (job.location) payload.location = job.location;
      if (job.linkedinUrl) payload.linkedinUrl = job.linkedinUrl;
      if (job.applyUrl) payload.applyUrl = job.applyUrl;
      if (job.companyLogoUrl) payload.companyLogoUrl = job.companyLogoUrl;
      if (job.postedAt) payload.postedAt = job.postedAt;
      if (job.experienceLevel || job.level) payload.experienceLevel = job.experienceLevel || job.level;
      if (job.employmentType) payload.employmentType = job.employmentType;
      if (job.salary) payload.salary = job.salary;

      console.log("[SaveJob] Payload:", payload);
      const res = await jobsService.save(payload);
      const savedJob = res?.data || res;
      toast.success("Job saved successfully!");
      // Remove from suggestions
      setSuggestions(prev => prev.filter((_, idx) => idx !== index));
      // Refresh saved jobs list & switch to saved tab
      fetchJobs();
      setActiveTab("saved");
    } catch (err: unknown) {
      const error = err as { response?: { data?: unknown; status?: number } };
      console.error("[SaveJob] Error:", error?.response?.data || error);
      toast.error("Failed to save job.");
    }
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    try {
      await jobsService.delete(id);
      toast.success("Job deleted.");
      fetchJobs();
    } catch {
      toast.error("Failed to delete job.");
    }
  };

  const openEdit = (job: Job) => {
    setEditingJob(job);
    setEditForm({ status: job.status || "suggested", notes: job.notes || "" });
    setIsEditDialogOpen(true);
  };

  const activeJobs = activeTab === "saved" ? savedJobs : suggestions;

  const filteredJobs = activeJobs.filter(j => 
    !searchQuery || 
    j.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (j.companyName || j.company || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 pb-10"
    >
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Suggestions</h1>
          <p className="text-muted-foreground">Discover and track perfect roles recommended by AI.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Refresh
          </Button>
          <Dialog open={isSuggestDialogOpen} onOpenChange={setIsSuggestDialogOpen}>
            <DialogTrigger className={buttonVariants()}>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Suggestions
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>AI Job Recommendations</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Target Role</Label>
                  <Input value={suggestParams.targetRole} onChange={e => setSuggestParams({...suggestParams, targetRole: e.target.value})} placeholder="e.g. Full Stack Engineer" />
                </div>
                <div className="space-y-2">
                  <Label>Location / Preference</Label>
                  <Input value={suggestParams.location} onChange={e => setSuggestParams({...suggestParams, location: e.target.value})} placeholder="e.g. Remote, NY, Relocation" />
                </div>
                <div className="space-y-2">
                  <Label>How many?</Label>
                  <Input type="number" min={1} max={10} value={suggestParams.count} onChange={e => setSuggestParams({...suggestParams, count: parseInt(e.target.value) || 5})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Employment Type</Label>
                    <Select value={suggestParams.employmentType} onValueChange={v => setSuggestParams({...suggestParams, employmentType: v || ""})}>
                      <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Experience Level</Label>
                    <Select value={suggestParams.experienceLevel} onValueChange={v => setSuggestParams({...suggestParams, experienceLevel: v || ""})}>
                      <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="Entry Level">Entry Level</SelectItem>
                        <SelectItem value="1-3 years">1-3 years</SelectItem>
                        <SelectItem value="3-5 years">3-5 years</SelectItem>
                        <SelectItem value="Senior">Senior</SelectItem>
                        <SelectItem value="Lead/Manager">Lead/Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Preferred Companies <span className="text-muted-foreground font-normal text-xs">(Comma separated)</span></Label>
                  <Input value={suggestParams.preferredCompanies} onChange={e => setSuggestParams({...suggestParams, preferredCompanies: e.target.value})} placeholder="e.g. Acme, ExampleCo" />
                </div>
                <div className="space-y-2">
                  <Label>Required Skills <span className="text-muted-foreground font-normal text-xs">(Comma separated)</span></Label>
                  <Input value={suggestParams.skills} onChange={e => setSuggestParams({...suggestParams, skills: e.target.value})} placeholder="e.g. React, Node.js" />
                </div>
                <div className="space-y-2">
                  <Label>Avoid Companies <span className="text-muted-foreground font-normal text-xs">(Comma separated)</span></Label>
                  <Input value={suggestParams.avoidCompanies} onChange={e => setSuggestParams({...suggestParams, avoidCompanies: e.target.value})} placeholder="e.g. BadCorp" />
                </div>
                <Button className="w-full" onClick={handleGenerate} disabled={isGenerating}>
                  {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  {isGenerating ? "Generating..." : "Generate Matches"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/40 w-fit">
        <button
          onClick={() => setActiveTab("suggestions")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === "suggestions"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Suggestions
          {suggestions.length > 0 && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              activeTab === "suggestions" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            }`}>{suggestions.length}</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("saved")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === "saved"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <BookmarkCheck className="w-4 h-4" />
          Saved Jobs
          {savedJobs.length > 0 && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              activeTab === "saved" ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
            }`}>{savedJobs.length}</span>
          )}
        </button>
      </div>

      <div className="flex items-center gap-4 bg-card/50 backdrop-blur-sm p-2 rounded-xl border border-border/50">
        <Search className="w-5 h-5 text-muted-foreground ml-2" />
        <Input 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={activeTab === "saved" ? "Search saved jobs..." : "Search suggestions..."}
          className="border-none bg-transparent shadow-none focus-visible:ring-0"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-14 bg-card/60 rounded-xl border border-border/40">
          {activeTab === "suggestions" ? (
            <>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-primary opacity-60" />
              </div>
              <h3 className="text-lg font-semibold">No suggestions yet</h3>
              <p className="text-muted-foreground text-sm mt-1 max-w-sm mx-auto">Click &quot;Generate Suggestions&quot; to get AI-powered job recommendations tailored to your profile.</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <BookmarkCheck className="w-8 h-8 text-emerald-500 opacity-60" />
              </div>
              <h3 className="text-lg font-semibold">No saved jobs</h3>
              <p className="text-muted-foreground text-sm mt-1 max-w-sm mx-auto">Generate suggestions and click &quot;Save Job&quot; on the ones you like to track them here.</p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job, i) => {
            const jobId = job.id;
            return (
              <motion.div
                key={jobId || i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Card className="h-full flex flex-col border-border/40 bg-card hover:border-primary/40 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 transition-opacity group-hover:bg-primary/10"></div>
                  <CardHeader className="pb-3 relative z-10">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border border-border/50 overflow-hidden font-bold text-white text-sm shadow-sm">
                          {job.companyLogoUrl ? (
                            <img src={job.companyLogoUrl} alt={job.companyName || job.company || "Company"} className="w-full h-full object-cover bg-white" />
                          ) : (
                            getInitials(job.companyName || job.company)
                          )}
                        </div>
                        <span className="font-semibold text-[15px]">{job.companyName || job.company || "Unknown Company"}</span>
                      </div>
                      {job.verified ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20 shadow-none font-medium px-2 py-0.5 whitespace-nowrap">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
                        </Badge>
                      ) : (
                        <Badge variant={job.id ? (job.status === "Applied" ? "default" : job.status === "Interviewing" ? "secondary" : "outline") : "secondary"} className="shadow-none font-medium px-2 py-0.5 border-primary/20 text-primary/80 bg-primary/5 hover:bg-primary/10 whitespace-nowrap">
                          {job.id ? (job.status || "Saved") : "AI suggested"}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl line-clamp-2 leading-tight font-bold tracking-tight">{job.title}</CardTitle>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                      {job.location && (
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                      )}
                      {job.salary && (
                        <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {job.salary}</span>
                      )}
                      {(job.experienceLevel || job.level) && (
                        <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {job.experienceLevel || job.level}</span>
                      )}
                      {job.postedAt && (
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatRelativeTime(job.postedAt)}</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 relative z-10 pt-2">
                    {getJobUrl(job) && (
                      <a href={getJobUrl(job)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-xs font-medium bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 px-3 py-2 rounded-lg transition-colors border border-blue-500/10 mb-2">
                        <Globe className="w-3.5 h-3.5 mr-1.5" /> {job.applyUrl ? "Apply Now" : job.linkedinUrl ? "View on LinkedIn" : "Search on Google Jobs"} <ArrowUpRight className="w-3 h-3 ml-1 opacity-70" />
                      </a>
                    )}
                    {job.notes && (
                      <div className="mt-4 text-sm text-foreground/80 bg-muted/30 p-3 rounded-lg border border-border/40">
                        <p className="font-semibold text-xs text-muted-foreground mb-1">Notes</p>
                        <p className="line-clamp-3">{job.notes}</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="border-t border-border/40 bg-muted/20 px-5 py-4 flex justify-between items-center mt-auto relative z-10 backdrop-blur-sm">
                    <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      Added {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "Just now"}
                    </div>
                    {(!job.id && !job.id) ? (
                      <Button size="sm" className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-sm transition-all" onClick={() => handleSaveJob(job, i)}>Save Job</Button>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon" }) + " h-8 w-8 rounded-full data-[state=open]:bg-muted"}>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openEdit(job)}>
                            <Edit2 className="w-4 h-4 mr-2" /> Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(jobId)}>
                            <Trash2 className="w-4 h-4 mr-2" /> Delete Job
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Job Tracking</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={editForm.status} onValueChange={v => setEditForm({...editForm, status: v || "suggested"})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="suggested">Suggested</SelectItem>
                  <SelectItem value="Saved">Saved</SelectItem>
                  <SelectItem value="Applied">Applied</SelectItem>
                  <SelectItem value="Interviewing">Interviewing</SelectItem>
                  <SelectItem value="Offer">Offer</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea 
                value={editForm.notes} 
                onChange={e => setEditForm({...editForm, notes: e.target.value})} 
                placeholder="Interview details, tasks..." 
                className="h-32"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
