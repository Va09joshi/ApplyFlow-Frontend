import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Application } from "@/types/pipeline";
import ApplicationCard from "./ApplicationCard";

interface KanbanColumnProps {
  stage: string;
  applications: Application[];
}

export default function KanbanColumn({ stage, applications }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: stage,
  });

  return (
    <div className="flex flex-col w-80 bg-gray-100 dark:bg-gray-800/50 rounded-xl p-4 flex-shrink-0 max-h-full overflow-hidden">
      <div className="flex justify-between items-center mb-4 px-1">
        <h3 className="font-semibold text-lg capitalize">{stage}</h3>
        <span className="bg-gray-200 dark:bg-gray-700 text-sm py-1 px-2 rounded-full font-medium">
          {applications.length}
        </span>
      </div>
      
      <div 
        ref={setNodeRef} 
        className="flex-1 overflow-y-auto min-h-[150px] space-y-3 p-1"
      >
        <SortableContext 
          items={applications.map(app => app.id)} 
          strategy={verticalListSortingStrategy}
        >
          {applications.map(app => (
            <ApplicationCard key={app.id} application={app} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
