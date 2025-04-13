import { Handle, Position } from "@xyflow/react";

export function StartNode({ data }: { data: { label: string } }) {
  return (
    <div className="flex h-16 w-64 items-center justify-center rounded-md bg-white shadow-md">
      <div className="text-lg font-medium">{data.label}</div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="b"
        style={{ visibility: "hidden" }}
      />
    </div>
  );
}
