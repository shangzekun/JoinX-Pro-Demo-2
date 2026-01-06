"use client";
import { agents } from "@/lib/agents";
import { useWorkflowStore } from "@/lib/state";
import { useCallback, useMemo, useState } from "react";

export default function AgentLibrary() {
  const addAgentNode = useWorkflowStore((s) => s.addAgentNode);
  const addHumanNode = useWorkflowStore((s) => s.addHumanNode);
  const [selectedAgentId, setSelectedAgentId] = useState<string>(agents[0]?.id ?? "");

  const onDragStart = useCallback((event: React.DragEvent<HTMLDivElement>, id: string) => {
    event.dataTransfer.setData("application/reactflow", id);
    event.dataTransfer.effectAllowed = "move";
  }, []);

  const selectedAgent = useMemo(
    () => agents.find((a) => a.id === selectedAgentId) ?? agents[0],
    [selectedAgentId]
  );

  return (
    <div className="h-full w-80 border-r border-slate-200 bg-white p-4 flex flex-col gap-4 overflow-auto scrollbar-thin">
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-500">智能体能力库</h3>
          <p className="text-xs text-slate-400">拖拽到画布构建决策流程，点击查看介绍</p>
        </div>
        <div className="space-y-3">
          {agents.map((agent) => (
            <div
              key={agent.id}
              draggable
              onDragStart={(e) => onDragStart(e, agent.id)}
              onClick={() => setSelectedAgentId(agent.id)}
              className={`cursor-pointer rounded-lg border p-3 transition hover:border-primary hover:bg-white ${
                selectedAgentId === agent.id
                  ? "border-primary bg-blue-50 shadow-sm"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-slate-800">{agent.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">{agent.stage}</span>
              </div>
              <p className="mt-1 text-xs text-slate-600 leading-snug">{agent.description}</p>
              <p className="mt-2 text-[11px] text-slate-500">输入：{agent.inputSchema}</p>
              <p className="text-[11px] text-slate-500">输出：{agent.outputSchema}</p>
            </div>
          ))}
        </div>
        {selectedAgent && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-800">{selectedAgent.name}</p>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">{selectedAgent.stage}阶段</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{selectedAgent.description}</p>
            <div className="rounded bg-white border border-slate-100 p-2">
              <p className="text-[11px] text-slate-500">输入契约：{selectedAgent.inputSchema}</p>
              <p className="text-[11px] text-slate-500 mt-1">输出契约：{selectedAgent.outputSchema}</p>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              操作提示：点击卡片可在右侧浏览介绍，拖拽即可把该 Agent 放到画布里构建链式流程。
            </p>
          </div>
        )}
      </div>
      <div className="border-t border-slate-200 pt-3">
        <h3 className="text-sm font-semibold text-slate-500">人工节点</h3>
        <div
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData("application/reactflow", "human");
            e.dataTransfer.effectAllowed = "move";
          }}
          className="mt-2 cursor-grab rounded-lg border border-dashed border-primary bg-blue-50 p-3 text-sm text-primary"
        >
          人工确认节点
        </div>
      </div>
    </div>
  );
}
