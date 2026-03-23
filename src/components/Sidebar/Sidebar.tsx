import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Plus } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
interface HistoryItem {
  id: string;
  prompt: string;
  response: string;
  createdAt: string;
  updatedAt?: string | null;
}

interface ApiResponse {
  success: boolean;
  data: HistoryItem[];
  message?: string;
}

interface SidebarProps {
  onSelect?: (item: HistoryItem) => void;
  selectedId?: string;
  onNewChat: () => void;
}

// ── Helpers ────────────────────────────────────────────────────────────────
function getDayLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7)
    return date.toLocaleDateString("en-US", { weekday: "long" });
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function groupByDay(items: HistoryItem[]): Record<string, HistoryItem[]> {
  const map: Record<string, HistoryItem[]> = {};
  items.forEach((item) => {
    const label = getDayLabel(item.createdAt);
    if (!map[label]) map[label] = [];
    map[label].push(item);
  });
  return map;
}

// ── Component ──────────────────────────────────────────────────────────────
const Sidebar = ({ onSelect, selectedId, onNewChat }: SidebarProps) => {
  const [query, setQuery] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;

  const {
    data: apiResponse = { success: true, data: [] },
    isLoading,
    error,
  } = useQuery<ApiResponse>({
    queryKey: ["history"],
    queryFn: () => axios.get(`${API_URL}/api/history`).then((res) => res.data),
  });

  const history: HistoryItem[] = apiResponse?.data || [];

  const filtered = history.filter(
    (item) =>
      item.prompt.toLowerCase().includes(query.toLowerCase()) ||
      item.response.toLowerCase().includes(query.toLowerCase()),
  );

  const grouped = groupByDay(filtered);
  const days = Object.keys(grouped);

  const handleSelect = useCallback(
    (item: HistoryItem) => {
      onSelect?.(item);
    },
    [onSelect],
  );

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-zinc-900 overflow-hidden">
      <div className="px-4 pt-4 pb-3 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100 mb-2.5">
          History
        </p>
        <button
          onClick={onNewChat}
          title="Start a new chat (clear current input)"
          className={`
              flex items-center gap-1.5 text-xs font-medium 
              px-3 py-1.5 rounded-md transition-colors cursor-pointer
              ${
                !selectedId
                  ? "bg-violet-700 text-white shadow-sm"
                  : "bg-violet-600 hover:bg-violet-700 text-white"
              }
            `}
        >
          <Plus size={14} />
          New Chat
        </button>
      </div>

      {/* ── List ── */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col gap-2 px-2 pt-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-lg border border-zinc-100 dark:border-zinc-800 p-3 animate-pulse"
              >
                <div className="flex gap-2 mb-2">
                  <div className="h-4 w-24 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
                  <div className="h-4 w-12 bg-zinc-100 dark:bg-zinc-800 rounded-full ml-auto" />
                </div>
                <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded mb-1.5" />
                <div className="h-3 w-3/4 bg-zinc-100 dark:bg-zinc-800 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex flex-col items-center justify-center gap-2 mt-16 p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 border-2 border-red-100 flex items-center justify-center"></div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Failed to load history
            </p>
            <button
              onClick={() => window.location.reload()}
              className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && days.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 mt-16">
            <div className="w-9 h-9 rounded-full border border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center"></div>
            <p className="text-xs text-zinc-400 dark:text-zinc-600 text-center">
              {query ? "No results found" : "No saved prompts yet"}
            </p>
          </div>
        )}

        {!isLoading &&
          !error &&
          days.map((day) => (
            <div key={day}>
              {/* Day label */}
              <p className="text-[10px] font-semibold tracking-widest text-zinc-400 dark:text-zinc-600 uppercase px-2 pt-3 pb-1.5">
                {day}
              </p>

              {grouped[day].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className={`
                    w-full text-left rounded-lg flex flex-col gap-y-1 mt-1 cursor-pointer px-3 py-2 border transition-all duration-100
                    ${
                      selectedId === item.id
                        ? "bg-zinc-100 border-zinc-300 dark:bg-zinc-800 dark:border-zinc-700 shadow-sm"
                        : "border-transparent hover:bg-zinc-50 hover:border-zinc-200 dark:hover:bg-zinc-800/60 dark:hover:border-zinc-700/60"
                    }
                `}
                >
                  <div className="flex items-center gap-2 mb-0.5 text-[10px]">
                    {" "}
                    {/* ← reduced mb */}
                    <span className="font-semibold px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300 whitespace-nowrap">
                      AI
                    </span>
                    <span className="text-zinc-400 dark:text-zinc-600 ml-auto whitespace-nowrap">
                      {getTime(item.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs font-medium text-zinc-700 dark:text-zinc-200 leading-tight line-clamp-1 mb-0.5">
                    {item.prompt}
                  </p>

                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500 leading-tight line-clamp-2">
                    {item.response}
                  </p>
                </button>
              ))}
            </div>
          ))}
      </div>

      <div className="px-4 py-2.5 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
        <span className="text-[11px] text-zinc-400 dark:text-zinc-600">
          {filtered.length} {filtered.length === 1 ? "saved" : "saved"}
        </span>
        {query && (
          <button
            onClick={() => setQuery("")}
            className="text-[11px] text-zinc-400 hover:text-zinc-600 dark:text-zinc-600 dark:hover:text-zinc-400 transition-colors px-1 py-0.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
