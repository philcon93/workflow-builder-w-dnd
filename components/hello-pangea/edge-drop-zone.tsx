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
  const isDragging = data?.isDragging || false;

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
        style={style}
        className="react-flow__edge-path"
        path={edgePath}
        markerEnd={markerEnd}
      />
      <EdgeLabelRenderer>
        <Droppable droppableId={`edge-${id}`} type="NODE">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{
                position: "absolute",
                transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                pointerEvents: "all",
                zIndex: isDragging ? 1000 : undefined,
                width: "100vw", // Full width of the canvas
                height: "60px", // Height enough to be clickable but not too large
                // left: "50%", // Center horizontally
                // marginLeft: "-50vw", // Offset to ensure proper centering
              }}
              className="nodrag nopan"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {/* Only show the + button when dragging or hovering */}
              {((isDragging && isHovered) || snapshot.isDraggingOver) && (
                <div
                  className={`absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full shadow-md transition-all duration-200 ${
                    snapshot.isDraggingOver
                      ? "bg-purple-500 text-white scale-110"
                      : "bg-white text-purple-500 hover:bg-purple-100"
                  }`}
                >
                  <span className="text-xl">+</span>
                </div>
              )}
              <div className="hidden">{provided.placeholder}</div>
            </div>
          )}
        </Droppable>
      </EdgeLabelRenderer>
    </>
  );
}
