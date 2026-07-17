import React from 'react';
import {
  MailIcon,
  FilterIcon,
  BrainCircuitIcon,
  SendIcon,
  ArrowRightLeftIcon,
  SearchIcon,
  TargetIcon,
  GlobeIcon,
  ClockIcon,
  GripVerticalIcon,
  WebhookIcon
} from 'lucide-react';
import { FaWhatsapp, FaSlack, FaDiscord, FaLinkedin, FaMedal } from 'react-icons/fa';
import { SiGooglesheets } from 'react-icons/si';

const NODE_TYPES = [
  { type: 'trigger', label: 'Trigger', icon: MailIcon, color: 'text-purple-500' },
  { type: 'filter', label: 'Filter', icon: FilterIcon, color: 'text-slate-500' },
  { type: 'ai_classify', label: 'AI Classify', icon: BrainCircuitIcon, color: 'text-indigo-500' },
  { type: 'send_email', label: 'Send Email', icon: SendIcon, color: 'text-green-500' },
  { type: 'move_stage', label: 'Move Stage', icon: ArrowRightLeftIcon, color: 'text-orange-500' },
  { type: 'job_search', label: 'Job Search', icon: SearchIcon, color: 'text-teal-500' },
  { type: 'score_job', label: 'Score Job', icon: TargetIcon, color: 'text-rose-500' },
  { type: 'http_request', label: 'HTTP Request', icon: GlobeIcon, color: 'text-sky-500' },
  { type: 'delay', label: 'Delay', icon: ClockIcon, color: 'text-amber-500' },
  { type: 'google_sheets', label: 'Google Sheets', icon: SiGooglesheets, color: 'text-[#0F9D58]' },
  { type: 'webhook', label: 'Webhook', icon: WebhookIcon, color: 'text-pink-500' },
  { type: 'whatsapp', label: 'WhatsApp / SMS', icon: FaWhatsapp, color: 'text-[#25D366]' },
  { type: 'slack', label: 'Slack Message', icon: FaSlack, color: 'text-[#4A154B]' },
  { type: 'discord', label: 'Discord Message', icon: FaDiscord, color: 'text-[#5865F2]' },
  { type: 'post_job', label: 'Post to LinkedIn', icon: FaLinkedin, color: 'text-[#0A66C2]' },
  { type: 'award_badge', label: 'Award Badge', icon: FaMedal, color: 'text-[#FFA116]' },
];

export function NodeSidebar() {
  const onDragStart = (event: React.DragEvent, nodeType: string, label: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/reactflow-label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 border-r border-border bg-card flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold">Node Palette</h3>
        <p className="text-xs text-muted-foreground mt-1">Drag nodes onto the canvas to build your workflow</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 pb-24">
        {NODE_TYPES.map((node) => (
          <div
            key={node.type}
            className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background hover:border-primary/50 hover:shadow-sm cursor-grab active:cursor-grabbing transition-all group"
            onDragStart={(event) => onDragStart(event, node.type, node.label)}
            draggable
          >
            <GripVerticalIcon className="w-4 h-4 text-muted-foreground opacity-50 group-hover:opacity-100" />
            <node.icon className={`w-5 h-5 ${node.color}`} />
            <span className="text-sm font-medium">{node.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
