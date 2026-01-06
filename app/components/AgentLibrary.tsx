"use client";
import { agents } from "@/lib/agents";
import { useWorkflowStore } from "@/lib/state";
import { useCallback } from "react";

export default function AgentLibrary() {
  const addAgentNode = useWorkflowStore((s) => s.addAgentNode);
  const addHumanNode = useWorkflowStore((s) => s.addHumanNode);

  const onDragStart = useCallback((event: React.DragEvent<HTMLDivElement>, id: string) => {
    event.dataTransfer.setData("application/reactflow", id);
    event.dataTransfer.effectAllowed = "move";
  }, []);

  return (
    <div className="h-full w-72 border-r border-slate-200 bg-white p-4 flex flex-col gap-4 overflow-auto scrollbar-thin">
      <div>
        <h3 className="text-sm font-semibold text-slate-500">智能体能力库</h3>
        <p className="text-xs text-slate-400">拖拽到画布构建决策流程</p>
        <div className="mt-3 space-y-3">
          {agents.map((agent) => (
            <div
              key={agent.id}
              draggable
              onDragStart={(e) => onDragStart(e, agent.id)}
              className="cursor-grab rounded-lg border border-slate-200 bg-slate-50 p-3 hover:border-primary hover:bg-white"
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
