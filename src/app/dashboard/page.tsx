"use client";

import { useEffect, useState, type ComponentType } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Image from "next/image";
import { 
  Briefcase, Mail, TrendingUp, CalendarDays, 
  Loader2, Plus, Edit2, Trash2, Send, ArrowUpRight, Building2
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Area, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, ComposedChart, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import * as motion from "framer-motion/client";
import { analyticsService, Analytics } from "@/services/analytics.service";
import { applicationService, Application } from "@/services/application.service";
import { atsService, ATSRecord } from "@/services/ats.service";
import { toast } from "sonner";
import Link from "next/link";
import { dashboardService } from "@/services/dashboard.service";
type DashboardPayload = Record<string, unknown> & {
  applicationCounts?: { total?: number; interview?: number; offer?: number; rejected?: number };
  applications?: { total?: number; interview?: number; offer?: number; rejected?: number };
  recentActivity?: unknown[];
  recentApplications?: unknown[];
  recentApps?: unknown[];
  emailAnalytics?: Record<string, unknown> & { chartData?: unknown[] };
  emails?: Record<string, unknown> & { chartData?: unknown[] };
  metricRecords?: unknown[];
  analyticsRecords?: unknown[];
  metrics?: unknown[];
  chartData?: unknown[];
  averageAtsScore?: number;
  atsScore?: number;
  jobsCount?: number;
  companiesCount?: number;
};

type StatCard = {
  title: string;
  value: string | number;
  icon: ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  accent: string;
};

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<unknown>(null);
  const [atsRecords, setAtsRecords] = useState<ATSRecord[]>([]);
  const [metricRecords, setMetricRecords] = useState<Analytics[]>([]);
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Analytics CRUD form
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    metricDate: new Date().toISOString().split("T")[0],
    sentCount: 0,
    responsesCount: 0,
    interviewsCount: 0,
  });

  const fetchAll = async () => {
    try {
      setIsLoading(true);
      const [dataResult, atsResult, analyticsResult, applicationsResult] = await Promise.allSettled([
        dashboardService.getStats(),
        atsService.getAll(1, 14),
        analyticsService.getAll(1, 14),
        applicationService.getAll(1, 6),
      ]);

      if (dataResult.status === "fulfilled") {
        setDashboardData(dataResult.value);
      }

      if (atsResult.status === "fulfilled") {
        const atsPayload = atsResult.value?.data || atsResult.value || {};
        const atsList = atsPayload?.docs || atsPayload?.data || atsPayload || [];
        const normalizedAts = Array.isArray(atsList) ? atsList : [];
        setAtsRecords(normalizedAts as ATSRecord[]);
      }

      if (analyticsResult.status === "fulfilled") {
        const analyticsPayload = analyticsResult.value?.data || analyticsResult.value || {};
        const analyticsList = analyticsPayload?.docs || analyticsPayload?.data || analyticsPayload || [];
        const normalizedAnalytics = Array.isArray(analyticsList) ? analyticsList : [];
        setMetricRecords(normalizedAnalytics as Analytics[]);
      }

      if (applicationsResult.status === "fulfilled") {
        const appsPayload = applicationsResult.value?.data || applicationsResult.value || {};
        const appsList = appsPayload?.docs || appsPayload?.data || appsPayload || [];
        const normalizedApps = Array.isArray(appsList) ? appsList : [];
        setRecentApplications(normalizedApps as Application[]);
      }

      const failures = [dataResult, atsResult, analyticsResult, applicationsResult].filter((result) => result.status === "rejected");
      if (failures.length === 4) {
        toast.error("Failed to load dashboard data.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getCompanyForApp = (app: Application) => {
    if (app.company) return app.company;
    return null;
  };

  const getCompanyNameForApp = (app: Application) => {
    const company = getCompanyForApp(app);
    if (company?.name) return company.name;

    const fallbackName = app.companyName || app.companyTitle;
    if (fallbackName) return fallbackName;

    if (typeof app.companyId === "string" && app.companyId.trim()) return app.companyId;
    return "Unknown Company";
  };

  const getCompanyLogoForApp = (app: Application) => {
    const company = getCompanyForApp(app);
    return company?.logoUrl || "";
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchAll();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  // Analytics CRUD
  const resetForm = () => {
    setFormData({ metricDate: new Date().toISOString().split("T")[0], sentCount: 0, responsesCount: 0, interviewsCount: 0 });
    setEditingId(null);
  };

  const openEditDialog = (record: Analytics) => {
    const id = record.id;
    if (!id) return;
    setEditingId(id);
    setFormData({
      metricDate: record.metricDate ? record.metricDate.split("T")[0] : "",
      sentCount: record.sentCount || 0,
      responsesCount: record.responsesCount || 0,
      interviewsCount: record.interviewsCount || 0,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const payload = {
        metricDate: new Date(formData.metricDate).toISOString(),
        sentCount: Number(formData.sentCount),
        responsesCount: Number(formData.responsesCount),
        interviewsCount: Number(formData.interviewsCount),
      };
      if (editingId) {
        await analyticsService.update(editingId, payload);
        toast.success("Record updated!");
      } else {
        await analyticsService.create(payload);
        toast.success("Record created!");
      }
      setIsDialogOpen(false);
      resetForm();
      fetchAll();
    } catch {
      toast.error(editingId ? "Failed to update." : "Failed to create.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await analyticsService.delete(id);
      fetchAll();
      toast.success("Record deleted.");
    } catch {
      toast.error("Failed to delete.");
    }
  };

  const payload = (((dashboardData as { data?: DashboardPayload } | null)?.data || dashboardData || {}) as DashboardPayload);
  
  const applicationCounts = payload.applicationCounts || payload.applications || { total: 0, interview: 0, offer: 0, rejected: 0 };
  const emailAnalytics = (payload.emailAnalytics || payload.emails || { totalSent: 0, totalResponses: 0, totalInterviews: 0, responseRate: "0" }) as { totalSent?: number; sent?: number; sentToday?: number; totalResponses?: number; totalInterviews?: number; responseRate?: string };
  const metricList = metricRecords.length > 0 ? metricRecords : (payload.metricRecords || payload.analyticsRecords || payload.metrics || []) as Analytics[];
  const recentApps = recentApplications.length > 0 ? recentApplications : (payload.recentActivity || payload.recentApplications || payload.recentApps || []) as Application[];
  const latestAtsRecord = atsRecords[0] || null;
  const atsTrendData = atsRecords.slice(0, 14).reverse().map((record, index) => ({
    label: new Date(record.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    score: record.matchPercent || 0,
    index,
  }));
  const atsRadarData = latestAtsRecord
    ? [
        { subject: "Skills", score: latestAtsRecord.scoreBreakdown?.skills || 0 },
        { subject: "Experience", score: latestAtsRecord.scoreBreakdown?.experience || 0 },
        { subject: "Education", score: latestAtsRecord.scoreBreakdown?.education || 0 },
        { subject: "Keywords", score: latestAtsRecord.scoreBreakdown?.keywords || 0 },
      ]
    : [];
  const chartColors = {
    sent: "hsl(200, 90%, 55%)",
    responses: "hsl(165, 70%, 45%)",
    interviews: "hsl(18, 85%, 55%)",
  };

  // Chart data — sorted by date, last 14 entries, multi-series
  const chartData = metricList
    .slice()
    .sort((a: Analytics, b: Analytics) => new Date(a.metricDate).getTime() - new Date(b.metricDate).getTime())
    .slice(-14)
    .map((r: Analytics) => ({
      date: new Date(r.metricDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      Sent: r.sentCount || 0,
      Responses: r.responsesCount || 0,
      Interviews: r.interviewsCount || 0,
    }));

  const statCards: StatCard[] = [
    { title: "Total Apps", value: Number(applicationCounts.total || 0), icon: Briefcase, color: "text-sky-600", bg: "bg-sky-500/15", accent: "from-sky-500/20 via-cyan-500/10 to-transparent" },
    { title: "Jobs Tracked", value: Number(payload.jobsCount || 0), icon: Briefcase, color: "text-indigo-600", bg: "bg-indigo-500/15", accent: "from-indigo-500/20 via-violet-500/10 to-transparent" },
    { title: "Companies", value: Number(payload.companiesCount || 0), icon: Building2, color: "text-fuchsia-600", bg: "bg-fuchsia-500/15", accent: "from-fuchsia-500/20 via-pink-500/10 to-transparent" },
    { title: "ATS Match", value: `${latestAtsRecord?.matchPercent || 0}%`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-500/15", accent: "from-emerald-500/20 via-lime-500/10 to-transparent" },
    { title: "Total Emails", value: Number(emailAnalytics.totalSent || emailAnalytics.sent || 0), icon: Send, color: "text-blue-600", bg: "bg-blue-500/15", accent: "from-blue-500/20 via-indigo-500/10 to-transparent" },
    { title: "Sent Today", value: Number(emailAnalytics.sentToday || 0), icon: Mail, color: "text-rose-600", bg: "bg-rose-500/15", accent: "from-rose-500/20 via-orange-500/10 to-transparent" },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 pb-10 animate-in fade-in duration-500">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <Skeleton className="h-9 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="border-border/50 bg-card/60 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-9 w-9 rounded-xl" />
                </div>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts and Recent Activity Skeleton */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Chart Skeleton */}
          <div className="lg:col-span-7 space-y-8">
            <Card className="border-border/50 bg-card/50 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-6 w-40 mb-2" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[320px] w-full mt-2 rounded-xl" />
              </CardContent>
            </Card>
            
            <Card className="border-border/50 bg-card/50 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-6 w-40 mb-2" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[320px] w-full mt-2 rounded-xl" />
              </CardContent>
            </Card>
          </div>

          {/* ATS/Recent Activity Skeleton */}
          <div className="lg:col-span-5 space-y-8">
            <Card className="border-border/50 bg-card/50 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3 mt-2">
                   <Skeleton className="h-[100px] w-full rounded-2xl" />
                   <Skeleton className="h-[100px] w-full rounded-2xl" />
                   <Skeleton className="h-[100px] w-full rounded-2xl" />
                </div>
                <Skeleton className="h-[150px] w-full rounded-xl" />
                <Skeleton className="h-[150px] w-full rounded-xl" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your job application pipeline.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" /> Log Metrics
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Metrics" : "Log New Metrics"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={formData.metricDate} onChange={e => setFormData({ ...formData, metricDate: e.target.value })} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Sent</Label>
                  <Input type="number" min={0} value={formData.sentCount} onChange={e => setFormData({ ...formData, sentCount: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>Responses</Label>
                  <Input type="number" min={0} value={formData.responsesCount} onChange={e => setFormData({ ...formData, responsesCount: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>Interviews</Label>
                  <Input type="number" min={0} value={formData.interviewsCount} onChange={e => setFormData({ ...formData, interviewsCount: Number(e.target.value) })} />
                </div>
              </div>
              <Button className="w-full" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {editingId ? "Update" : "Save"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
          >
            <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-all relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.accent}`} />
              <CardContent className="p-5 relative">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.title}</span>
                  <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center ring-1 ring-foreground/5`}> 
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </div>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Chart + Recent Activity */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Bar + Area Chart */}
        <motion.div
          className="lg:col-span-7"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Activity Over Time</CardTitle>
                  <CardDescription>Sent, responses, and interviews from your logged metrics</CardDescription>
                </div>
                <Badge variant="outline" className="text-[10px]">Last 14 days</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[320px] w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="sentGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={chartColors.sent} stopOpacity={0.35} />
                          <stop offset="95%" stopColor={chartColors.sent} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "var(--background)", borderRadius: "10px", border: "1px solid var(--border)" }}
                        itemStyle={{ color: "var(--foreground)" }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                      <Area type="monotone" dataKey="Sent" stroke={chartColors.sent} fill="url(#sentGradient)" strokeWidth={2} />
                      <Bar dataKey="Responses" fill={chartColors.responses} radius={[6, 6, 0, 0]} />
                      <Bar dataKey="Interviews" fill={chartColors.interviews} radius={[6, 6, 0, 0]} />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center">
                    <Mail className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm">No metrics logged yet. Click &quot;Log Metrics&quot; to get started.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ATS Score Trend */}
        <motion.div
          className="lg:col-span-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.28 }}
        >
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>ATS Match Trend</CardTitle>
                  <CardDescription>Real analysis scores from the ATS analyzer</CardDescription>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  Latest {latestAtsRecord?.matchPercent || 0}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-border/60 bg-background/50 p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Latest match</p>
                  <div className="mt-2 text-3xl font-bold text-foreground">{latestAtsRecord?.matchPercent || 0}%</div>
                  <p className="mt-1 text-xs text-muted-foreground">From the newest ATS analysis</p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/50 p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Analyses</p>
                  <div className="mt-2 text-3xl font-bold text-foreground">{atsRecords.length}</div>
                  <p className="mt-1 text-xs text-muted-foreground">Last 14 records loaded</p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/50 p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Breakdown</p>
                  <div className="mt-2 text-3xl font-bold text-foreground">
                    {latestAtsRecord ? Math.round(((latestAtsRecord.scoreBreakdown?.skills || 0) + (latestAtsRecord.scoreBreakdown?.experience || 0) + (latestAtsRecord.scoreBreakdown?.education || 0) + (latestAtsRecord.scoreBreakdown?.keywords || 0)) / 4) : 0}%
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Average of the latest breakdown</p>
                </div>
              </div>

              <div className="h-[150px] w-full">
                {atsTrendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={atsTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "var(--background)", borderRadius: "10px", border: "1px solid var(--border)" }}
                        formatter={(value: unknown) => [`${value ?? 0}%`, "ATS Match"]}
                        itemStyle={{ color: "var(--foreground)" }}
                      />
                      <Line type="monotone" dataKey="score" stroke="#22c55e" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center border border-dashed border-border/60 rounded-xl">
                    <TrendingUp className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm">No ATS analyses yet.</p>
                  </div>
                )}
              </div>

              <div className="h-[150px] w-full">
                {atsRadarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={atsRadarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
                      <Radar name="Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.28} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "var(--background)", borderRadius: "10px", border: "1px solid var(--border)" }}
                        formatter={(value: unknown) => [`${value ?? 0}%`, "Score"]}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center border border-dashed border-border/60 rounded-xl">
                    <TrendingUp className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm">No ATS breakdown yet.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Line Chart */}
        <motion.div
          className="lg:col-span-7"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Momentum Trend</CardTitle>
                  <CardDescription>Daily trend across all outreach activity</CardDescription>
                </div>
                <Badge variant="outline" className="text-[10px]">Rolling 14</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[320px] w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "var(--background)", borderRadius: "10px", border: "1px solid var(--border)" }}
                        itemStyle={{ color: "var(--foreground)" }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                      <Line type="monotone" dataKey="Sent" stroke={chartColors.sent} strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="Responses" stroke={chartColors.responses} strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="Interviews" stroke={chartColors.interviews} strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center">
                    <TrendingUp className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm">No trend data yet.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          className="lg:col-span-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/50">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>Recent Applications</CardTitle>
                  <CardDescription>Latest updates on your pipeline</CardDescription>
                </div>
                <Badge variant="outline" className="text-[10px]">{recentApps.length} open</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              {recentApps.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[250px] text-muted-foreground text-center rounded-2xl border border-dashed border-border/60 bg-background/40">
                  <Briefcase className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">No recent activity yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentApps.map((activity: Application, i: number) => {
                    const status = activity.status?.toLowerCase();
                    const statusStyles =
                      status === "interview" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                      status === "offer" ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                      status === "rejected" ? "bg-rose-500/10 text-rose-600 border-rose-500/20" :
                      "bg-muted text-muted-foreground border-border";
                    const statusAccent =
                      status === "interview" ? "border-l-emerald-500" :
                      status === "offer" ? "border-l-blue-500" :
                      status === "rejected" ? "border-l-rose-500" : "border-l-border";
                    return (
                      <div key={activity.id || i} className={`rounded-2xl border border-border/60 border-l-4 ${statusAccent} bg-background/45 p-4 flex items-center justify-between gap-4 hover:bg-background/70 hover:shadow-sm transition-all`}>
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500/20 via-cyan-500/10 to-transparent flex items-center justify-center font-bold text-sm border border-border shrink-0 overflow-hidden">
                            {getCompanyLogoForApp(activity) ? (
                              <Image src={getCompanyLogoForApp(activity)} alt={getCompanyNameForApp(activity)} width={48} height={48} className="w-full h-full object-cover" unoptimized />
                            ) : (
                              <span>{getCompanyNameForApp(activity).charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">{getCompanyNameForApp(activity)}</p>
                            <p className="text-xs text-muted-foreground truncate">{activity.roleTitle}</p>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                              <span>{activity.createdAt ? new Date(activity.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Recently"}</span>
                              <span className="h-1 w-1 rounded-full bg-border" />
                              <span>Pipeline update</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="outline" className={`text-[10px] border ${statusStyles}`}>
                            {activity.status}
                          </Badge>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <ArrowUpRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <Link href="/dashboard/applications" className="block w-full mt-6">
                <Button className="w-full" variant="outline">
                  View All Applications
                  <ArrowUpRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Metric Records */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Metric Records</h2>
          <p className="text-sm text-muted-foreground">A compact view of daily outreach performance.</p>
        </div>
        <Badge variant="outline" className="text-[10px]">{metricList.length} logged</Badge>
      </div>

      {metricList.length === 0 ? (
        <div className="text-center py-10 bg-card rounded-2xl border border-border/50 shadow-sm">
          <CalendarDays className="w-10 h-10 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium">No records yet</h3>
          <p className="text-muted-foreground text-sm mt-1 max-w-sm mx-auto">Use Log Metrics to add a daily update. The chart and cards above will fill in automatically after you save.</p>
          <Button className="mt-5" onClick={() => { resetForm(); setIsDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Log first metric
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {metricList.map((record: Analytics, i: number) => {
            const recordId = record.id || "";
            return (
              <motion.div
                key={recordId}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
              >
                <Card className="border-border/50 bg-card/50 hover:bg-card/80 transition-colors group">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className="text-[10px] font-medium">
                        <CalendarDays className="w-2.5 h-2.5 mr-1" />
                        {new Date(record.metricDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </Badge>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => openEditDialog(record)}>
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(recordId)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center py-1.5 rounded-md bg-blue-500/5 border border-blue-500/10">
                        <div className="text-base font-bold text-blue-500">{record.sentCount || 0}</div>
                        <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Sent</div>
                      </div>
                      <div className="text-center py-1.5 rounded-md bg-emerald-500/5 border border-emerald-500/10">
                        <div className="text-base font-bold text-emerald-500">{record.responsesCount || 0}</div>
                        <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Replies</div>
                      </div>
                      <div className="text-center py-1.5 rounded-md bg-violet-500/5 border border-violet-500/10">
                        <div className="text-base font-bold text-violet-500">{record.interviewsCount || 0}</div>
                        <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Interviews</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
