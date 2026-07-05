import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Application } from "@/types/pipeline";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, ClockIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ApplicationCardProps {
  application: Application;
}

export default function ApplicationCard({ application }: ApplicationCardProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: application.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Only open dialog if we are not dragging
    setIsDetailOpen(true);
  };

  return (
    <>
      <div 
        ref={setNodeRef} 
        style={style} 
        {...attributes} 
        {...listeners}
      >
        <Card 
          className="cursor-grab hover:shadow-md transition-shadow active:cursor-grabbing border-l-4 border-l-blue-500 hover:border-l-blue-600 bg-white dark:bg-slate-900"
          onClick={handleCardClick}
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-[15px] leading-tight line-clamp-1">{application.candidateName || "Unknown Candidate"}</h4>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-3">{application.role || "Role not specified"}</p>
            
            <div className="flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <ClockIcon className="w-3 h-3" />
                <span>
                  {application.appliedAt ? formatDistanceToNow(new Date(application.appliedAt), { addSuffix: true }) : "Unknown time"}
                </span>
              </div>
              {application.stageHistory && application.stageHistory.length > 0 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {application.stageHistory.length} moves
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div>
              <h3 className="text-xl font-bold">{application.candidateName}</h3>
              <p className="text-muted-foreground">{application.role}</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Timeline</h4>
              <div className="space-y-4 pl-2 border-l-2 border-blue-100 dark:border-blue-900 ml-2 mt-4">
                {application.stageHistory?.map((history, idx) => (
                  <div key={idx} className="relative pl-6">
                    <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-1.5 ring-4 ring-white dark:ring-gray-950"></div>
                    <div className="text-sm font-medium">Moved to {history.to}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <CalendarIcon className="w-3 h-3" />
                      {new Date(history.at).toLocaleString()} {history.by && `by ${history.by}`}
                    </div>
                    {history.note && (
                      <div className="text-xs mt-1 bg-muted p-2 rounded-md italic">
                        "{history.note}"
                      </div>
                    )}
                  </div>
                ))}
                {(!application.stageHistory || application.stageHistory.length === 0) && (
                  <div className="text-sm text-muted-foreground italic">No history available</div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
