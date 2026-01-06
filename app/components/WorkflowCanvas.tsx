"use client";

import React, { useCallback } from "react";
import ReactFlow, {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  MarkerType,
  MiniMap,
  OnConnect,
  ReactFlowInstance,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
  type EdgeChange,
  type NodeChange,
} from "reactflow";

import "reactflow/dist/style.css";

import { useWorkflowStore } from "@/lib/state";
import { WorkflowNode } from "@/lib/types";

export default function WorkflowCanvas() {
  const storeNodes = useWorkflowStore((s) => s.nodes);
  const storeEdges = useWorkflowStore((s) => s.edges);
  const setEdgesToStore = useWorkflowStore((s) => s.setEdges);
  const setNodesToStore = useWorkflowStore((s) => s.setNodes);
  const setSelected = useWorkflowStore((s) => s.setSelected);
  const removeEdge = useWorkflowStore((s) => s.removeEdge);
  const removeNode = useWorkflowStore((s) => s.removeNode);
  const addAgentNode = useWorkflowStore((s) => s.addAgentNode);
  const addHumanNode = useWorkflowStore((s) => s.addHumanNode);

  const [nodes, setNodes] = useNodesState<WorkflowNode>(storeNodes);
  const [edges, setEdges] = useEdgesState(storeEdges);
  const [flowInstance, setFlowInstance] = React.useState<ReactFlowInstance | null>(null);

  React.useEffect(() => {
    setNodes(storeNodes);
    setEdges(storeEdges);
  }, [storeNodes, storeEdges, setNodes, setEdges]);

  const onConnect: OnConnect = useCallback(
    (params: Connection) => {
      const updated = addEdge(
        {
          ...params,
          label: params.label ?? "数据流",
          animated: true,
          markerEnd: { type: MarkerType.ArrowClosed, color: "#2563eb" },
          style: { stroke: "#2563eb" }
        },
        edges
      );
      setEdges(updated);
      setEdgesToStore(updated);
    },
    [edges, setEdges, setEdgesToStore]
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const reactFlowBounds = (event.target as HTMLDivElement).getBoundingClientRect();
      const type = event.dataTransfer.getData("application/reactflow");
      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top
      };
      if (type === "human") {
        addHumanNode(position);
      } else if (type) {
        addAgentNode(type, position);
      }
    },
    [addAgentNode, addHumanNode]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onInit = (instance: ReactFlowInstance) => {
    setFlowInstance(instance);
    instance.fitView();
  };

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => {
        const next = applyNodeChanges(changes, nds);
        setNodesToStore(next);
        return next;
      });
    },
    [setNodes, setNodesToStore]
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => {
        const next = applyEdgeChanges(changes, eds);
        setEdgesToStore(next);
        return next;
      });
    },
    [setEdges, setEdgesToStore]
  );

  const alignToGrid = useCallback(() => {
    setNodes((nds) => {
      const aligned = nds.map((node) => ({
        ...node,
        position: {
          x: Math.round(node.position.x / 40) * 40,
          y: Math.round(node.position.y / 40) * 40
        }
      }));
      setNodesToStore(aligned);
      return aligned;
    });
  }, [setNodes, setNodesToStore]);

  const resetView = useCallback(() => {
    flowInstance?.fitView({ padding: 0.2 });
  }, [flowInstance]);

  return (
    <div className="flex-1 bg-slate-100 relative">
      <div className="absolute top-3 left-3 z-10 flex gap-2">
        <button
          onClick={alignToGrid}
          className="rounded bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow border border-slate-200"
        >
          自动网格对齐
        </button>
        <button
          onClick={resetView}
          className="rounded bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow border border-slate-200"
        >
          重置视图
        </button>
      </div>
      <ReactFlow
        nodes={nodes as Node[]}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onInit={onInit}
        onNodeClick={(_, node) => setSelected(node.id)}
        onPaneClick={() => setSelected(undefined)}
        onNodesDelete={(deleted) => deleted.forEach((n) => removeNode(n.id))}
        onEdgesDelete={(deleted) => deleted.forEach((edge) => removeEdge(edge.id))}
        fitView
        snapToGrid
        snapGrid={[24, 24]}
        defaultEdgeOptions={{
          animated: true,
          markerEnd: { type: MarkerType.ArrowClosed, color: "#1d4ed8" },
          style: { stroke: "#1d4ed8" },
          label: "数据流"
        }}
        connectionLineStyle={{ stroke: "#2563eb" }}
      >
        <Background gap={16} color="#e2e8f0" />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
