import { Edge, Node } from "reactflow";

export type AgentStage = "探索" | "验证" | "量产";
export type NodeKind = "start" | "agent" | "human" | "end";
export type NodeStatus =
  | "未运行"
  | "运行中"
  | "已完成"
  | "等待人工确认"
  | "执行失败";

export interface AgentDefinition {
  id: string;
  name: string;
  description: string;
  stage: AgentStage;
  inputSchema: string;
  outputSchema: string;
}

export interface WorkflowNodeData {
  label: string;
  kind: NodeKind;
  agentId?: string;
  status: NodeStatus;
  outputSummary?: string;
  duration?: number;
  inputs?: Record<string, string>;
}

export type WorkflowNode = Node<WorkflowNodeData>;
export type WorkflowEdge = Edge;

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
}

export interface HumanPending {
  nodeId: string;
  approveTarget?: string;
  rejectTarget?: string;
}

export interface EngineState {
  status: "idle" | "running" | "paused" | "stopped";
  pending?: HumanPending;
}
