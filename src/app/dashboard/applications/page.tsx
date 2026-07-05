"use client";

import { useEffect, useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Download,
  Building2,
  Loader2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import * as motion from "framer-motion/client";
import { applicationService, Application } from "@/services/application.service";
import { companyService, Company } from "@/services/company.service";
import { resumeService, Resume } from "@/services/resume.service";
import { toast } from "sonner";

export default function ApplicationsPage() {
  const [search, setSearch] = useState("");
  const [applications, setApplications] = useState<Application[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newApp, setNewApp] = useState({ companyId: "", resumeId: "", roleTitle: "" });

  const fetchApplications = async () => {
    setIsLoading(true);

    const normalizeArray = (data: unknown) => {
      if (Array.isArray(data)) return data;
      if (data && typeof data === "object") {
        const response = data as {
          data?: { docs?: unknown[]; data?: unknown[] } | unknown[];
          docs?: unknown[];
        };
        if (Array.isArray(response.data)) return response.data;
        if (response.data && typeof response.data === "object" && Array.isArray((response.data as { docs?: unknown[] }).docs)) {
          return (response.data as { docs?: unknown[] }).docs || [];
        }
        if (Array.isArray(response.docs)) return response.docs;
      }
      return [];
    };

    const [appsResult, compsResult, resResult] = await Promise.allSettled([
      applicationService.getAll(),
      companyService.getAll(1, 100),
      resumeService.getAll(1, 100),
    ]);

    if (appsResult.status === "fulfilled") {
      setApplications(normalizeArray(appsResult.value));
    }

    if (compsResult.status === "fulfilled") {
      setCompanies(normalizeArray(compsResult.value) as Company[]);
    }

    if (resResult.status === "fulfilled") {
      setResumes(normalizeArray(resResult.value) as Resume[]);
    }

    if (appsResult.status === "rejected" && compsResult.status === "rejected" && resResult.status === "rejected") {
      toast.error("Failed to load data.");
    } else if (appsResult.status === "rejected") {
      toast.error("Applications could not be loaded.");
    } else if (compsResult.status === "rejected" || resResult.status === "rejected") {
      toast.error("Some supporting data could not be loaded.");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchApplications();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const getFullImageUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http") || url.startsWith("data:")) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    if (baseUrl.includes("applyflow-backend") || baseUrl.includes("backend.applyflow.live")) {
      return `${baseUrl.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
    }
    return `http://localhost:5000/${url.replace(/^\//, "")}`;
  };

  const getCompanyForApp = (app: Application) => {
    if (app.company) return app.company;

    const companyId = typeof app.companyId === "string" ? app.companyId : (app.companyId as unknown as { id?: string })?.id || (app.companyId as unknown as { id?: string })?.id || "";
    return companies.find(c => (c.id || c.id) === companyId);
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

  const handleCreateApplication = async () => {
    if (!newApp.companyId || !newApp.resumeId || !newApp.roleTitle) {
      toast.error("All fields are required");
      return;
    }

    try {
      setIsCreating(true);
      await applicationService.create(newApp);
      toast.success("Application created!");
      setIsDialogOpen(false);
      setNewApp({ companyId: "", resumeId: "", roleTitle: "" });
      fetchApplications();
    } catch (error) {
      toast.error("Failed to create application");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await applicationService.delete(id);
      toast.success("Application deleted");
      fetchApplications();
    } catch (error) {
      toast.error("Failed to delete application");
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await applicationService.update(id, { status: newStatus });
      toast.success("Status updated");
      fetchApplications();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const filteredApps = applications.filter(app => {
    const companyName = getCompanyNameForApp(app) || "";
    return companyName.toLowerCase().includes(search.toLowerCase()) || 
           app.roleTitle.toLowerCase().includes(search.toLowerCase());
  });

  const getStatusStyle = (status?: string) => {
    const normalized = status?.toLowerCase() || "applied";
    if (normalized === "offer") return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    if (normalized === "interview") return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
    if (normalized === "rejected") return "bg-rose-500/10 text-rose-600 border-rose-500/20";
    return "bg-muted text-muted-foreground border-border";
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
          <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
          <p className="text-muted-foreground">Manage and track all your job applications.</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger className={buttonVariants()}>
              New Application
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Application</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Company *</Label>
                  <Select value={newApp.companyId} onValueChange={v => setNewApp({...newApp, companyId: v || ""})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map(c => <SelectItem key={c.id || c.id} value={c.id || c.id || ""}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Role Title *</Label>
                  <Input 
                    value={newApp.roleTitle} 
                    onChange={e => setNewApp({...newApp, roleTitle: e.target.value})} 
                    placeholder="e.g. Frontend Engineer" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Resume Used *</Label>
                  <Select value={newApp.resumeId} onValueChange={v => setNewApp({...newApp, resumeId: v || ""})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a resume" />
                    </SelectTrigger>
                    <SelectContent>
                      {resumes.map(r => <SelectItem key={r.id} value={r.id || ""}>{r.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={handleCreateApplication} disabled={isCreating}>
                  {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  {isCreating ? "Creating..." : "Save Application"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search company or role..."
                className="pl-9 bg-background/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="px-2 py-1 rounded-full border border-border bg-muted/30">
                Total: {applications.length}
              </span>
              <span className="px-2 py-1 rounded-full border border-border bg-muted/30">
                Showing: {filteredApps.length}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/50 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Date Applied</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : filteredApps.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                      No applications found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApps.map((app) => {
                    const appId = app.id || app.id || "";
                    const statusClass = getStatusStyle(app.status);
                    const companyName = getCompanyNameForApp(app);
                    const companyLogo = getCompanyLogoForApp(app);
                    return (
                    <TableRow key={appId} className="hover:bg-muted/30">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-500/10 flex items-center justify-center border border-border overflow-hidden">
                            {companyLogo ? (
                              <img src={getFullImageUrl(companyLogo)} alt={companyName} className="w-full h-full object-cover bg-white" />
                            ) : (
                              <Building2 className="w-4 h-4 text-sky-600" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-semibold">{companyName}</div>
                            <div className="text-xs text-muted-foreground">Company</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{app.roleTitle}</div>
                        <div className="text-xs text-muted-foreground">Role</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] border ${statusClass}`}>
                          {app.status || "applied"}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "Unknown"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger className={buttonVariants({ variant: "ghost" }) + " h-8 w-8 p-0"}>
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(appId, "applied")}>Mark as Applied</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(appId, "interview")}>Mark as Interview</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(appId, "offer")}>Mark as Offer</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(appId, "rejected")}>Mark as Rejected</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(appId)}>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )})
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
