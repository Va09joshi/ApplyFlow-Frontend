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
              <Label>Reply to original thread</Label>
              <Switch
                checked={node.data.replyToOriginalThread !== false}
                onCheckedChange={(checked) => handleUpdate('replyToOriginalThread', checked)}
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
              placeholder="e.g., 5000"
              value={node.data.delayMs || ''}
              onChange={(e) => handleUpdate('delayMs', parseInt(e.target.value))}
            />
          </div>
        );

      case 'google_sheets':
        return (
          <>
            <div className="space-y-2">
              <Label>Action</Label>
              <Select value={node.data.action || 'append_row'} onValueChange={(val) => handleUpdate('action', val)}>
                <SelectTrigger><SelectValue placeholder="Action" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="append_row">Append Row</SelectItem>
                  <SelectItem value="update_row">Update Row</SelectItem>
                  <SelectItem value="read_row">Read Row</SelectItem>
                  <SelectItem value="create_sheet">Create Sheet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Spreadsheet ID</Label>
              <Input
                placeholder="1BxiMVs0XRY..."
                value={node.data.spreadsheetId || ''}
                onChange={(e) => handleUpdate('spreadsheetId', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Sheet Name</Label>
              <Input
                placeholder="Sheet1"
                value={node.data.sheetName || ''}
                onChange={(e) => handleUpdate('sheetName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Data (JSON)</Label>
              <Textarea
                placeholder='{"Name": "{{candidate.name}}", "Status": "Applied"}'
                value={node.data.dataMapping || ''}
                onChange={(e) => handleUpdate('dataMapping', e.target.value)}
              />
            </div>
          </>
        );

      case 'webhook':
        return (
          <>
            <div className="space-y-2">
              <Label>Method</Label>
              <Select value={node.data.method || 'POST'} onValueChange={(val) => handleUpdate('method', val)}>
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
              <Label>Webhook URL</Label>
              <Input
                placeholder="https://hooks.zapier.com/..."
                value={node.data.url || ''}
                onChange={(e) => handleUpdate('url', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Headers (JSON)</Label>
              <Textarea
                placeholder='{"Authorization": "Bearer token"}'
                value={node.data.headers || ''}
                onChange={(e) => handleUpdate('headers', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Payload (JSON)</Label>
              <Textarea
                placeholder="{}"
                value={node.data.payload || ''}
                onChange={(e) => handleUpdate('payload', e.target.value)}
              />
            </div>
          </>
        );

      case 'whatsapp':
        return (
          <>
            <div className="space-y-2">
              <Label>Provider</Label>
              <Select value={node.data.provider || 'whatsapp_cloud'} onValueChange={(val) => handleUpdate('provider', val)}>
                <SelectTrigger><SelectValue placeholder="Provider" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp_cloud">WhatsApp Cloud API</SelectItem>
                  <SelectItem value="twilio">Twilio</SelectItem>
                  <SelectItem value="messagebird">MessageBird</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>API Key / Token</Label>
              <Input
                type="password"
                placeholder="Enter API Key"
                value={node.data.apiKey || ''}
                onChange={(e) => handleUpdate('apiKey', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>From Number (or Sender ID)</Label>
              <Input
                placeholder="e.g. +1234567890"
                value={node.data.fromNumber || ''}
                onChange={(e) => handleUpdate('fromNumber', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>To Number</Label>
              <Input
                placeholder="e.g. {{candidate.phone}}"
                value={node.data.toNumber || ''}
                onChange={(e) => handleUpdate('toNumber', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Message Body</Label>
              <Textarea
                className="min-h-[100px]"
                placeholder="Hi {{candidate.name}}, your interview is scheduled..."
                value={node.data.messageBody || ''}
                onChange={(e) => handleUpdate('messageBody', e.target.value)}
              />
            </div>
          </>
        );

      case 'slack':
        return (
          <>
            <div className="space-y-2">
              <Label>Webhook URL or Bot Token</Label>
              <Input
                type="password"
                placeholder="https://hooks.slack.com/... or xoxb-..."
                value={node.data.webhookUrl || ''}
                onChange={(e) => handleUpdate('webhookUrl', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Channel (Optional)</Label>
              <Input
                placeholder="#general"
                value={node.data.channel || ''}
                onChange={(e) => handleUpdate('channel', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                className="min-h-[100px]"
                placeholder="New candidate applied: {{candidate.name}}"
                value={node.data.message || ''}
                onChange={(e) => handleUpdate('message', e.target.value)}
              />
            </div>
          </>
        );

      case 'discord':
        return (
          <>
            <div className="space-y-2">
              <Label>Webhook URL</Label>
              <Input
                type="password"
                placeholder="https://discord.com/api/webhooks/..."
                value={node.data.webhookUrl || ''}
                onChange={(e) => handleUpdate('webhookUrl', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Message Content</Label>
              <Textarea
                className="min-h-[100px]"
                placeholder="Candidate just passed screening! @recruiter"
                value={node.data.message || ''}
                onChange={(e) => handleUpdate('message', e.target.value)}
              />
            </div>
          </>
        );

      case 'post_job':
        return (
          <>
            <div className="space-y-2">
              <Label>Platform</Label>
              <Select value={node.data.platform || 'linkedin'} onValueChange={(val) => handleUpdate('platform', val)}>
                <SelectTrigger><SelectValue placeholder="Platform" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="indeed">Indeed API</SelectItem>
                  <SelectItem value="custom">Custom Webhook</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>API Key / Access Token</Label>
              <Input
                type="password"
                placeholder="Enter API Key"
                value={node.data.apiKey || ''}
                onChange={(e) => handleUpdate('apiKey', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Job Title</Label>
              <Input
                placeholder="e.g. Senior Frontend Engineer"
                value={node.data.jobTitle || ''}
                onChange={(e) => handleUpdate('jobTitle', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Job Description (or Post Text)</Label>
              <Textarea
                className="min-h-[120px]"
                placeholder="We are hiring a Senior Frontend Engineer! Apply here: {{job.link}}"
                value={node.data.jobDescription || ''}
                onChange={(e) => handleUpdate('jobDescription', e.target.value)}
              />
            </div>
          </>
        );

      case 'award_badge':
        return (
          <>
            <div className="space-y-2">
              <Label>Badge Type</Label>
              <Select value={node.data.badgeType || 'top_1_percent'} onValueChange={(val) => handleUpdate('badgeType', val)}>
                <SelectTrigger><SelectValue placeholder="Badge Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="top_1_percent">🏆 Top 1% Candidate</SelectItem>
                  <SelectItem value="speed_demon">⚡ Speed Demon</SelectItem>
                  <SelectItem value="problem_solver">🧠 Problem Solver</SelectItem>
                  <SelectItem value="communication">💬 Master Communicator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notification Email</Label>
              <Input
                placeholder="e.g. {{candidate.email}}"
                value={node.data.candidateEmail || ''}
                onChange={(e) => handleUpdate('candidateEmail', e.target.value)}
              />
            </div>
          </>
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
