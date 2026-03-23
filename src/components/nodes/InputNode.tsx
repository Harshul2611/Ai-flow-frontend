import { Handle, Position } from "@xyflow/react";

type InputNodeProps = {
  data: {
    prompt: string;
    onChange: (value: string) => void;
  };
};

export default function InputNode({ data }: InputNodeProps) {
  return (
    <div
      className={`
        w-65 min-w-55 rounded-xl border bg-white shadow-sm
        border-neutral-200/80 hover:border-blue-400/60
        focus-within:border-blue-500 focus-within:shadow-md focus-within:shadow-blue-100
        transition-all duration-200
      `}
    >
      {/* Header / Label row */}
      <div className="px-3 pt-2.5 pb-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-semibold text-neutral-700 tracking-tight">
            INPUT • Prompt
          </span>
        </div>
      </div>

      {/* Textarea area */}
      <div className="px-3 pb-3">
        <textarea
          rows={4}
          value={data.prompt}
          onChange={(e) => data.onChange(e.target.value)}
          onKeyDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          placeholder="Type your prompt here..."
          className={`
            w-full resize-none rounded-lg border border-neutral-300/70
            px-3 py-2.5 text-sm leading-tight
            placeholder:text-neutral-400
            focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400/30
            bg-neutral-50/40 hover:bg-white transition-colors
            scrollbar-thin scrollbar-thumb-neutral-300 hover:scrollbar-thumb-neutral-400
          `}
        />
      </div>

      {/* Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3! h-3! bg-blue-600! border-2! border-white! shadow-sm! -right-1.5!"
      />
    </div>
  );
}
