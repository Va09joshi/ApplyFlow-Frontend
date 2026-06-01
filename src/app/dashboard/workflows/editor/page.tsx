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
import { ArrowLeftIcon, SaveIcon, PlayIcon, CheckCircle2Icon, Loader2Icon } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

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
  const [isSaving, setIsSaving] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (workflowId) {
      fetchWorkflow();
    }
  }, [workflowId]);

  const fetchWorkflow = async () => {
    try {
      const { data } = await api.get(`/api/v1/workflows/${workflowId}`);
      if (data.success && data.data) {
        setWorkflowName(data.data.name);
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
        nodes,
        edges,
        trigger: triggerNode ? { type: 'gmail.email.received', config: triggerNode.data } : { type: 'manual' }
      };

      if (workflowId) {
        await api.patch(`/api/v1/workflows/${workflowId}`, payload);
        toast.success("Workflow saved");
      } else {
        const { data } = await api.post('/api/v1/workflows', payload);
        toast.success("Workflow created");
        router.replace(`/dashboard/workflows/editor?id=${data.data._id}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save workflow");
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
      const mockPayload = triggerNode ? {
        from: 'candidate@example.com',
        subject: 'My Application',
        html: '<p>Here is my application.</p>',
        plainText: 'Here is my application.',
        companyId: triggerNode.data?.companyId
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
      <div className="h-14 border-b border-border bg-card flex items-center justify-between px-4 shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/workflows')}>
            <ArrowLeftIcon className="w-5 h-5" />
          </Button>
          <Input 
            className="w-64 font-semibold text-lg border-transparent hover:border-border focus:border-primary bg-transparent" 
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
          />
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
