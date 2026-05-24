"use client";

import { useEffect, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, UploadCloud, Building2, MapPin, Users, Globe, Mail, Loader2 } from "lucide-react";
import * as motion from "framer-motion/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { companyService, Company } from "@/services/company.service";
import { toast } from "sonner";
import { MoreHorizontal, Trash2, Edit2 } from "lucide-react";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: "", website: "", tags: "" });

  const fetchCompanies = async () => {
    try {
      setIsLoading(true);
      const responseBody = await companyService.getAll();
      let companiesArray = [];
      if (Array.isArray(responseBody)) {
        companiesArray = responseBody;
      } else if (responseBody?.data?.docs && Array.isArray(responseBody.data.docs)) {
        companiesArray = responseBody.data.docs;
      } else if (responseBody?.data && Array.isArray(responseBody.data)) {
        companiesArray = responseBody.data;
      }
      setCompanies(companiesArray);
    } catch (error) {
      toast.error("Failed to load companies.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleCreateCompany = async () => {
    if (!newCompany.name) {
      toast.error("Company name is required");
      return;
    }

    try {
      setIsCreating(true);
      await companyService.create({
        name: newCompany.name,
        website: newCompany.website,
        tags: newCompany.tags ? newCompany.tags.split(',').map(t => t.trim()) : [],
        hrEmails: []
      });
      toast.success("Company created!");
      setIsDialogOpen(false);
      setNewCompany({ name: "", website: "", tags: "" });
      fetchCompanies();
    } catch (error) {
      toast.error("Failed to create company");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    try {
      await companyService.delete(id);
      toast.success("Company deleted");
      fetchCompanies();
    } catch (error) {
      toast.error("Failed to delete company");
    }
  };

  const handleUpdateStatus = async (id: string | undefined, newStatus: string) => {
    if (!id) return;
    try {
      await companyService.update(id, { status: newStatus });
      toast.success("Company status updated");
      fetchCompanies();
    } catch (error) {
      toast.error("Failed to update company");
    }
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
          <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
          <p className="text-muted-foreground">Manage your target companies and HR contacts.</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger className={buttonVariants()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Company
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Target Company</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Company Name *</Label>
                  <Input 
                    value={newCompany.name} 
                    onChange={e => setNewCompany({...newCompany, name: e.target.value})} 
                    placeholder="e.g. Vercel" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input 
                    value={newCompany.website} 
                    onChange={e => setNewCompany({...newCompany, website: e.target.value})} 
                    placeholder="e.g. https://vercel.com" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tags (Comma separated)</Label>
                  <Input 
                    value={newCompany.tags} 
                    onChange={e => setNewCompany({...newCompany, tags: e.target.value})} 
                    placeholder="e.g. saas, remote, series-b" 
                  />
                </div>
                <Button className="w-full" onClick={handleCreateCompany} disabled={isCreating}>
                  {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  {isCreating ? "Creating..." : "Save Company"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-card/50 backdrop-blur-sm p-2 rounded-xl border border-border/50">
        <Search className="w-5 h-5 text-muted-foreground ml-2" />
        <Input 
          placeholder="Search by name, industry, or location..." 
          className="border-none bg-transparent shadow-none focus-visible:ring-0"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : companies.length === 0 ? (
        <div className="text-center py-10 bg-card rounded-xl border border-border/50">
          <Building2 className="w-10 h-10 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium">No companies found</h3>
          <p className="text-muted-foreground text-sm mt-1">Add your first target company to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company, i) => {
            const companyId = company.id || company._id;
            return (
            <motion.div
              key={companyId || i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <Card className="h-full flex flex-col border-border/50 bg-card hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer group overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 transition-opacity group-hover:bg-primary/10"></div>
                <CardHeader className="pb-3 relative z-10">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:border-primary/40 group-hover:bg-primary/15 transition-all shadow-sm">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <Badge variant={company.status === "Priority" || company.status === "active" ? "default" : company.status === "Contacted" ? "secondary" : "outline"} className="capitalize font-medium shadow-sm">
                      {company.status || "Saved"}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl mt-4 line-clamp-1" title={company.name}>{company.name}</CardTitle>
                  {company.website && (
                    <CardDescription className="flex items-center gap-1.5 mt-1">
                      <Globe className="w-3.5 h-3.5 shrink-0" />
                      <a 
                        href={company.website.startsWith('http') ? company.website : `https://${company.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="truncate hover:text-primary hover:underline transition-colors" 
                        onClick={(e) => e.stopPropagation()}
                      >
                        {company.website.replace(/^https?:\/\//, '')}
                      </a>
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="relative z-10 flex-1">
                  <div className="flex flex-wrap gap-2 mt-2">
                    {company.tags && company.tags.length > 0 ? (
                      company.tags.slice(0, 3).map((tag: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-xs px-2 py-0.5 bg-secondary/50 hover:bg-secondary/80 font-normal">
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-secondary/50 text-muted-foreground font-normal">
                        No industry tags
                      </Badge>
                    )}
                    {company.tags && company.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-secondary/50 font-normal">
                        +{company.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="border-t border-border/50 bg-muted/20 px-6 py-3 flex justify-between items-center mt-auto relative z-10">
                  <div className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/40 inline-block"></span>
                    Added {company.createdAt ? new Date(company.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "Unknown"}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon" }) + " h-8 w-8 rounded-full data-[state=open]:bg-muted"}>
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Company Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleUpdateStatus(companyId, "active"); }}>
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div> Mark as Active
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleUpdateStatus(companyId, "inactive"); }}>
                        <div className="w-2 h-2 rounded-full bg-slate-500 mr-2"></div> Mark as Inactive
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(companyId); }}>
                        <Trash2 className="w-4 h-4 mr-2" /> Delete Company
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardFooter>
              </Card>
            </motion.div>
          )})}
        </div>
      )}
    </motion.div>
  );
}
