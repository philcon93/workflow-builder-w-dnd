import { Handle, Position } from "@xyflow/react";

export function EndNode({ data }: { data: { label: string } }) {
  return (
    <div className="flex h-16 w-64 items-center justify-center rounded-md bg-white shadow-md">
      <div className="text-lg font-medium">{data.label}</div>
      <Handle
        type="target"
        position={Position.Top}
        id="t"
        style={{ visibility: "hidden" }}
      />
    </div>
  );
}
