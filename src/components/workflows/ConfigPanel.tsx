import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Trash2Icon, XIcon } from 'lucide-react';

interface ConfigPanelProps {
  node: any | null;
  onUpdate: (id: string, data: any) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function ConfigPanel({ node, onUpdate, onDelete, onClose }: ConfigPanelProps) {
  if (!node) return null;

  const handleUpdate = (key: string, value: any) => {
    onUpdate(node.id, { ...node.data, [key]: value });
  };

  const renderFields = () => {
    switch (node.type) {
      case 'trigger':
      case 'filter':
        return (
          <>
            <div className="space-y-2">
              <Label>From Contains</Label>
              <Input
                placeholder="e.g., recruiter@acme.com"
                value={node.data.fromContains || ''}
                onChange={(e) => handleUpdate('fromContains', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Subject Contains</Label>
              <Input
                placeholder="e.g., Interview"
                value={node.data.subjectContains || ''}
                onChange={(e) => handleUpdate('subjectContains', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Company ID</Label>
              <Input
                placeholder="Specific Company ID (optional)"
                value={node.data.companyId || ''}
                onChange={(e) => handleUpdate('companyId', e.target.value)}
              />
            </div>
          </>
        );

      case 'ai_classify':
        return (
          <div className="space-y-2">
            <Label>Prompt Context</Label>
            <Textarea
              placeholder="Custom context for the AI classifier..."
              value={node.data.context || ''}
              onChange={(e) => handleUpdate('context', e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">AI will classify the email into interview, offer, reply, or other.</p>
          </div>
        );

      case 'send_email':
        return (
          <>
            <div className="space-y-2">
              <Label>To</Label>
              <Input
                placeholder="{{email.from}}"
                value={node.data.to || ''}
                onChange={(e) => handleUpdate('to', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                placeholder="Re: {{email.subject}}"
                value={node.data.subject || ''}
                onChange={(e) => handleUpdate('subject', e.target.value)}
              />
            </div>
            <div className="space-y-2 flex items-center justify-between">
              <Label>Send as HTML</Label>
              <Switch
                checked={node.data.contentType === 'html'}
                onCheckedChange={(checked) => handleUpdate('contentType', checked ? 'html' : 'plain')}
              />
            </div>
            <div className="space-y-2">
              <Label>Body</Label>
              <Textarea
                className="min-h-[150px]"
                placeholder="Email body..."
                value={node.data.body || ''}
                onChange={(e) => handleUpdate('body', e.target.value)}
              />
            </div>
          </>
        );

      case 'move_stage':
        return (
          <>
            <div className="space-y-2">
              <Label>To Stage</Label>
              <Select value={node.data.toStage || ''} onValueChange={(val) => handleUpdate('toStage', val)}>
                <SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="screening">Screening</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="offered">Offered</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Note</Label>
              <Input
                placeholder="Note to attach..."
                value={node.data.note || ''}
                onChange={(e) => handleUpdate('note', e.target.value)}
              />
            </div>
          </>
        );

      case 'job_search':
        return (
          <>
            <div className="space-y-2">
              <Label>Target Role</Label>
              <Input
                value={node.data.targetRole || ''}
                onChange={(e) => handleUpdate('targetRole', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={node.data.location || ''}
                onChange={(e) => handleUpdate('location', e.target.value)}
              />
            </div>
          </>
        );

      case 'http_request':
        return (
          <>
            <div className="space-y-2">
              <Label>Method</Label>
              <Select value={node.data.method || 'GET'} onValueChange={(val) => handleUpdate('method', val)}>
                <SelectTrigger><SelectValue placeholder="Method" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>URL</Label>
              <Input
                placeholder="https://api.example.com"
                value={node.data.url || ''}
                onChange={(e) => handleUpdate('url', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Body (JSON)</Label>
              <Textarea
                placeholder="{}"
                value={node.data.body || ''}
                onChange={(e) => handleUpdate('body', e.target.value)}
              />
            </div>
          </>
        );

      case 'delay':
        return (
          <div className="space-y-2">
            <Label>Delay (ms)</Label>
            <Input
              type="number"
              placeholder="5000"
              value={node.data.delayMs || ''}
              onChange={(e) => handleUpdate('delayMs', parseInt(e.target.value, 10))}
            />
          </div>
        );

      default:
        return <div className="text-sm text-muted-foreground">No specific configuration for this node.</div>;
    }
  };

  return (
    <div className="w-80 border-l border-border bg-card flex flex-col h-full absolute right-0 top-0 bottom-0 z-10 shadow-xl">
      <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
        <div>
          <h3 className="font-semibold capitalize">{node.type.replace('_', ' ')} Node</h3>
          <p className="text-xs text-muted-foreground mt-1">Configure node settings</p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
          <XIcon className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
        <div className="space-y-2">
          <Label>Node Label</Label>
          <Input
            placeholder="Custom Label"
            value={node.data.label || ''}
            onChange={(e) => handleUpdate('label', e.target.value)}
          />
        </div>

        <div className="h-px bg-border w-full" />

        {renderFields()}
      </div>

      <div className="p-4 border-t border-border">
        <Button variant="destructive" className="w-full" onClick={() => onDelete(node.id)}>
          <Trash2Icon className="w-4 h-4 mr-2" />
          Delete Node
        </Button>
      </div>
    </div>
  );
}
