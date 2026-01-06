import { AgentDefinition } from "./types";

export const agents: AgentDefinition[] = [
  {
    id: "param-rec",
    name: "参数推荐 Agent",
    description: "根据材料与设备约束推荐首选连接参数，提供可落地的初始工艺方案。",
    stage: "探索",
    inputSchema: "材料、板厚、设备能力、目标强度",
    outputSchema: "压入力、速度、能量窗口"
  },
  {
    id: "space-explore",
    name: "参数空间探索 Agent",
    description: "在安全范围内扫描参数组合，识别敏感区与可行区，为后续窗口生成提供证据。",
    stage: "探索",
    inputSchema: "参数范围、实验约束",
    outputSchema: "可行点列表、异常点标记"
  },
  {
    id: "window",
    name: "工艺窗口生成 Agent",
    description: "基于实验与仿真结果生成稳健的工艺窗口，输出上线可用的控制界限。",
    stage: "验证",
    inputSchema: "可行点、质量指标",
    outputSchema: "力/位移/速度窗口、控制限"
  },
  {
    id: "failure",
    name: "失效模式预测 Agent",
    description: "预测潜在失效模式及触发条件，提醒工程师制定防错策略。",
    stage: "验证",
    inputSchema: "材料特性、历史缺陷数据",
    outputSchema: "主要失效模式、风险等级"
  },
  {
    id: "robust",
    name: "工艺鲁棒性评估 Agent",
    description: "评估工艺对设备波动与材料离散的敏感度，给出鲁棒性评分与建议。",
    stage: "量产",
    inputSchema: "波动源、统计模型",
    outputSchema: "鲁棒性评分、关键因子排序"
  }
];
