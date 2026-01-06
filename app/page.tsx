import AgentLibrary from "./components/AgentLibrary";
import DecisionTerminal from "./components/DecisionTerminal";
import NodeInspector from "./components/NodeInspector";
import ResultPanel from "./components/ResultPanel";
import RunPanel from "./components/RunPanel";
import WorkflowCanvas from "./components/WorkflowCanvas";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <RunPanel />
      <div className="flex flex-1 overflow-hidden">
        <AgentLibrary />
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex">
            <WorkflowCanvas />
            <div className="w-96 p-4 space-y-4 overflow-auto scrollbar-thin">
              <ResultPanel />
            </div>
          </div>
          <DecisionTerminal />
        </div>
        <NodeInspector />
      </div>
    </main>
  );
}
