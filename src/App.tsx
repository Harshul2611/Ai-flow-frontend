import { useState, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import axios from "axios";
import InputNode from "./components/nodes/InputNode";
import ResultNode from "./components/nodes/ResultNode";
import Sidebar from "./components/Sidebar/Sidebar";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const nodeTypes = { inputNode: InputNode, resultNode: ResultNode };

export default function App() {
  const [selectedHistoryId, setSelectedHistoryId] = useState<string>();
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;

  const queryClient = useQueryClient();

  const [nodes, setNodes, onNodesChange] = useNodesState([
    {
      id: "1",
      type: "inputNode",
      position: { x: 50, y: 150 },
      data: { prompt: "", onChange: setPrompt },
    },
    {
      id: "2",
      type: "resultNode",
      position: { x: 400, y: 150 },
      data: { response: "" },
    },
  ]);

  const [edges, _setEdges, onEdgesChange] = useEdgesState([
    { id: "e1-2", source: "1", target: "2", animated: true },
  ]);

  const handleNewChat = () => {
    setSelectedHistoryId(undefined);
    setPrompt("");
    setResponse("");
    setNodes((nds: any) =>
      nds.map((n: any) => ({
        ...n,
        data:
          n.id === "1" ? { prompt: "", onChange: setPrompt } : { response: "" },
      })),
    );
  };

  const runMutation = useMutation({
    mutationFn: async (currentPrompt: string): Promise<string> => {
      if (!currentPrompt?.trim()) throw new Error("Prompt cannot be empty");

      const res = await fetch(`${API_URL}/api/ask-ai-stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: currentPrompt }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to connect");
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6).trim());
              if (data.content) {
                fullResponse += data.content;
                setResponse(fullResponse);
              }
              if (data.done) return fullResponse;
              if (data.error) throw new Error(data.error);
            } catch (e) {}
          }
        }
      }
      return fullResponse;
    },

    onMutate: () => {
      toast.loading("AI is thinking...", { id: "ai-stream" });
      setResponse("");
    },

    onSuccess: (final) => {
      toast.success("Done!", { id: "ai-stream" });
      setNodes((nds) =>
        nds.map((n) =>
          n.id === "2" ? { ...n, data: { response: final } } : n,
        ),
      );
    },

    onError: (err: any) => {
      const msg = err.message || "Something went wrong";
      toast.error(msg, { id: "ai-stream" });
      setResponse(`❌ ${msg}`);
    },
  });

  const handleRun = () => runMutation.mutate(prompt);

  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === "1")
          return { ...node, data: { prompt, onChange: setPrompt } };
        if (node.id === "2") return { ...node, data: { response } };
        return node;
      }),
    );
  }, [prompt, response, setNodes]);

  const handleSave = () => {
    saveMutation.mutate({ prompt, response });
  };

  const saveMutation = useMutation({
    mutationFn: ({ prompt, response }: { prompt: string; response: string }) =>
      axios.post(`${API_URL}/api/save`, { prompt, response }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["history"] });
      toast.success("Saved to MongoDB!");
      setPrompt("");
      setResponse("");
      handleNewChat();
    },
    onError: (err: any) => toast.error("Save failed: " + err.message),
  });

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-gray-50">
      <aside className="w-72 border-r border-gray-200 bg-white shadow-sm shrink-0">
        <Sidebar
          selectedId={selectedHistoryId}
          onSelect={(item: any) => {
            setSelectedHistoryId(item.id);
            setPrompt(item.prompt);
            setResponse(item.response);
          }}
          onNewChat={handleNewChat}
        />
      </aside>

      <main className="flex-1 relative">
        <div className="flex items-center gap-6 pl-8 pt-10 shrink-0">
          <button
            className={`py-2 px-4 rounded-md bg-green-600 text-white hover:bg-green-700 ${
              runMutation.isPending || !!selectedHistoryId
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            }`}
            onClick={handleRun}
            disabled={
              runMutation.isPending || !prompt.trim() || !!selectedHistoryId
            }
          >
            {runMutation.isPending ? "Running..." : "Run Flow"}
          </button>

          <button
            className={`py-2 px-4 rounded-md bg-blue-600 text-white hover:bg-blue-700 ${
              saveMutation.isPending || !response.trim() || !!selectedHistoryId
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            }`}
            onClick={handleSave}
            disabled={
              saveMutation.isPending || !response.trim() || !!selectedHistoryId
            }
          >
            {saveMutation.isPending ? "Saving..." : "Save to DB"}
          </button>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          minZoom={0.2}
          maxZoom={2}
          panOnScroll
          zoomOnScroll
          nodesDraggable={true}
          nodesConnectable={true}
          elementsSelectable={true}
        >
          <Background />
          <Controls position="top-right" />
        </ReactFlow>
      </main>
    </div>
  );
}
