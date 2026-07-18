import React from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { LucideIcon, Trash2Icon, CheckCircle2Icon, XCircleIcon } from 'lucide-react';

export interface BaseNodeProps {
  id: string;
  data: any;
  selected?: boolean;
  icon: LucideIcon;
  title: string;
  colorClass?: string;
  isTrigger?: boolean;
}

export function BaseNode({ id, data, selected, icon: Icon, title, colorClass = "bg-blue-500", isTrigger = false }: BaseNodeProps) {
  const { setNodes, setEdges } = useReactFlow();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((nodes) => nodes.filter((n) => n.id !== id));
    setEdges((edges) => edges.filter((edge) => edge.source !== id && edge.target !== id));
  };

  return (
    <div
      className={cn(
        "relative flex flex-col min-w-[260px] bg-card/95 backdrop-blur-md rounded-2xl border transition-all duration-300 group overflow-hidden shadow-sm hover:shadow-xl",
        selected 
          ? "border-primary/60 shadow-[0_8px_30px_rgb(0,0,0,0.12)] shadow-primary/20 ring-1 ring-primary/30 -translate-y-0.5" 
          : "border-border/40 hover:border-border/80",
        data.runStatus === 'success' && "border-green-500 shadow-[0_0_20px_rgb(34,197,94,0.3)] ring-1 ring-green-500",
        data.runStatus === 'failed' && "border-red-500 shadow-[0_0_20px_rgb(239,68,68,0.3)] ring-1 ring-red-500"
      )}
    >
      {/* Decorative gradient top bar */}
      <div className={cn("absolute top-0 left-0 right-0 h-1", colorClass)} />
      
      {data.runStatus === 'success' && (
        <div className="absolute top-[-4px] right-[-4px] bg-green-500 text-white p-1 rounded-full shadow-md z-20">
          <CheckCircle2Icon className="w-3 h-3" />
        </div>
      )}
      {data.runStatus === 'failed' && (
        <div className="absolute top-[-4px] right-[-4px] bg-red-500 text-white p-1 rounded-full shadow-md z-20">
          <XCircleIcon className="w-3 h-3" />
        </div>
      )}

      {/* Top Handle (Input) */}
      {!isTrigger && (
        <Handle
          type="target"
          position={Position.Top}
          className="w-3.5 h-3.5 bg-background border-[2.5px] border-primary rounded-full transition-transform hover:scale-125 z-10 top-[-7px]"
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/20 bg-muted/10">
        <div className="flex items-center gap-3.5">
          <div className={cn("flex items-center justify-center w-8 h-8 rounded-xl text-white shadow-sm ring-1 ring-white/10", colorClass)}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-bold tracking-tight leading-none text-foreground">{title}</span>
            <span className="text-[10px] text-muted-foreground mt-1.5 capitalize leading-none font-medium truncate max-w-[120px]">
              {data.label || 'Unconfigured'}
            </span>
          </div>
        </div>
        
        {/* Delete Button (Visible on hover or selected) */}
        <button
          onClick={handleDelete}
          className={cn(
            "p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all",
            selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
          title="Delete Node"
        >
          <Trash2Icon className="w-4 h-4" />
        </button>
      </div>

      {/* Body / Preview */}
      <div className="px-4 py-3.5 text-xs text-muted-foreground flex flex-col gap-2 min-h-[48px] bg-background/50 rounded-b-2xl">
        {Object.entries(data).filter(([k]) => k !== 'label' && k !== 'runStatus').length > 0 ? (
          Object.entries(data).filter(([k]) => k !== 'label' && k !== 'runStatus').slice(0, 3).map(([key, value]) => {
            if (key === 'label') return null;
            return (
              <div key={key} className="flex justify-between items-center overflow-hidden gap-3">
                <span className="opacity-70 truncate max-w-[80px] uppercase text-[9px] font-bold tracking-wider">{key}</span>
                <span className="font-semibold truncate flex-1 text-right text-foreground/90 bg-muted/40 px-2 py-1 rounded-md border border-border/30">
                  {String(value)}
                </span>
              </div>
            );
          })
        ) : (
          <span className="italic opacity-50 text-center w-full block py-2 text-[11px]">Select to configure properties</span>
        )}
      </div>

      {/* Bottom Handle (Output) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3.5 h-3.5 bg-background border-[2.5px] border-primary rounded-full transition-transform hover:scale-125 z-10 bottom-[-7px]"
      />
    </div>
  );
}
