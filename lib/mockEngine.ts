import { agents } from "./agents";
import { formatTime, findNextTarget, findStartNode } from "./workflowUtils";
import {
  EngineState,
  WorkflowEdge,
  WorkflowNode,
  WorkflowNodeData
} from "./types";

const mockOutputs: Record<string, string> = {
  "param-rec": "推荐参数：32kN / 180mm/s",
  "space-explore": "探索完成：识别 12 个可行点，3 个敏感点",
  window: "窗口范围：力 28-36kN，速度 150-220mm/s",
  failure: "风险等级：中；主要模式：铆钉未充分成形",
  robust: "鲁棒性评分：0.82，建议控制力波动 <5%"
};

const mockDurations: Record<string, number> = {
  "param-rec": 1200,
  "space-explore": 1500,
  window: 1000,
  failure: 900,
  robust: 1100
};

export interface EngineCallbacks {
  updateNode: (id: string, data: Partial<WorkflowNodeData>) => void;
  appendLog: (msg: string) => void;
  setState: (state: EngineState) => void;
}

const findAgentName = (agentId?: string) => agents.find((a) => a.id === agentId)?.name ?? "节点";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function runWorkflow(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  callbacks: EngineCallbacks
) {
  callbacks.setState({ status: "running" });
  const start = findStartNode(nodes);
  if (!start) {
    callbacks.appendLog(`[${formatTime()}] ❌ 未找到开始节点，无法执行`);
    callbacks.setState({ status: "stopped" });
    return;
  }
  callbacks.appendLog(`[${formatTime()}] 启动工艺决策流程`);
  let current: WorkflowNode | undefined = start;
  while (current) {
    const data = current.data;
    if (data.kind === "end") {
      callbacks.appendLog(`[${formatTime()}] 流程到达结束节点`);
      break;
    }

    if (data.kind === "human") {
      callbacks.appendLog(`[${formatTime()}] ⏸ 等待工程师确认：${data.label}`);
      callbacks.updateNode(current.id, { status: "等待人工确认" });
      const approveTarget = findNextTarget(edges, current.id, "通过");
      const rejectTarget = findNextTarget(edges, current.id, "驳回");
      callbacks.setState({
        status: "paused",
        pending: { nodeId: current.id, approveTarget, rejectTarget }
      });
      return;
    }

    if (data.kind === "agent") {
      callbacks.updateNode(current.id, { status: "运行中", outputSummary: undefined, duration: undefined });
      callbacks.appendLog(`[${formatTime()}] ▶ 执行智能体：${findAgentName(data.agentId)}`);
      const duration = mockDurations[data.agentId ?? ""] ?? 1000;
      await delay(duration);
      const output = mockOutputs[data.agentId ?? ""] ?? "完成";
      callbacks.updateNode(current.id, {
        status: "已完成",
        outputSummary: output,
        duration: duration / 1000
      });
      callbacks.appendLog(`[${formatTime()}] ✔ 完成：${output}`);
    }

    if (data.kind === "start") {
      callbacks.appendLog(`[${formatTime()}] ▶ 起始：${data.label}`);
    }

    const nextId = findNextTarget(edges, current.id);
    if (!nextId) {
      callbacks.appendLog(`[${formatTime()}] ⚠️ 未找到后继节点，流程停止`);
      break;
    }
    current = nodes.find((n) => n.id === nextId);
  }

  callbacks.setState({ status: "idle" });
}
