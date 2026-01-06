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

const thinkingLogs: Record<string, string[]> = {
  "param-rec": [
    "解析材料与板厚，查询历史数据库中的相似工艺记录",
    "优先筛选满足设备能力的参数组合，规避能量过冲",
    "构建初始安全窗口并输出推荐设定"
  ],
  "space-explore": [
    "在安全区域内自动生成 DOE 方案，标记高风险点",
    "并行评估实验可行性，优先跑覆盖面最大的组合",
    "根据实时结果动态收敛搜索范围"
  ],
  window: [
    "融合实验与仿真结果，计算稳定的上下控制界限",
    "识别窗口内的关键拐点，评估对质量指标的影响",
    "输出上线可用的窗口与调参建议"
  ],
  failure: [
    "扫描历史缺陷模式，匹配材料与设备条件",
    "构建失效先验，再用当前数据修正概率",
    "输出风险排序并提醒防错策略"
  ],
  robust: [
    "模拟设备波动与材料离散度，观察质量稳定性",
    "量化对关键因子的敏感性，定位最脆弱环节",
    "给出鲁棒性评分与改进优先级"
  ]
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
      callbacks.appendLog(`[${formatTime()}] 💬 旁白：已把上游输出发送到人工节点，等待批注与去向决策`);
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
      const thoughts = thinkingLogs[data.agentId ?? ""] ?? ["分析输入参数", "构建中间特征", "汇总输出"];
      thoughts.forEach((t) => callbacks.appendLog(`[${formatTime()}] 🧠 ${t}`));
      const duration = mockDurations[data.agentId ?? ""] ?? 1000;
      await delay(duration);
      const output = mockOutputs[data.agentId ?? ""] ?? "完成";
      callbacks.updateNode(current.id, {
        status: "已完成",
        outputSummary: output,
        duration: duration / 1000
      });
      callbacks.appendLog(`[${formatTime()}] 🔗 完成并推送下游数据：${output}`);
      callbacks.appendLog(`[${formatTime()}] ✔ 完成：${output}`);
    }

    if (data.kind === "start") {
      callbacks.appendLog(`[${formatTime()}] ▶ 起始：${data.label}`);
      callbacks.appendLog(`[${formatTime()}] 📡 广播：初始化上下文、数据入口和监控钩子`);
    }

    const nextId = findNextTarget(edges, current.id);
    if (!nextId) {
      callbacks.appendLog(`[${formatTime()}] ⚠️ 未找到后继节点，流程停止`);
      break;
    }
    const nextNode = nodes.find((n) => n.id === nextId);
    callbacks.appendLog(
      `[${formatTime()}] ➡️ 数据流转：${data.label} → ${nextNode?.data.label ?? nextId}`
    );
    current = nextNode;
  }

  callbacks.setState({ status: "idle" });
}
