import React, { useState } from "react";
import { DndContext, DragEndEvent, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { Application } from "@/types/pipeline";
import KanbanColumn from "./KanbanColumn";

interface KanbanBoardProps {
  stages: string[];
  applications: Application[];
  onDragEnd: (appId: string, toStage: string) => void;
}

export default function KanbanBoard({ stages, applications, onDragEnd }: KanbanBoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const appId = String(active.id);
    // over.id can be either a column id or an item id
    // We pass the column id in SortableContext but actually we just need to find which stage it was dropped into.
    // If over is an item, we find its stage. If it's a column, over.id is the stage.
    let toStage = String(over.id);

    // If over.id is an appId, find the app's currentStage
    const overApp = applications.find(app => app._id === over.id);
    if (overApp) {
      toStage = overApp.currentStage;
    }

    const activeApp = applications.find(app => app._id === appId);
    
    if (activeApp && activeApp.currentStage !== toStage) {
      onDragEnd(appId, toStage);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="flex h-full gap-4 overflow-x-auto pb-4 items-start">
        <SortableContext items={stages} strategy={horizontalListSortingStrategy}>
          {stages.map(stage => {
            const columnApps = applications.filter(app => app.currentStage === stage);
            return (
              <KanbanColumn 
                key={stage} 
                stage={stage} 
                applications={columnApps} 
              />
            );
          })}
        </SortableContext>
      </div>
    </DndContext>
  );
}
