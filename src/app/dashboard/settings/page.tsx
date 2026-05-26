"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, User, Camera, X, Plus } from "lucide-react";
import * as motion from "framer-motion/client";
import { api } from "@/lib/api";
import { toast } from "sonner";

import { userService } from "@/services/user.service";

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({ name: "", skills: "", avatarUrl: "" });
  const [skillInput, setSkillInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const skillsList = formData.skills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  useEffect(() => {
    userService.getProfile().then(data => {
      const userData = data?.data || data || {};
      const profile = userData.profile || {};
      setFormData({
        name: profile.name || userData.name || "",
        skills: profile.skills ? profile.skills.join(", ") : (userData.skills ? userData.skills.join(", ") : ""),
        avatarUrl: profile.avatarUrl || userData.avatarUrl || userData.avatar || profile.avatar || ""
      });
      setIsLoading(false);
    }).catch(() => {
      toast.error("Failed to load settings.");
      setIsLoading(false);
    });
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      await userService.uploadAvatar(file);
      
      const data = await userService.getProfile();
      const userData = data?.data || data || {};
      const profile = userData.profile || {};
      const newAvatarUrl = profile.avatarUrl || userData.avatarUrl || userData.avatar || profile.avatar || "";
      
      setFormData(prev => ({ ...prev, avatarUrl: newAvatarUrl }));
      toast.success("Avatar uploaded successfully!");
      window.dispatchEvent(new Event("profile-updated"));
    } catch (error) {
      toast.error("Failed to upload avatar.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await api.patch('/api/v1/users/settings', {
        name: formData.name,
        skills: formData.skills.split(',').map((s: string) => s.trim()).filter(Boolean),
        avatarUrl: formData.avatarUrl
      });
      toast.success("Settings updated successfully!");
      window.dispatchEvent(new Event("profile-updated"));
    } catch (e) {
      toast.error("Failed to update settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const addSkill = () => {
    const skill = skillInput.trim();
    if (!skill) return;
    if (skillsList.includes(skill)) {
      toast.error("Skill already added.");
      return;
    }
    const updated = skillsList.length > 0 ? [...skillsList, skill].join(", ") : skill;
    setFormData({ ...formData, skills: updated });
    setSkillInput("");
  };

  const removeSkill = (index: number) => {
    const updated = skillsList.filter((_, i) => i !== index).join(", ");
    setFormData({ ...formData, skills: updated });
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const getFullImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http") || url.startsWith("data:")) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    if (baseUrl.includes("applyflow-backend")) {
      return `${baseUrl.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
    }
    return `http://localhost:5000/${url.replace(/^\//, '')}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-xl mx-auto pb-10"
    >
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Update your profile and skills.</p>
      </div>

      <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Avatar + Name */}
              <div className="flex items-start gap-5">
                <div 
                  className="relative group shrink-0 cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden ring-1 ring-border bg-muted">
                    {formData.avatarUrl ? (
                      <img 
                        src={getFullImageUrl(formData.avatarUrl)} 
                        alt="Avatar" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </div>

                <div className="flex-1 space-y-1.5">
                  <Label className="text-sm">Full Name</Label>
                  <Input 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    placeholder="e.g. Alex Johnson"
                    className="h-10"
                  />
                </div>
              </div>

              <Separator />

              {/* Skills */}
              <div className="space-y-3">
                <div>
                  <Label className="text-sm">Skills</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Used in AI-generated cover letters and emails.</p>
                </div>

                {skillsList.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {skillsList.map((skill, index) => (
                      <Badge
                        key={`${skill}-${index}`}
                        variant="secondary"
                        className="pl-2 pr-1 py-0.5 gap-1 text-xs"
                      >
                        {skill}
                        <button
                          onClick={() => removeSkill(index)}
                          className="p-0.5 rounded-full hover:bg-foreground/10 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleSkillKeyDown}
                    placeholder="Add a skill..."
                    className="h-9"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSkill}
                    disabled={!skillInput.trim()}
                    className="h-9 px-3 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        {!isLoading && (
          <CardFooter className="border-t border-border/50 pt-4 pb-4 flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}
