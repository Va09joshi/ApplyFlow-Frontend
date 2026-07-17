"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ReactFlow, ReactFlowProvider, addEdge, useNodesState, useEdgesState, Controls, Background, BackgroundVariant, Connection, Edge, Node, ReactFlowInstance } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { nodeTypes } from '@/components/workflows/nodes/NodeTypes';
import { NodeSidebar } from '@/components/workflows/NodeSidebar';
import { ConfigPanel } from '@/components/workflows/ConfigPanel';
import { RunLogsTray } from '@/components/workflows/RunLogsTray';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeftIcon, SaveIcon, PlayIcon, CheckCircle2Icon, Loader2Icon, SparklesIcon } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { UpgradeProModal } from '@/components/modals/UpgradeProModal';

let id = 1;
const getId = () => `node_${id++}`;

function WorkflowEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workflowId = searchParams.get('id');

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    if (workflowId) {
      fetchWorkflow();
    }
  }, [workflowId]);

  const handleAIGenerate = async (directPrompt?: string) => {
    const textToUse = typeof directPrompt === 'string' ? directPrompt : prompt;
    if (!textToUse.trim()) return;
    
    setIsGenerating(true);
    try {
      const { data } = await api.post('/api/v1/workflows/generate', { prompt: textToUse });
      
      const payload = data.data || data; // Handle both wrapped and direct structures
      
      if (payload && payload.nodes && payload.edges) {
         setNodes(payload.nodes);
         setEdges(payload.edges);
         setPrompt("");
         toast.success("Workflow generated successfully");
      } else {
        toast.error("Invalid response from AI");
      }
    } catch (error: any) {
      if (error.response?.status === 403) {
        setShowUpgradeModal(true);
      } else {
        console.error("Failed to generate workflow:", error);
        toast.error(error.response?.data?.message || "Failed to generate workflow");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const fetchWorkflow = async () => {
    try {
      const { data } = await api.get(`/api/v1/workflows/${workflowId}`);
      if (data.success && data.data) {
        setWorkflowName(data.data.name);
        setWorkflowDescription(data.data.description || '');
        setNodes(data.data.nodes || []);
        setEdges(data.data.edges || []);
        
        // update internal ID counter
        const maxId = Math.max(0, ...(data.data.nodes || []).map((n: Node) => {
          const match = n.id.match(/\d+/);
          return match ? parseInt(match[0], 10) : 0;
        }));
        id = maxId + 1;
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load workflow');
    }
  };

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const label = event.dataTransfer.getData('application/reactflow-label');

      if (typeof type === 'undefined' || !type) return;
      if (!rfInstance || !reactFlowWrapper.current) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = rfInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode: Node = {
        id: getId(),
        type,
        position,
        data: { label: `${label} Config` },
      };

      setNodes((nds) => nds.concat(newNode));
      setSelectedNode(newNode);
    },
    [rfInstance, setNodes]
  );

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  };

  const onPaneClick = () => {
    setSelectedNode(null);
  };

  const updateNodeData = (nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === nodeId) {
          const updatedNode = { ...n, data: newData };
          if (selectedNode?.id === nodeId) {
            setSelectedNode(updatedNode);
          }
          return updatedNode;
        }
        return n;
      })
    );
  };

  const deleteNode = (nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    setSelectedNode(null);
  };

  const saveWorkflow = async () => {
    try {
      setIsSaving(true);
      
      const triggerNode = nodes.find(n => n.type === 'trigger');
      const payload = {
        name: workflowName,
        description: workflowDescription,
        nodes,
        edges,
        trigger: triggerNode ? { type: 'gmail_sync', config: triggerNode.data } : { type: 'manual' }
      };

      if (workflowId) {
        await api.patch(`/api/v1/workflows/${workflowId}`, payload);
        toast.success("Workflow saved");
      } else {
        const { data } = await api.post('/api/v1/workflows', payload);
        toast.success("Workflow created");
        router.replace(`/dashboard/workflows/editor?id=${data.data.id}`);
      }
    } catch (err: any) {
      if (err.response?.status === 403) {
        setShowUpgradeModal(true);
      } else {
        console.error(err);
        toast.error("Failed to save workflow");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const runWorkflow = async () => {
    if (!workflowId) {
      toast.error("Please save the workflow first");
      return;
    }
    
    try {
      setIsRunning(true);
      // Dispatch event to open log tray automatically
      window.dispatchEvent(new CustomEvent('workflow_log', { 
        detail: {
          id: Math.random().toString(),
          timestamp: Date.now(),
          type: 'SYSTEM',
          status: 'success',
          message: 'Starting Workflow Preview...'
        }
      }));

      // Find trigger node if any, to pass mock data
      const triggerNode = nodes.find(n => n.type === 'trigger');
      const mockEmail = {
        from: triggerNode?.data?.fromContains || 'candidate@example.com',
        subject: triggerNode?.data?.subjectContains || 'My Application',
        html: '<p>Here is my application.</p>',
        plainText: 'Here is my application.',
        companyId: triggerNode?.data?.companyId
      };
      
      const mockPayload = triggerNode ? {
        email: mockEmail,
        ...mockEmail
      } : {};

      const { data } = await api.post(`/api/v1/workflows/${workflowId}/preview`, mockPayload);
      
      if (data.success) {
        toast.success("Workflow execution finished");
      }
    } catch (err) {
      console.error(err);
      toast.error("Workflow execution failed");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background overflow-hidden">
      {/* Top Navbar */}
      <div className="py-2 border-b border-border bg-card flex items-center justify-between px-4 shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/workflows')} className="mt-1">
            <ArrowLeftIcon className="w-5 h-5" />
          </Button>
          <div className="flex flex-col">
            <Input 
              className="w-72 font-bold text-lg border-transparent hover:border-border focus:border-primary bg-transparent h-8 px-2 focus-visible:ring-0 shadow-none" 
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              placeholder="Workflow Name"
            />
            <Input 
              className="w-72 text-sm text-muted-foreground border-transparent hover:border-border focus:border-primary bg-transparent h-7 px-2 focus-visible:ring-0 shadow-none" 
              value={workflowDescription}
              onChange={(e) => setWorkflowDescription(e.target.value)}
              placeholder="Add a description..."
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={runWorkflow} disabled={isRunning || isSaving}>
            <PlayIcon className="w-4 h-4 mr-2" />
            {isRunning ? 'Running...' : 'Preview Run'}
          </Button>
          <Button onClick={saveWorkflow} disabled={isSaving}>
            {isSaving ? <Loader2Icon className="w-4 h-4 mr-2 animate-spin" /> : <SaveIcon className="w-4 h-4 mr-2" />}
            Save Workflow
          </Button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 flex overflow-hidden relative">
        <NodeSidebar />
        
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
            <div className="flex gap-2 bg-card p-2 rounded-lg shadow-md border border-border items-center">
              <Input 
                placeholder="Describe a workflow... (e.g. Receive email -> AI Classify)" 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-[28rem] h-9"
                disabled={isGenerating}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && prompt.trim() && !isGenerating) {
                    handleAIGenerate();
                  }
                }}
              />
              <Button 
                onClick={() => handleAIGenerate()}
                disabled={isGenerating || !prompt.trim()}
                size="sm"
                className="gap-2"
              >
                {isGenerating ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <SparklesIcon className="w-4 h-4" />}
                {isGenerating ? "Generating..." : "Generate AI"}
              </Button>
            </div>
            
            {/* One-Click Presets */}
            <div className="flex gap-2 mt-1">
              <Button 
                variant="secondary" 
                size="sm" 
                className="h-7 text-xs bg-card border shadow-sm"
                onClick={() => {
                  const p = "When an email is received, send an email to the sender saying 'Thank you for your email!'";
                  setPrompt(p);
                  handleAIGenerate(p);
                }}
                disabled={isGenerating}
              >
                Auto-Reply Flow
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                className="h-7 text-xs bg-card border shadow-sm"
                onClick={() => {
                  const p = "When I receive an email, use AI to classify it, and if it's a job match, search for a job and send an email.";
                  setPrompt(p);
                  handleAIGenerate(p);
                }}
                disabled={isGenerating}
              >
                Job Match & Email
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                className="h-7 text-xs bg-card border shadow-sm"
                onClick={() => {
                  const p = "When an email is received, send a Slack message alert and award them the Top 1% Leetcode badge.";
                  setPrompt(p);
                  handleAIGenerate(p);
                }}
                disabled={isGenerating}
              >
                Slack & Gamify
              </Button>
            </div>
          </div>

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setRfInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={{ type: 'smoothstep', animated: true, style: { strokeWidth: 2 } }}
            fitView
            className="bg-background"
          >
            <Background variant={BackgroundVariant.Dots} color="var(--border)" gap={24} size={2} />
            <Controls className="!bg-card !border-border !shadow-md [&>button]:!border-border/50 [&>button]:!bg-card [&>button]:!text-foreground hover:[&>button]:!bg-muted" />
          </ReactFlow>

          <ConfigPanel 
            node={selectedNode} 
            onUpdate={updateNodeData} 
            onDelete={deleteNode} 
            onClose={() => setSelectedNode(null)} 
          />
        </div>
      </div>

      <RunLogsTray />
      <UpgradeProModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
    </div>
  );
}

import { Suspense } from 'react';

export default function WorkflowEditorPage() {
  return (
    <ReactFlowProvider>
      <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading editor...</div>}>
        <WorkflowEditor />
      </Suspense>
    </ReactFlowProvider>
  );
}
