import { Edge } from "react-flow-renderer";
import { WorkflowNode } from "./types";

export const formatTime = () => {
  const now = new Date();
  return now.toTimeString().split(" ")[0];
};

export const findStartNode = (nodes: WorkflowNode[]) =>
  nodes.find((n) => n.data.kind === "start");

export const findEndNode = (nodes: WorkflowNode[]) => nodes.find((n) => n.data.kind === "end");

export const findNextTarget = (edges: Edge[], sourceId: string, label?: string) => {
  const candidates = edges.filter((e) => e.source === sourceId);
  if (label) {
    const matched = candidates.find((c) => c.label === label);
    if (matched) return matched.target;
  }
  return candidates[0]?.target;
};
