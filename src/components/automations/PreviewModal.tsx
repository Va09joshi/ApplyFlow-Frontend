import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PreviewModal({ isOpen, onClose }: PreviewModalProps) {
  const [formData, setFormData] = useState({
    from: "",
    subject: "",
    companyId: "",
    applicationId: ""
  });
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handlePreview = async () => {
    try {
      setLoading(true);
      const { data } = await api.post("/api/v1/automations/preview", formData);
      setResults(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunTest = async () => {
    try {
      setLoading(true);
      const { data } = await api.post("/api/v1/automations/test", formData);
      setResults(data.data); // Should include execution results
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Preview Automation Actions</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>From (Sender Email)</Label>
            <Input 
              value={formData.from} 
              onChange={e => setFormData({ ...formData, from: e.target.value })} 
              placeholder="hr@company.com" 
            />
          </div>
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input 
              value={formData.subject} 
              onChange={e => setFormData({ ...formData, subject: e.target.value })} 
              placeholder="Interview Invitation" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Company ID (Optional)</Label>
              <Input 
                value={formData.companyId} 
                onChange={e => setFormData({ ...formData, companyId: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <Label>Application ID (Optional)</Label>
              <Input 
                value={formData.applicationId} 
                onChange={e => setFormData({ ...formData, applicationId: e.target.value })} 
              />
            </div>
          </div>
          
          <div className="pt-2 flex gap-3">
            <Button onClick={handlePreview} disabled={loading} className="w-full">
              Preview Matches
            </Button>
            {results && results.matches && results.matches.length > 0 && (
              <Button onClick={handleRunTest} variant="secondary" disabled={loading} className="w-full">
                Run Test (Apply)
              </Button>
            )}
          </div>

          {results && (
            <div className="mt-4 p-4 bg-muted rounded-md border text-sm overflow-auto max-h-60">
              <h4 className="font-bold mb-2">Results:</h4>
              {results.matches && results.matches.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {results.matches.map((m: any, i: number) => (
                    <li key={i}>
                      Matched: <strong>{m.automation?.name}</strong>
                      <br/>
                      <span className="text-muted-foreground text-xs">
                        Actions: {JSON.stringify(m.actions)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No automations matched this email.</p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
