"use client";
import { useWorkflowStore } from "@/lib/state";

export default function RunPanel() {
  const run = useWorkflowStore((s) => s.run);
  const engine = useWorkflowStore((s) => s.engine);

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
      <div>
        <p className="text-sm font-semibold text-slate-800">当前项目：SPR_工艺开发_v1</p>
        <p className="text-xs text-slate-500">状态：{engine.status === "paused" ? "等待人工确认" : engine.status === "running" ? "运行中" : "空闲"}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={run}
          className="inline-flex items-center gap-2 rounded bg-primary px-4 py-2 text-white text-sm shadow"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path d="M6.75 4.5v15l10.5-7.5-10.5-7.5z" />
          </svg>
          运行流程
        </button>
        <span className="text-xs text-slate-400">界面完全前端 Mock，记录决策路径</span>
      </div>
    </div>
  );
}
