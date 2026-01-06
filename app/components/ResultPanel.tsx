"use client";
import { useWorkflowStore } from "@/lib/state";

export default function ResultPanel() {
  const nodes = useWorkflowStore((s) => s.nodes);
  const completed = nodes.filter((n) => n.data.outputSummary);

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">阶段输出与追溯</p>
        <span className="text-[11px] text-slate-500">记录工程决策资产</span>
      </div>
      {completed.length === 0 && <p className="text-xs text-slate-500">暂无输出，先运行流程。</p>}
      {completed.map((node) => (
        <div key={node.id} className="border border-slate-100 rounded-lg p-3 bg-slate-50">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-800">{node.data.label}</span>
            <span className="text-[11px] text-slate-500">耗时：{node.data.duration ?? "-"}s</span>
          </div>
          <p className="text-xs text-slate-600 mt-1">{node.data.outputSummary}</p>
        </div>
      ))}
    </div>
  );
}
