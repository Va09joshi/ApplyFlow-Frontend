import { BaseNode } from './BaseNode';
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
  WebhookIcon
} from 'lucide-react';
import { FaWhatsapp, FaSlack, FaDiscord, FaLinkedin, FaMedal } from 'react-icons/fa';
import { SiGooglesheets } from 'react-icons/si';

export const nodeTypes = {
  trigger: (props: any) => <BaseNode {...props} icon={MailIcon} title="Trigger" colorClass="bg-purple-500" isTrigger />,
  filter: (props: any) => <BaseNode {...props} icon={FilterIcon} title="Filter" colorClass="bg-slate-500" />,
  ai_classify: (props: any) => <BaseNode {...props} icon={BrainCircuitIcon} title="AI Classify" colorClass="bg-indigo-500" />,
  send_email: (props: any) => <BaseNode {...props} icon={SendIcon} title="Send Email" colorClass="bg-green-500" />,
  move_stage: (props: any) => <BaseNode {...props} icon={ArrowRightLeftIcon} title="Move Stage" colorClass="bg-orange-500" />,
  job_search: (props: any) => <BaseNode {...props} icon={SearchIcon} title="Job Search" colorClass="bg-teal-500" />,
  score_job: (props: any) => <BaseNode {...props} icon={TargetIcon} title="Score Job" colorClass="bg-rose-500" />,
  http_request: (props: any) => <BaseNode {...props} icon={GlobeIcon} title="HTTP Request" colorClass="bg-sky-500" />,
  delay: (props: any) => <BaseNode {...props} icon={ClockIcon} title="Delay" colorClass="bg-amber-500" />,
  google_sheets: (props: any) => <BaseNode {...props} icon={SiGooglesheets} title="Google Sheets" colorClass="bg-[#0F9D58]" />,
  webhook: (props: any) => <BaseNode {...props} icon={WebhookIcon} title="Webhook" colorClass="bg-pink-500" />,
  whatsapp: (props: any) => <BaseNode {...props} icon={FaWhatsapp} title="WhatsApp / SMS" colorClass="bg-[#25D366]" />,
  slack: (props: any) => <BaseNode {...props} icon={FaSlack} title="Slack Message" colorClass="bg-[#4A154B]" />,
  discord: (props: any) => <BaseNode {...props} icon={FaDiscord} title="Discord Message" colorClass="bg-[#5865F2]" />,
  post_job: (props: any) => <BaseNode {...props} icon={FaLinkedin} title="Post to LinkedIn" colorClass="bg-[#0A66C2]" />,
  award_badge: (props: any) => <BaseNode {...props} icon={FaMedal} title="Award Badge" colorClass="bg-[#FFA116]" />,
  check_duplicate: (props: any) => <BaseNode {...props} icon={FilterIcon} title="Check Duplicate" colorClass="bg-slate-600" />,
  job_save: (props: any) => <BaseNode {...props} icon={SearchIcon} title="Save Job" colorClass="bg-teal-600" />,
  select_resume: (props: any) => <BaseNode {...props} icon={FilterIcon} title="Select Resume" colorClass="bg-indigo-400" />,
  move_application_stage: (props: any) => <BaseNode {...props} icon={ArrowRightLeftIcon} title="Move App Stage" colorClass="bg-orange-500" />,
  find_hr: (props: any) => <BaseNode {...props} icon={SearchIcon} title="Find HR" colorClass="bg-fuchsia-500" />,
  send_linkedin_message: (props: any) => <BaseNode {...props} icon={FaLinkedin} title="LinkedIn Message" colorClass="bg-[#0A66C2]" />,
  set_context: (props: any) => <BaseNode {...props} icon={BrainCircuitIcon} title="Set Context" colorClass="bg-zinc-500" />
};
