"use client";
import { useWorkflowStore } from "@/lib/state";

export default function DecisionTerminal() {
  const logs = useWorkflowStore((s) => s.logs);
  return (
    <div className="h-48 border-t border-slate-200 bg-slate-950 text-slate-100 p-3 overflow-auto scrollbar-thin">
      <p className="text-xs text-slate-400 mb-2">决策路径终端</p>
      <div className="space-y-1 text-xs">
        {logs.map((log) => (
          <div key={log.id} className="whitespace-pre-wrap leading-snug">
            [{log.timestamp}] {log.message}
          </div>
        ))}
        {logs.length === 0 && <p className="text-slate-500">等待运行日志...</p>}
      </div>
    </div>
  );
}
