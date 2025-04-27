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
  const dropzoneRef = useRef<HTMLDivElement>(null);

  // Add a default value to prevent destructuring undefined
  const pathParams = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Safely destructure with default values
  const [edgePath = "", labelX = 0, labelY = 0] = pathParams || [];

  // Calculate the midpoint of the edge for better positioning
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;

  // Calculate the angle of the edge to determine its orientation
  const angle = Math.atan2(targetY - sourceY, targetX - sourceX);
  const distance = Math.sqrt(
    Math.pow(targetX - sourceX, 2) + Math.pow(targetY - sourceY, 2)
  );

  // Calculate the width of the dropzone based on the edge length
  const dropzoneWidth = Math.min(Math.max(distance * 0.8, 100), 300);

  // Calculate the height of the dropzone - keep it consistent
  const dropzoneHeight = 40;

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
              ref={(el) => {
                // Combine refs
                dropzoneRef.current = el;
                provided.innerRef(el);
              }}
              {...provided.droppableProps}
              style={{
                position: "absolute",
                transform: `translate(-50%, -50%) translate(${midX}px,${midY}px) rotate(${angle}rad)`,
                width: `${dropzoneWidth}px`,
                height: `${dropzoneHeight}px`,
                pointerEvents: isDragging ? "all" : "none",
                zIndex: isDragging ? 1000 : undefined,
              }}
              className={`nodrag nopan edge-dropzone ${
                isHovered ? "edge-dropzone-hovered" : ""
              } ${snapshot.isDraggingOver ? "edge-dropzone-active" : ""}`}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              data-edge-id={id}
            >
              {/* Visual indicator for the drop zone */}
              <div
                className={`absolute left-1/2 top-1/2 h-1 w-full -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-200 ${
                  snapshot.isDraggingOver
                    ? "bg-purple-500"
                    : isHovered && isDragging
                    ? "bg-purple-300"
                    : isDragging
                    ? "bg-purple-200 opacity-50"
                    : "bg-transparent"
                }`}
                style={{
                  transform: `translate(-50%, -50%) rotate(${-angle}rad)`,
                  width: "100%",
                }}
              />

              {/* Plus button indicator */}
              {(isHovered || snapshot.isDraggingOver) && isDragging && (
                <div
                  className={`absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 transform items-center justify-center rounded-full shadow-md transition-all duration-200 ${
                    snapshot.isDraggingOver
                      ? "scale-110 bg-purple-500 text-white"
                      : "bg-white text-purple-500 hover:bg-purple-100"
                  }`}
                  style={{
                    transform: `translate(-50%, -50%) rotate(${-angle}rad)`,
                  }}
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
