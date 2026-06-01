"use client";

import React, { useEffect, useState } from "react";
import KanbanBoard from "@/components/pipeline/KanbanBoard";
import { Application } from "@/types/pipeline"; // Need to create this type
import { api } from "@/lib/api";

export default function PipelinePage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [stages, setStages] = useState<string[]>(["applied", "screening", "interview", "offered", "rejected"]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPipelineData();
  }, []);

  const fetchPipelineData = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/v1/applications/pipeline");
      
      if (data.success) {
        setApplications(data.data.applications || []);
        if (data.data.stages && data.data.stages.length > 0) {
          setStages(data.data.stages);
        }
      }
    } catch (error) {
      console.error("Failed to fetch pipeline data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (appId: string, toStage: string) => {
    // Optimistic update
    setApplications(apps => 
      apps.map(app => app._id === appId ? { ...app, currentStage: toStage } : app)
    );

    try {
      const { data } = await api.patch(`/api/v1/applications/${appId}/move`, {
        to: toStage, note: "Moved via drag"
      });
      
      if (data.success) {
        // Optionally update history from response
        setApplications(apps => 
          apps.map(app => app._id === appId ? { ...app, stageHistory: data.data.stageHistory } : app)
        );
      } else {
        fetchPipelineData();
      }
    } catch (error) {
      console.error("Failed to move application:", error);
      fetchPipelineData(); // Revert
    }
  };

  if (loading) return <div className="p-8">Loading Pipeline...</div>;

  return (
    <div className="p-8 h-screen flex flex-col">
      <h1 className="text-3xl font-bold mb-6">Pipeline Kanban Board</h1>
      <div className="flex-1 overflow-hidden">
        <KanbanBoard 
          stages={stages} 
          applications={applications} 
          onDragEnd={handleDragEnd} 
        />
      </div>
    </div>
  );
}
