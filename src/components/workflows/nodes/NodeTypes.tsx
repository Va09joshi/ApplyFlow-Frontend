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
  ClockIcon 
} from 'lucide-react';

export const nodeTypes = {
  trigger: (props: any) => <BaseNode {...props} icon={MailIcon} title="Trigger" colorClass="bg-purple-500" isTrigger />,
  filter: (props: any) => <BaseNode {...props} icon={FilterIcon} title="Filter" colorClass="bg-slate-500" />,
  ai_classify: (props: any) => <BaseNode {...props} icon={BrainCircuitIcon} title="AI Classify" colorClass="bg-indigo-500" />,
  send_email: (props: any) => <BaseNode {...props} icon={SendIcon} title="Send Email" colorClass="bg-green-500" />,
  move_stage: (props: any) => <BaseNode {...props} icon={ArrowRightLeftIcon} title="Move Stage" colorClass="bg-orange-500" />,
  job_search: (props: any) => <BaseNode {...props} icon={SearchIcon} title="Job Search" colorClass="bg-teal-500" />,
  score_job: (props: any) => <BaseNode {...props} icon={TargetIcon} title="Score Job" colorClass="bg-rose-500" />,
  http_request: (props: any) => <BaseNode {...props} icon={GlobeIcon} title="HTTP Request" colorClass="bg-sky-500" />,
  delay: (props: any) => <BaseNode {...props} icon={ClockIcon} title="Delay" colorClass="bg-amber-500" />
};
