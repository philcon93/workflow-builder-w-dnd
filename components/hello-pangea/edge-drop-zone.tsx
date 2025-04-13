"use client";

import { useState } from "react";
import { Droppable } from "@hello-pangea/dnd";
import {
  type EdgeProps,
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge,
} from "@xyflow/react";

export function EdgeDropZone({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) {
  const [isHovered, setIsHovered] = useState(false);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        id={id}
        style={{
          ...style,
          strokeWidth: 2,
          stroke: "#b1b1b7",
        }}
        className="react-flow__edge-path"
        path={edgePath}
        markerEnd={markerEnd}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      <EdgeLabelRenderer>
        <Droppable droppableId={`edge-${id}`} type="SIDEBAR">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{
                position: "absolute",
                transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                pointerEvents: "all",
                zIndex: 1000,
              }}
              className="nodrag nopan"
            >
              <div
                className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full shadow-md transition-all duration-200 ${
                  snapshot.isDraggingOver || isHovered
                    ? "bg-purple-500 text-white scale-110"
                    : "bg-white text-purple-500 hover:bg-purple-100"
                }`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <span className="text-xl">+</span>
              </div>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </EdgeLabelRenderer>
    </>
  );
}
