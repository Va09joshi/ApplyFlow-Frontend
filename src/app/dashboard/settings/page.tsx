"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User, Wrench } from "lucide-react";
import * as motion from "framer-motion/client";
import { api } from "@/lib/api";
import { toast } from "sonner";

import { userService } from "@/services/user.service";

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({ name: "", skills: "", avatarUrl: "" });

  useEffect(() => {
    userService.getProfile().then(data => {
      const userData = data?.data || data || {};
      const profile = userData.profile || {};
      setFormData({
        name: profile.name || userData.name || "",
        skills: profile.skills ? profile.skills.join(", ") : (userData.skills ? userData.skills.join(", ") : ""),
        avatarUrl: profile.avatarUrl || userData.avatarUrl || ""
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
      
      // Refetch profile to guarantee we get the correct updated data structure
      const data = await userService.getProfile();
      const userData = data?.data || data || {};
      const profile = userData.profile || {};
      const newAvatarUrl = profile.avatarUrl || userData.avatarUrl || userData.avatar || profile.avatar || "";
      
      setFormData(prev => ({ ...prev, avatarUrl: newAvatarUrl }));
      toast.success("Avatar uploaded successfully!");
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
    } catch (e) {
      toast.error("Failed to update settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const getFullImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http") || url.startsWith("data:")) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"; // Assuming local backend is 5000 if not set, or it'll fail back to relative.
    // If we're hitting production backend
    if (baseUrl.includes("applyflow-backend")) {
      return `${baseUrl.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
    }
    // If local, just append
    return `http://localhost:5000/${url.replace(/^\//, '')}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-3xl mx-auto"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">Manage your profile and application preferences.</p>
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Profile Details</CardTitle>
              <CardDescription>Update your personal information and skills used by AI generators.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-primary/10 border-2 border-border/50 flex items-center justify-center">
                    {formData.avatarUrl ? (
                      <img src={getFullImageUrl(formData.avatarUrl)} alt="Avatar Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-primary/50" />
                    )}
                  </div>
                </div>
                <div className="flex-1 space-y-4 w-full">
                  <div className="space-y-2">
                    <Label>Avatar Image</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="file" 
                        accept="image/*"
                        onChange={handleAvatarUpload} 
                        disabled={isUploading}
                        className="flex-1"
                      />
                      {isUploading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground shrink-0" />}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                      placeholder="e.g. Alex Johnson" 
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Key Skills (Comma separated)</Label>
                <Input 
                  value={formData.skills} 
                  onChange={e => setFormData({...formData, skills: e.target.value})} 
                  placeholder="e.g. Node.js, React, MongoDB" 
                />
                <p className="text-xs text-muted-foreground">These skills are automatically injected into AI-generated cover letters and emails.</p>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="border-t border-border/50 pt-6 flex justify-end">
          <Button onClick={handleSave} disabled={isSaving || isLoading}>
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wrench className="w-4 h-4 mr-2" />}
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
