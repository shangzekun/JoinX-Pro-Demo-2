import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import { Edge } from "reactflow";
import { agents } from "./agents";
import { runWorkflow } from "./mockEngine";
import {
  EngineState,
  LogEntry,
  WorkflowEdge,
  WorkflowNode,
  WorkflowNodeData
} from "./types";
import { formatTime } from "./workflowUtils";

interface WorkflowState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selected?: string;
  logs: LogEntry[];
  engine: EngineState;
  setNodes: (nodes: WorkflowNode[]) => void;
  addAgentNode: (agentId: string, position: { x: number; y: number }) => void;
  addHumanNode: (position: { x: number; y: number }) => void;
  updateNode: (id: string, data: Partial<WorkflowNodeData>) => void;
  setEdges: (edges: Edge[]) => void;
  removeEdge: (edgeId: string) => void;
  removeNode: (nodeId: string) => void;
  setSelected: (id?: string) => void;
  appendLog: (message: string) => void;
  run: () => Promise<void>;
  continueAfterHuman: (decision: "approve" | "reject") => Promise<void>;
  resetStatuses: () => void;
}

const baseNodes: WorkflowNode[] = [
  {
    id: "start",
    type: "input",
    position: { x: 120, y: 150 },
    data: { label: "开始", kind: "start", status: "未运行" }
  },
  {
    id: "end",
    type: "output",
    position: { x: 650, y: 150 },
    data: { label: "结束", kind: "end", status: "未运行" }
  }
];

export const useWorkflowStore = create<WorkflowState>()(
  persist(
    (set, get) => ({
      nodes: baseNodes,
      edges: [
        {
          id: "start-end",
          source: "start",
          target: "end",
          animated: true,
          label: "默认路径"
        }
      ],
      selected: undefined,
      logs: [],
      engine: { status: "idle" },
      setNodes: (nodes) => set({ nodes }),
      addAgentNode: (agentId, position) => {
        const def = agents.find((a) => a.id === agentId);
        const id = nanoid();
        const newNode: WorkflowNode = {
          id,
          type: "default",
          position,
          data: {
            label: def?.name ?? "自定义节点",
            kind: "agent",
            agentId,
            status: "未运行",
            inputs: { 备注: "可编辑参数" }
          }
        };
        set((state) => ({ nodes: [...state.nodes, newNode] }));
      },
      addHumanNode: (position) => {
        const id = nanoid();
        const newNode: WorkflowNode = {
          id,
          type: "default",
          position,
          data: {
            label: "人工确认",
            kind: "human",
            status: "未运行",
            inputs: { 关注点: "确认过程风险与资源" }
          }
        };
        set((state) => ({ nodes: [...state.nodes, newNode] }));
      },
      updateNode: (id, data) =>
        set((state) => ({
          nodes: state.nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...data } } : n))
        })),
      setEdges: (edges) => set({ edges }),
      removeEdge: (edgeId) =>
        set((state) => ({
          edges: state.edges.filter((edge) => edge.id !== edgeId)
        })),
      removeNode: (nodeId) =>
        set((state) => ({
          nodes: state.nodes.filter((n) => n.id !== nodeId),
          edges: state.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
          selected: state.selected === nodeId ? undefined : state.selected
        })),
      setSelected: (id) => set({ selected: id }),
      appendLog: (message) =>
        set((state) => ({
          logs: [
            ...state.logs,
            { id: nanoid(), timestamp: formatTime(), message }
          ]
        })),
      resetStatuses: () =>
        set((state) => ({
          nodes: state.nodes.map((n) => ({
            ...n,
            data: { ...n.data, status: "未运行", outputSummary: undefined, duration: undefined }
          }))
        })),
      run: async () => {
        const { nodes, edges } = get();
        set({ logs: [] });
        get().resetStatuses();
        const callbacks = {
          updateNode: (id: string, data: Partial<WorkflowNodeData>) => get().updateNode(id, data),
          appendLog: (msg: string) => get().appendLog(msg),
          setState: (engine: EngineState) => set({ engine })
        };
        await runWorkflow(nodes, edges, callbacks);
      },
      continueAfterHuman: async (decision) => {
        const { engine, edges, nodes } = get();
        if (engine.status !== "paused" || !engine.pending) return;
        const pendingId = engine.pending.nodeId;
        get().updateNode(pendingId, { status: "运行中" });
        get().appendLog(`[${formatTime()}] 工程师${decision === "approve" ? "批准" : "驳回"}节点：${pendingId}`);
        const targetId =
          decision === "approve" ? engine.pending.approveTarget : engine.pending.rejectTarget;
        if (!targetId) {
          set({ engine: { status: "idle" } });
          return;
        }
        const callbacks = {
          updateNode: (id: string, data: Partial<WorkflowNodeData>) => get().updateNode(id, data),
          appendLog: (msg: string) => get().appendLog(msg),
          setState: (engineState: EngineState) => set({ engine: engineState })
        };
        const nextNode = nodes.find((n) => n.id === targetId);
        if (!nextNode) {
          set({ engine: { status: "idle" } });
          return;
        }
        set({ engine: { status: "running" } });
        await runWorkflow([...nodes], edges, callbacks);
      }
    }),
    {
      name: "joinx-workflow"
    }
  )
);
