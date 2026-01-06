"use client";
import { agents } from "@/lib/agents";
import { useWorkflowStore } from "@/lib/state";
import { WorkflowNode } from "@/lib/types";
import { useMemo } from "react";

export default function NodeInspector() {
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const selected = useWorkflowStore((s) => s.selected);
  const updateNode = useWorkflowStore((s) => s.updateNode);
  const engine = useWorkflowStore((s) => s.engine);
  const continueAfterHuman = useWorkflowStore((s) => s.continueAfterHuman);
  const removeNode = useWorkflowStore((s) => s.removeNode);
  const removeEdge = useWorkflowStore((s) => s.removeEdge);
  const setSelected = useWorkflowStore((s) => s.setSelected);

  const node: WorkflowNode | undefined = useMemo(
    () => nodes.find((n) => n.id === selected),
    [nodes, selected]
  );

  const incomingEdges = useMemo(
    () => edges.filter((edge) => edge.target === node?.id),
    [edges, node?.id]
  );

  const outgoingEdges = useMemo(
    () => edges.filter((edge) => edge.source === node?.id),
    [edges, node?.id]
  );

  if (!node) {
    return (
      <div className="w-80 border-l border-slate-200 bg-white p-4 text-sm text-slate-500">
        选择节点以查看详情
      </div>
    );
  }

  const agentInfo = agents.find((a) => a.id === node.data.agentId);
  const canDeleteNode = !["start", "end"].includes(node.data.kind);

  return (
    <div className="w-80 border-l border-slate-200 bg-white p-4 flex flex-col gap-3 text-sm">
      <div>
        <p className="text-xs text-slate-400">节点</p>
        <p className="text-base font-semibold text-slate-800">{node.data.label}</p>
        <p className="text-xs text-slate-500 mt-1">状态：{node.data.status}</p>
        {canDeleteNode && (
          <button
            onClick={() => {
              removeNode(node.id);
              setSelected(undefined);
            }}
            className="mt-2 inline-flex items-center gap-1 rounded border border-red-200 bg-red-50 px-2 py-1 text-[11px] text-red-600"
          >
            删除节点
          </button>
        )}
      </div>
      {agentInfo && (
        <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
          <p className="font-semibold text-slate-700">{agentInfo.name}</p>
          <p className="text-xs text-slate-500 mt-1 leading-snug">{agentInfo.description}</p>
          <p className="text-xs text-slate-500 mt-2">输入：{agentInfo.inputSchema}</p>
          <p className="text-xs text-slate-500">输出：{agentInfo.outputSchema}</p>
        </div>
      )}
      <div className="rounded border border-slate-200 p-3 bg-slate-50">
        <p className="text-xs text-slate-500 mb-2">链路与数据流</p>
        <div className="space-y-2">
          <div>
            <p className="text-[11px] text-slate-500 mb-1">上游</p>
            {incomingEdges.length === 0 && <p className="text-[11px] text-slate-400">暂无进入链路</p>}
            {incomingEdges.map((edge) => (
              <div
                key={edge.id}
                className="flex items-center justify-between rounded bg-white px-2 py-1 text-[11px] text-slate-600 border border-slate-100"
              >
                <span>{edge.label ?? "数据流"} ← {edge.source}</span>
                <button
                  onClick={() => removeEdge(edge.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  删除
                </button>
              </div>
            ))}
          </div>
          <div>
            <p className="text-[11px] text-slate-500 mb-1">下游</p>
            {outgoingEdges.length === 0 && <p className="text-[11px] text-slate-400">暂无输出链路，拖拽连接手柄以创建</p>}
            {outgoingEdges.map((edge) => (
              <div
                key={edge.id}
                className="flex items-center justify-between rounded bg-white px-2 py-1 text-[11px] text-slate-600 border border-slate-100"
              >
                <span>{edge.label ?? "数据流"} → {edge.target}</span>
                <button
                  onClick={() => removeEdge(edge.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  删除
                </button>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-2 text-[11px] text-slate-400">提示：直接在画布中拖动节点手柄可以新增链式路径。</p>
      </div>
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
