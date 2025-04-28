"use client";

import { useState, useEffect, useRef } from "react";
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
  // const dropzoneRef = useRef<HTMLDivElement>(null);

  // Add a default value to prevent destructuring undefined
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Report hover state to parent for layout adjustments
  useEffect(() => {
    if (data && data.onHoverChange) {
      data.onHoverChange(id, isHovered && isDragging);
    }
  }, [id, isHovered, isDragging, data]);

  // Handle mouse enter/leave events
  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

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
                width: `100vw`,
                height: `${
                  isHovered && snapshot.isDraggingOver && isDragging ? 100 : 50
                }px`,
                pointerEvents: isDragging ? "all" : "none",
                zIndex: isDragging ? 1000 : undefined,
              }}
              className={`nodrag nopan`}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              data-edge-id={id}
            >
              {/* Visual indicator for the drop zone - line along the edge */}
              <div
                className={`absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-200 ${
                  isHovered && snapshot.isDraggingOver && isDragging
                    ? "bg-purple-500"
                    : isHovered && isDragging
                    ? "bg-purple-300"
                    : "bg-transparent"
                }`}
              />

              <div className="hidden">{provided.placeholder}</div>
            </div>
          )}
        </Droppable>
      </EdgeLabelRenderer>
    </>
  );
}
