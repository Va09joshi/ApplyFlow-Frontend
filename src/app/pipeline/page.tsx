"use client";

import React, { useEffect, useState } from "react";
import KanbanBoard from "@/components/pipeline/KanbanBoard";
import { Application } from "@/types/pipeline"; // Need to create this type

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
      // Replace with your actual api endpoint
      const response = await fetch("/api/v1/applications/pipeline", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      const data = await response.json();
      
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
      const response = await fetch(`/api/v1/applications/${appId}/move`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ to: toStage, note: "Moved via drag" })
      });
      
      const data = await response.json();
      if (data.success) {
        // Optionally update history from response
        setApplications(apps => 
          apps.map(app => app._id === appId ? { ...app, stageHistory: data.data.stageHistory } : app)
        );
      } else {
        // Revert on error
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
