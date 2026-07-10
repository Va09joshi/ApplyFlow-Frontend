"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ATSResumeTemplate } from "@/components/resume/ATSResumeTemplate";
import { exportToPDF, exportToDOCX } from "@/utils/export";
import { ResumeBuilderData } from "@/types/resume";
import { resumeService } from "@/services/resume.service";
import { toast } from "sonner";
import {
  Save, Download, FileText, Plus, Trash2, Loader2,
  User, Briefcase, FolderGit2, GraduationCap, Wrench, Award, Trophy
} from "lucide-react";

// --- Section wrapper component (defined outside to prevent remount on state change) ---
const SectionCard = ({ icon: Icon, title, onAdd, addLabel, children }: {
  icon: React.ElementType;
  title: string;
  onAdd?: () => void;
  addLabel?: string;
  children: React.ReactNode;
}) => (
  <section className="rounded-xl border border-border/60 bg-card/50 overflow-hidden">
    <div className="flex justify-between items-center px-5 py-3 bg-muted/30 border-b border-border/40">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-primary" />
        </div>
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
      </div>
      {onAdd && (
        <Button size="sm" variant="outline" onClick={onAdd} className="h-7 text-xs gap-1.5 rounded-lg">
          <Plus className="w-3 h-3" /> {addLabel || "Add"}
        </Button>
      )}
    </div>
    <div className="p-5">{children}</div>
  </section>
);

// --- Item card (defined outside to prevent remount on state change) ---
const ItemCard = ({ onRemove, children }: { onRemove: () => void; children: React.ReactNode }) => (
  <div className="p-4 border border-border/50 rounded-lg mb-3 last:mb-0 space-y-3 relative bg-background/50 hover:border-border transition-colors">
    <Button size="icon" variant="ghost" className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-red-500 transition-colors" onClick={onRemove}>
      <Trash2 className="w-3.5 h-3.5" />
    </Button>
    {children}
  </div>
);

const emptyResumeData: ResumeBuilderData = {
  personalInfo: { fullName: "", email: "", phone: "", location: "", linkedin: "", portfolio: "", github: "" },
  summary: "",
  experience: [],
  projects: [],
  education: [],
  certifications: [],
  achievements: [],
  skills: [],
  font: "'Times New Roman'",
};

const normalizeResumeData = (value?: ResumeBuilderData): ResumeBuilderData => ({
  ...emptyResumeData,
  ...value,
  personalInfo: {
    ...emptyResumeData.personalInfo,
    ...(value?.personalInfo ?? {}),
  },
  experience: value?.experience ?? [],
  projects: value?.projects ?? [],
  education: value?.education ?? [],
  certifications: value?.certifications ?? [],
  achievements: value?.achievements ?? [],
  skills: value?.skills ?? [],
});

function ResumeBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeId = searchParams.get("id");

  const [data, setData] = useState<ResumeBuilderData>({
    personalInfo: { fullName: "", email: "", phone: "", location: "", linkedin: "", portfolio: "", github: "" },
    summary: "",
    experience: [],
    projects: [],
    education: [],
    certifications: [],
    achievements: [],
    skills: [],
    font: "'Times New Roman'"
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingResume, setIsLoadingResume] = useState(false);
  const [editingResumeId, setEditingResumeId] = useState<string | null>(null);
  const safeData = normalizeResumeData(data);

  useEffect(() => {
    const loadResume = async () => {
      if (!resumeId) return;

      try {
        setIsLoadingResume(true);
        const response = await resumeService.getById(resumeId);
        const resume = response?.data ?? response;
        if (resume?.builderData) {
          setData(normalizeResumeData(resume.builderData));
          setEditingResumeId(resumeId);
        } else {
          toast.error("This resume was not created in the builder.");
          router.push("/dashboard/resumes");
        }
      } catch {
        toast.error("Failed to load the selected resume.");
        router.push("/dashboard/resumes");
      } finally {
        setIsLoadingResume(false);
      }
    };

    loadResume();
  }, [resumeId, router]);

  // --- Personal Info ---
  const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, personalInfo: { ...data.personalInfo, [e.target.name]: e.target.value } });
  };

  // --- Experience CRUD ---
  const addExperience = () => {
    setData({
      ...data,
      experience: [...data.experience, { id: Date.now().toString(), jobTitle: "", company: "", location: "", startDate: "", endDate: "", description: "" }]
    });
  };
  const updateExperience = (id: string, field: string, value: string) => {
    setData({ ...data, experience: data.experience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp) });
  };
  const removeExperience = (id: string) => {
    setData({ ...data, experience: data.experience.filter(exp => exp.id !== id) });
  };

  // --- Projects CRUD ---
  const addProject = () => {
    setData({
      ...data,
      projects: [...(data.projects || []), { id: Date.now().toString(), name: "", link: "", description: "" }]
    });
  };
  const updateProject = (id: string, field: string, value: string) => {
    setData({ ...data, projects: data.projects.map(proj => proj.id === id ? { ...proj, [field]: value } : proj) });
  };
  const removeProject = (id: string) => {
    setData({ ...data, projects: data.projects.filter(proj => proj.id !== id) });
  };

  // --- Education CRUD ---
  const addEducation = () => {
    setData({
      ...data,
      education: [...data.education, { id: Date.now().toString(), degree: "", school: "", location: "", startDate: "", endDate: "", score: "" }]
    });
  };
  const updateEducation = (id: string, field: string, value: string) => {
    setData({ ...data, education: data.education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu) });
  };
  const removeEducation = (id: string) => {
    setData({ ...data, education: data.education.filter(edu => edu.id !== id) });
  };

  // --- Certifications CRUD ---
  const addCertification = () => {
    setData({
      ...data,
      certifications: [...(data.certifications || []), { id: Date.now().toString(), name: "", issuer: "", date: "", link: "" }]
    });
  };
  const updateCertification = (id: string, field: string, value: string) => {
    setData({ ...data, certifications: data.certifications.map(c => c.id === id ? { ...c, [field]: value } : c) });
  };
  const removeCertification = (id: string) => {
    setData({ ...data, certifications: data.certifications.filter(c => c.id !== id) });
  };

  // --- Achievements CRUD ---
  const addAchievement = () => {
    setData({
      ...data,
      achievements: [...(data.achievements || []), { id: Date.now().toString(), title: "", description: "" }]
    });
  };
  const updateAchievement = (id: string, field: string, value: string) => {
    setData({ ...data, achievements: data.achievements.map(a => a.id === id ? { ...a, [field]: value } : a) });
  };
  const removeAchievement = (id: string) => {
    setData({ ...data, achievements: data.achievements.filter(a => a.id !== id) });
  };

  // --- Skills CRUD ---
  const addSkill = () => {
    setData({
      ...data,
      skills: [...(data.skills || []), { id: Date.now().toString(), category: "", items: "" }]
    });
  };
  const updateSkill = (id: string, field: string, value: string) => {
    setData({ ...data, skills: data.skills.map(s => s.id === id ? { ...s, [field]: value } : s) });
  };
  const removeSkill = (id: string) => {
    setData({ ...data, skills: data.skills.filter(s => s.id !== id) });
  };

  // --- Save to backend ---
  const handleSave = async () => {
    if (!data.personalInfo.fullName.trim()) {
      toast.error("Please enter your full name before saving.");
      return;
    }
    try {
      setIsSaving(true);
      if (editingResumeId) {
        await resumeService.update(editingResumeId, {
          name: data.personalInfo.fullName ? `${data.personalInfo.fullName} – Resume` : "Untitled Resume",
          isBuilt: true,
          builderData: data,
        });
        toast.success("Resume updated successfully!");
      } else {
        const created = await resumeService.saveBuilderResume(data);
        const createdId = created?.data?.id ?? created?.id;
        if (createdId) {
          setEditingResumeId(createdId);
          router.replace(`/dashboard/resumes/builder?id=${createdId}`);
        }
        toast.success("Resume saved successfully! It's now in your Resume Manager.");
      }
    } catch {
      toast.error("Failed to save resume. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingResume) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center text-sm text-muted-foreground">
        Loading resume...
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Left Panel - Editor */}
      <div className="w-1/2 flex flex-col border-r border-border">
        {/* Editor Header */}
        <div className="px-6 py-4 border-b border-border bg-background flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-bold tracking-tight">{editingResumeId ? "Edit Resume" : "Resume Builder"}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Build and save your ATS-friendly resume</p>
          </div>
          <Button onClick={handleSave} disabled={isSaving} size="sm" className="gap-2 rounded-lg">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? "Saving..." : editingResumeId ? "Update Resume" : "Save Resume"}
          </Button>
        </div>

        {/* Scrollable editor body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Personal Information */}
          <SectionCard icon={User} title="Personal Information">
            <div className="grid grid-cols-2 gap-3">
              <Input name="fullName" placeholder="Full Name" value={safeData.personalInfo.fullName} onChange={handlePersonalChange} />
              <Input name="email" placeholder="Email" value={safeData.personalInfo.email} onChange={handlePersonalChange} />
              <Input name="phone" placeholder="Phone" value={safeData.personalInfo.phone} onChange={handlePersonalChange} />
              <Input name="location" placeholder="City, State" value={safeData.personalInfo.location} onChange={handlePersonalChange} />
              <Input name="linkedin" placeholder="LinkedIn URL" value={safeData.personalInfo.linkedin} onChange={handlePersonalChange} />
              <Input name="github" placeholder="GitHub URL" value={safeData.personalInfo.github} onChange={handlePersonalChange} />
              <Input name="portfolio" placeholder="Portfolio URL" value={safeData.personalInfo.portfolio} onChange={handlePersonalChange} className="col-span-2" />
            </div>
          </SectionCard>

          {/* Professional Summary */}
          <SectionCard icon={FileText} title="Professional Summary">
            <Textarea
              placeholder="A brief summary of your professional background..."
              rows={4}
              value={safeData.summary}
              onChange={e => setData({ ...data, summary: e.target.value })}
            />
          </SectionCard>

          {/* Experience */}
          <SectionCard icon={Briefcase} title="Experience" onAdd={addExperience} addLabel="Add">
            {safeData.experience.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">No experience added yet. Click "Add" to get started.</p>
            )}
            {safeData.experience.map(exp => (
              <ItemCard key={exp.id} onRemove={() => removeExperience(exp.id)}>
                <div className="grid grid-cols-2 gap-3 pr-8">
                  <Input placeholder="Job Title" value={exp.jobTitle} onChange={e => updateExperience(exp.id, "jobTitle", e.target.value)} />
                  <Input placeholder="Company" value={exp.company} onChange={e => updateExperience(exp.id, "company", e.target.value)} />
                  <Input placeholder="Start Date (e.g. Jan 2023)" value={exp.startDate} onChange={e => updateExperience(exp.id, "startDate", e.target.value)} />
                  <Input placeholder="End Date (or Present)" value={exp.endDate} onChange={e => updateExperience(exp.id, "endDate", e.target.value)} />
                </div>
                <Textarea
                  placeholder="Key responsibilities and achievements (one per line)..."
                  rows={4}
                  value={exp.description}
                  onChange={e => updateExperience(exp.id, "description", e.target.value)}
                />
              </ItemCard>
            ))}
          </SectionCard>

          {/* Projects */}
          <SectionCard icon={FolderGit2} title="Projects" onAdd={addProject} addLabel="Add">
            {safeData.projects.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">No projects added yet.</p>
            )}
            {safeData.projects.map(proj => (
              <ItemCard key={proj.id} onRemove={() => removeProject(proj.id)}>
                <div className="grid grid-cols-2 gap-3 pr-8">
                  <Input placeholder="Project Name" value={proj.name} onChange={e => updateProject(proj.id, "name", e.target.value)} />
                  <Input placeholder="Project Link" value={proj.link} onChange={e => updateProject(proj.id, "link", e.target.value)} />
                </div>
                <Textarea
                  placeholder="Project description (one point per line)..."
                  rows={4}
                  value={proj.description}
                  onChange={e => updateProject(proj.id, "description", e.target.value)}
                />
              </ItemCard>
            ))}
          </SectionCard>

          {/* Education */}
          <SectionCard icon={GraduationCap} title="Education" onAdd={addEducation} addLabel="Add">
            {safeData.education.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">No education added yet.</p>
            )}
            {safeData.education.map(edu => (
              <ItemCard key={edu.id} onRemove={() => removeEducation(edu.id)}>
                <div className="grid grid-cols-2 gap-3 pr-8">
                  <Input placeholder="Degree" value={edu.degree} onChange={e => updateEducation(edu.id, "degree", e.target.value)} />
                  <Input placeholder="School / University" value={edu.school} onChange={e => updateEducation(edu.id, "school", e.target.value)} />
                  <Input placeholder="Start Date" value={edu.startDate} onChange={e => updateEducation(edu.id, "startDate", e.target.value)} />
                  <Input placeholder="End Date" value={edu.endDate} onChange={e => updateEducation(edu.id, "endDate", e.target.value)} />
                  <Input placeholder="Location" value={edu.location || ""} onChange={e => updateEducation(edu.id, "location", e.target.value)} />
                  <Input placeholder="Score (CGPA / Percentage)" value={edu.score || ""} onChange={e => updateEducation(edu.id, "score", e.target.value)} />
                </div>
              </ItemCard>
            ))}
          </SectionCard>

          {/* Certifications */}
          <SectionCard icon={Award} title="Certifications" onAdd={addCertification} addLabel="Add">
            {safeData.certifications.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">No certifications added yet.</p>
            )}
            {safeData.certifications.map(cert => (
              <ItemCard key={cert.id} onRemove={() => removeCertification(cert.id)}>
                <div className="grid grid-cols-2 gap-3 pr-8">
                  <Input placeholder="Certification Name" value={cert.name} onChange={e => updateCertification(cert.id, "name", e.target.value)} />
                  <Input placeholder="Issuing Organization" value={cert.issuer} onChange={e => updateCertification(cert.id, "issuer", e.target.value)} />
                  <Input placeholder="Date (e.g. Mar 2024)" value={cert.date} onChange={e => updateCertification(cert.id, "date", e.target.value)} />
                  <Input placeholder="Credential Link (optional)" value={cert.link || ""} onChange={e => updateCertification(cert.id, "link", e.target.value)} />
                </div>
              </ItemCard>
            ))}
          </SectionCard>

          {/* Achievements */}
          <SectionCard icon={Trophy} title="Achievements" onAdd={addAchievement} addLabel="Add">
            {safeData.achievements.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">No achievements added yet.</p>
            )}
            {safeData.achievements.map(ach => (
              <ItemCard key={ach.id} onRemove={() => removeAchievement(ach.id)}>
                <div className="space-y-3 pr-8">
                  <Input placeholder="Achievement Title" value={ach.title} onChange={e => updateAchievement(ach.id, "title", e.target.value)} />
                  <Textarea
                    placeholder="Describe the achievement..."
                    rows={2}
                    value={ach.description}
                    onChange={e => updateAchievement(ach.id, "description", e.target.value)}
                  />
                </div>
              </ItemCard>
            ))}
          </SectionCard>

          {/* Skills */}
          <SectionCard icon={Wrench} title="Skills" onAdd={addSkill} addLabel="Add Category">
            {safeData.skills.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">No skill categories added yet. Click "Add Category" to get started.</p>
            )}
            {safeData.skills.map(skill => (
              <ItemCard key={skill.id} onRemove={() => removeSkill(skill.id)}>
                <div className="space-y-3 pr-8">
                  <Input
                    placeholder="Category (e.g. Programming Languages, Frameworks, Tools)"
                    value={skill.category}
                    onChange={e => updateSkill(skill.id, "category", e.target.value)}
                    className="font-medium"
                  />
                  <Input
                    placeholder="Skills (comma-separated, e.g. Python, Java, TypeScript)"
                    value={skill.items}
                    onChange={e => updateSkill(skill.id, "items", e.target.value)}
                  />
                </div>
              </ItemCard>
            ))}
          </SectionCard>

        </div>
      </div>

      {/* Right Panel - Preview */}
      <div className="w-1/2 bg-muted/30 flex flex-col">
        <div className="p-4 border-b border-border flex justify-between items-center bg-background shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-sm text-muted-foreground">Live Preview</h2>
            <Select value={safeData.font ?? "Arial"} onValueChange={(val: string | null) => setData({ ...data, font: val ?? undefined })}>
              <SelectTrigger className="w-[160px] h-8 text-xs">
                <SelectValue placeholder="Select Font" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Arial">Arial</SelectItem>
                <SelectItem value="Helvetica">Helvetica</SelectItem>
                <SelectItem value="'Times New Roman'">Times New Roman</SelectItem>
                <SelectItem value="Georgia">Georgia</SelectItem>
                <SelectItem value="Garamond">Garamond</SelectItem>
                <SelectItem value="'Trebuchet MS'">Trebuchet MS</SelectItem>
                <SelectItem value="Calibri">Calibri</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => exportToDOCX(safeData)} className="rounded-lg">
              <FileText className="w-4 h-4 mr-2" /> DOCX
            </Button>
            <Button size="sm" onClick={() => exportToPDF("resume-preview-element", safeData)} className="rounded-lg">
              <Download className="w-4 h-4 mr-2" /> PDF
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-8">
          <ATSResumeTemplate data={safeData} id="resume-preview-element" />
        </div>
      </div>
    </div>
  );
}

export default function ResumeBuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center text-sm text-muted-foreground">
          Loading resume builder...
        </div>
      }
    >
      <ResumeBuilderContent />
    </Suspense>
  );
}
