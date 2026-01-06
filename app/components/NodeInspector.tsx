"use client";
import { agents } from "@/lib/agents";
import { useWorkflowStore } from "@/lib/state";
import { WorkflowNode } from "@/lib/types";
import { useMemo } from "react";

export default function NodeInspector() {
  const nodes = useWorkflowStore((s) => s.nodes);
  const selected = useWorkflowStore((s) => s.selected);
  const updateNode = useWorkflowStore((s) => s.updateNode);
  const engine = useWorkflowStore((s) => s.engine);
  const continueAfterHuman = useWorkflowStore((s) => s.continueAfterHuman);

  const node: WorkflowNode | undefined = useMemo(
    () => nodes.find((n) => n.id === selected),
    [nodes, selected]
  );

  if (!node) {
    return (
      <div className="w-80 border-l border-slate-200 bg-white p-4 text-sm text-slate-500">
        选择节点以查看详情
      </div>
    );
  }

  const agentInfo = agents.find((a) => a.id === node.data.agentId);

  return (
    <div className="w-80 border-l border-slate-200 bg-white p-4 flex flex-col gap-3 text-sm">
      <div>
        <p className="text-xs text-slate-400">节点</p>
        <p className="text-base font-semibold text-slate-800">{node.data.label}</p>
        <p className="text-xs text-slate-500 mt-1">状态：{node.data.status}</p>
      </div>
      {agentInfo && (
        <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
          <p className="font-semibold text-slate-700">{agentInfo.name}</p>
          <p className="text-xs text-slate-500 mt-1 leading-snug">{agentInfo.description}</p>
          <p className="text-xs text-slate-500 mt-2">输入：{agentInfo.inputSchema}</p>
          <p className="text-xs text-slate-500">输出：{agentInfo.outputSchema}</p>
        </div>
      )}
      {node.data.inputs && (
        <div>
          <p className="text-xs text-slate-500 mb-1">输入参数（可编辑）</p>
          <div className="space-y-2">
            {Object.entries(node.data.inputs).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-xs text-slate-500 w-16">{key}</span>
                <input
                  className="flex-1 rounded border border-slate-200 px-2 py-1 text-sm"
                  value={value}
                  onChange={(e) =>
                    updateNode(node.id, {
                      inputs: { ...node.data.inputs, [key]: e.target.value }
                    })
                  }
                />
              </div>
            ))}
          </div>
        </div>
      )}
      {node.data.outputSummary && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-xs text-green-800">
          <p className="font-semibold">最新输出</p>
          <p>{node.data.outputSummary}</p>
          {node.data.duration && <p className="text-[11px] text-green-700">耗时：{node.data.duration}s</p>}
        </div>
      )}
      {node.data.kind === "human" && engine.status === "paused" && engine.pending?.nodeId === node.id && (
        <div className="flex gap-2">
          <button
            onClick={() => continueAfterHuman("approve")}
            className="flex-1 rounded bg-primary px-3 py-2 text-white text-sm"
          >
            批准继续
          </button>
          <button
            onClick={() => continueAfterHuman("reject")}
            className="flex-1 rounded bg-red-500 px-3 py-2 text-white text-sm"
          >
            驳回流程
          </button>
        </div>
      )}
    </div>
  );
}
