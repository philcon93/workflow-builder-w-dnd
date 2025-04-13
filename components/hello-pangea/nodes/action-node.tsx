"use client";

import { Handle, Position } from "@xyflow/react";
import {
  Draggable,
  type DraggableChildrenFn,
  DraggableProvided,
  DraggableStateSnapshot,
  Droppable,
} from "@hello-pangea/dnd";
import {
  Mail,
  MessageSquare,
  User,
  Bell,
  Webhook,
  Clock,
  GitBranch,
  GripVertical,
} from "lucide-react";

// Function to get the icon component based on name
const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case "mail":
      return <Mail className="h-5 w-5 text-emerald-500" />;
    case "messageSquare":
      return <MessageSquare className="h-5 w-5 text-emerald-500" />;
    case "user":
      return <User className="h-5 w-5 text-amber-500" />;
    case "bell":
      return <Bell className="h-5 w-5 text-indigo-500" />;
    case "webhook":
      return <Webhook className="h-5 w-5 text-blue-500" />;
    case "clock":
      return <Clock className="h-5 w-5 text-blue-500" />;
    case "gitBranch":
      return <GitBranch className="h-5 w-5 text-gray-500" />;
    default:
      return null;
  }
};

export function ActionNode({ id, data }: { id: string; data: any }) {
  const renderItem =
    (itemType: "clone" | "draggable") =>
    (provided: DraggableProvided, snapshot: DraggableStateSnapshot) => {
      const containerClasses =
        itemType === "clone"
          ? `relative flex h-16 w-64 items-center justify-start rounded-md ${
              data.color || "bg-white"
            } shadow-md`
          : undefined;
      return (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          style={{
            ...provided.draggableProps.style,
            width: "256px",
            height: "64px",
          }}
          className={containerClasses}
        >
          <div
            className={`absolute inset-0 flex items-center ${
              snapshot.isDragging ? "opacity-50" : ""
            }`}
          >
            <div className="flex w-full items-center space-x-3 p-4">
              <div
                {...provided.dragHandleProps}
                className="cursor-grab rounded p-1 hover:bg-black/5"
              >
                <GripVertical className="h-5 w-5 text-gray-400" />
              </div>
              <div>{getIconComponent(data.iconName)}</div>
              <div className="text-md font-medium">{data.label}</div>
            </div>
          </div>
        </div>
      );
    };
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        id="t"
        style={{ visibility: "hidden" }}
      />
      <Droppable
        droppableId={`node-${id}`}
        type="NODE"
        isDropDisabled={true}
        renderClone={renderItem("clone")}
      >
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`relative flex h-16 w-64 items-center justify-start rounded-md ${
              data.color || "bg-white"
            } shadow-md`}
          >
            <Draggable
              draggableId={`node-${id}`}
              index={0}
              // isDragDisabled={false}
            >
              {renderItem("draggable")}
            </Draggable>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      <Handle
        type="source"
        position={Position.Bottom}
        id="b"
        style={{ visibility: "hidden" }}
      />
    </>
  );
}
