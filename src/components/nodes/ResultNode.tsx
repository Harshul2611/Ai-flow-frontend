import { Handle, Position } from "@xyflow/react";

type ResultNodeProps = {
  data: {
    response?: string;
  };
};

export default function ResultNode({ data }: ResultNodeProps) {
  const hasResponse = !!data.response?.trim();

  return (
    <div
      className={`
        group relative w-full max-w-95 min-w-65 rounded-xl border
        bg-linear-to-b from-white to-neutral-50/70
        border-neutral-200/80 shadow-sm
        hover:shadow-md hover:border-indigo-300/60
        focus-within:border-indigo-400 focus-within:shadow-lg focus-within:shadow-indigo-100/50
        transition-all duration-200
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-neutral-100/80">
        <div className="flex items-center gap-2">
          <div className="size-2.5 rounded-full bg-violet-500 shadow-sm" />
          <span className="text-xs font-semibold uppercase tracking-wide text-neutral-700">
            AI Output
          </span>
        </div>
      </div>

      <div
        className={`
          nowheel relative max-h-80 min-h-25 overflow-y-auto
          px-3.5 py-3 text-sm leading-relaxed text-neutral-800
          scrollbar-thin scrollbar-track-neutral-100 scrollbar-thumb-neutral-300
          hover:scrollbar-thumb-neutral-400/80
        `}
      >
        {hasResponse ? (
          <div className="whitespace-pre-wrap wrap-break-word prose prose-sm prose-neutral max-w-none">
            {data.response}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-neutral-400 text-sm italic py-6">
            Waiting for AI response...
          </div>
        )}
      </div>

      <Handle
        type="target"
        position={Position.Left}
        className={`
          size-3.5! -left-2! bg-violet-600 border-2 border-white
          shadow-md shadow-violet-200/40 transition-transform
          group-hover:scale-110
        `}
      />
    </div>
  );
}
