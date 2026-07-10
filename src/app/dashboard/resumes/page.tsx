"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UploadCloud, FileText, MoreVertical, CheckCircle2, Clock, Trash2, Edit2, Loader2, Download, Hammer } from "lucide-react";
import * as motion from "framer-motion/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { resumeService, Resume } from "@/services/resume.service";
import { toast } from "sonner";

export default function ResumesPage() {
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isUploading, setIsUploading] = useState(false);
  const [isUrlDialogOpen, setIsUrlDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newResume, setNewResume] = useState({ name: "", fileUrl: "" });

  const fetchResumes = async () => {
    try {
      setIsLoading(true);
      const responseBody = await resumeService.getAll();
      let resumesArray: Resume[] = [];
      
      if (Array.isArray(responseBody)) {
        resumesArray = responseBody;
      } else if (responseBody?.data?.docs && Array.isArray(responseBody.data.docs)) {
        resumesArray = responseBody.data.docs;
      } else if (responseBody?.data && Array.isArray(responseBody.data)) {
        resumesArray = responseBody.data;
      } else if (responseBody?.data?.resumes && Array.isArray(responseBody.data.resumes)) {
        resumesArray = responseBody.data.resumes;
      } else if (responseBody?.resumes && Array.isArray(responseBody.resumes)) {
        resumesArray = responseBody.resumes;
      }
      
      setResumes(resumesArray);
    } catch (error) {
      toast.error("Failed to load resumes.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are supported.");
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File exceeds the 5MB size limit.");
      return;
    }

    try {
      setIsUploading(true);
      await resumeService.upload(file, file.name);
      toast.success("Resume uploaded successfully!");
      fetchResumes(); // Refresh the list
    } catch (error) {
      toast.error("Failed to upload resume.");
    } finally {
      setIsUploading(false);
      // reset file input
      event.target.value = '';
    }
  };

  const handleCreateFromUrl = async () => {
    if (!newResume.name || !newResume.fileUrl) {
      toast.error("Name and URL are required");
      return;
    }
    try {
      setIsCreating(true);
      await resumeService.create(newResume);
      toast.success("Resume added successfully!");
      setIsUrlDialogOpen(false);
      setNewResume({ name: "", fileUrl: "" });
      fetchResumes();
    } catch (error) {
      toast.error("Failed to add resume");
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    try {
      await resumeService.delete(id);
      setResumes(prev => prev.filter(r => (r.id) !== id));
      toast.success("Resume deleted successfully");
    } catch (error) {
      toast.error("Failed to delete resume");
    }
  };

  const handleSetDefault = async (id: string | undefined) => {
    if (!id) return;
    try {
      await resumeService.update(id, { isDefault: true });
      toast.success("Resume set as default");
      fetchResumes();
    } catch (error) {
      toast.error("Failed to update resume");
    }
  };

  const handleEditBuilt = (resumeId: string | undefined) => {
    if (!resumeId) return;
    router.push(`/dashboard/resumes/builder?id=${resumeId}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resume Manager</h1>
          <p className="text-muted-foreground">Upload and manage your tailored resumes.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Dialog open={isUrlDialogOpen} onOpenChange={setIsUrlDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Add from URL</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Resume via URL</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Resume Name</Label>
                  <Input 
                    value={newResume.name} 
                    onChange={e => setNewResume({...newResume, name: e.target.value})} 
                    placeholder="e.g. Frontend Dev Resume" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>File URL (PDF)</Label>
                  <Input 
                    value={newResume.fileUrl} 
                    onChange={e => setNewResume({...newResume, fileUrl: e.target.value})} 
                    placeholder="https://example.com/resume.pdf" 
                  />
                </div>
                <Button className="w-full" onClick={handleCreateFromUrl} disabled={isCreating}>
                  {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  {isCreating ? "Adding..." : "Add Resume"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <div className="relative">
            <Input 
              type="file" 
              accept="application/pdf" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            <Button disabled={isUploading}>
              {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />}
              {isUploading ? "Uploading..." : "Upload Resume"}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 mb-4">
        <h2 className="text-xl font-semibold">Your Resumes</h2>
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
      </div>

      {!isLoading && resumes.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-dashed border-border/50 flex flex-col items-center justify-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-medium mb-2">No resumes found</h3>
          <p className="text-muted-foreground text-sm mb-6">Upload your first resume to get started.</p>
          <div className="relative">
            <Input 
              type="file" 
              accept="application/pdf" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            <Button disabled={isUploading}>
              {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />}
              {isUploading ? "Uploading..." : "Upload Resume"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume, i) => {
            const resumeId = resume.id || resume.id;
            return (
            <motion.div
              key={resumeId}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
            >
              <Card className="relative overflow-hidden border-border/50 bg-card hover:border-primary/50 transition-all group flex flex-col h-full shadow-sm">
                {resume.isDefault && (
                  <div className="absolute top-2 left-2 z-20">
                    <Badge variant="default" className="bg-primary/90 hover:bg-primary shadow-sm text-[10px] px-2 py-0.5 pointer-events-none">Primary</Badge>
                  </div>
                )}
                {resume.isBuilt && (
                  <div className={`absolute ${resume.isDefault ? 'top-8' : 'top-2'} left-2 z-20`}>
                    <Badge variant="secondary" className="shadow-sm text-[10px] px-2 py-0.5 pointer-events-none gap-1">
                      <Hammer className="w-2.5 h-2.5" /> Built
                    </Badge>
                  </div>
                )}
                <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger className={buttonVariants({ variant: "secondary", size: "icon" }) + " h-8 w-8 rounded-md shadow-sm bg-background/80 backdrop-blur-sm"}>
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {resume.isBuilt && (
                          <DropdownMenuItem onClick={() => handleEditBuilt(resumeId)}>
                            <Edit2 className="w-4 h-4 mr-2" /> Edit in Builder
                          </DropdownMenuItem>
                        )}
                        {!resume.isDefault && (
                          <DropdownMenuItem onClick={() => handleSetDefault(resumeId)}>
                            <CheckCircle2 className="w-4 h-4 mr-2" /> Set as Default
                          </DropdownMenuItem>
                        )}
                        {resume.fileUrl && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => window.open(resume.fileUrl, '_blank')}>
                              <Download className="w-4 h-4 mr-2" /> Download PDF
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(resumeId)}>
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                
                {/* Document Thumbnail Area */}
                <div className="h-48 bg-muted/30 relative flex items-center justify-center border-b border-border/50 group-hover:bg-muted/50 transition-colors overflow-hidden">
                  {/* Miniature Document */}
                  <div className="w-[130px] h-[175px] bg-white dark:bg-slate-100 rounded-[2px] shadow-md flex flex-col p-3 gap-1.5 overflow-hidden transform group-hover:scale-[1.02] transition-transform duration-500 relative">
                    {/* Header line */}
                    <div className="w-full h-1.5 bg-slate-300 rounded-full mb-1" />
                    {/* Subheader */}
                    <div className="w-3/4 h-1 bg-slate-200 rounded-full mb-2 mx-auto" />
                    {/* Paragraphs */}
                    {Array.from({ length: 6 }).map((_, idx) => (
                      <div key={idx} className="space-y-1 mt-1">
                        <div className="w-full h-[2px] bg-slate-200 rounded-full" />
                        <div className="w-[90%] h-[2px] bg-slate-200 rounded-full" />
                        <div className="w-[80%] h-[2px] bg-slate-200 rounded-full" />
                      </div>
                    ))}
                    {resume.parsedText && (
                       <div className="absolute inset-0 p-3 pt-8 overflow-hidden pointer-events-none">
                         <p className="text-[3.5px] leading-[5px] font-mono text-slate-800/40 text-left line-clamp-[25]">
                           {resume.parsedText.substring(0, 800)}
                         </p>
                       </div>
                    )}
                  </div>
                  
                  {/* Overlay Preview Button */}
                  <div className="absolute inset-0 bg-background/5 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                    {resume.isBuilt ? (
                      <Button
                        variant="secondary"
                        className="shadow-xl rounded-full font-medium"
                        onClick={() => handleEditBuilt(resumeId)}
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Resume
                      </Button>
                    ) : (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="secondary" className="shadow-xl rounded-full font-medium">
                            <FileText className="w-4 h-4 mr-2" />
                            View PDF
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 overflow-hidden">
                          <DialogHeader className="p-4 pb-0 border-b">
                            <DialogTitle className="text-lg">{resume.name}</DialogTitle>
                          </DialogHeader>
                          <div className="flex-1 w-full bg-muted/20 relative">
                            {resume.fileUrl ? (
                              <iframe 
                                src={`https://docs.google.com/viewer?url=${encodeURIComponent(resume.fileUrl)}&embedded=true`} 
                                className="w-full h-full border-0 absolute inset-0"
                                title={resume.name}
                              />
                            ) : (
                              <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                                No PDF file available to preview
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>

                <CardContent className="p-4 pb-3 flex-1 flex flex-col justify-end">
                  <CardTitle className="text-sm font-semibold truncate" title={resume.name}>{resume.name}</CardTitle>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                    <Clock className="w-3 h-3" />
                    {resume.createdAt ? new Date(resume.createdAt).toLocaleDateString() : "Unknown date"}
                    {resume.size && (
                      <>
                        <span className="mx-1 opacity-50">•</span>
                        <span>{resume.size}</span>
                      </>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="px-4 pb-4 pt-0">
                  <div className="flex flex-wrap gap-1.5">
                    {resume.tags?.slice(0, 3).map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 rounded-sm font-normal">{tag}</Badge>
                    ))}
                    {(!resume.tags || resume.tags.length === 0) && (
                      <span className="text-[10px] text-muted-foreground italic">No tags</span>
                    )}
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          )})}
        </div>
      )}
    </motion.div>
  );
}
