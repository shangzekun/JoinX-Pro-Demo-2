"use client";
import React, { useCallback } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Connection,
  Controls,
  MiniMap,
  Node,
  OnConnect,
  ReactFlowInstance,
  useEdgesState,
  useNodesState
} from "react-flow-renderer";
import { useWorkflowStore } from "@/lib/state";
import { WorkflowNode } from "@/lib/types";

export default function WorkflowCanvas() {
  const storeNodes = useWorkflowStore((s) => s.nodes);
  const storeEdges = useWorkflowStore((s) => s.edges);
  const setEdgesToStore = useWorkflowStore((s) => s.setEdges);
  const setSelected = useWorkflowStore((s) => s.setSelected);
  const addAgentNode = useWorkflowStore((s) => s.addAgentNode);
  const addHumanNode = useWorkflowStore((s) => s.addHumanNode);

  const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowNode>(storeNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(storeEdges);

  React.useEffect(() => {
    setNodes(storeNodes);
    setEdges(storeEdges);
  }, [storeNodes, storeEdges, setNodes, setEdges]);

  const onConnect: OnConnect = useCallback(
    (params: Connection) => {
      const updated = addEdge({ ...params, label: "流程" }, edges);
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

  const onInit = (instance: ReactFlowInstance) => instance.fitView();

  return (
    <div className="flex-1 bg-slate-100">
      <ReactFlow
        nodes={nodes as Node[]}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onInit={onInit}
        onNodeClick={(_, node) => setSelected(node.id)}
        fitView
      >
        <Background gap={16} color="#e2e8f0" />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
