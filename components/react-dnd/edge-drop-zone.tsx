"use client"

import { useState } from "react"
import { useDrop } from "react-dnd"
import { type EdgeProps, getBezierPath, EdgeLabelRenderer } from "@xyflow/react"

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
  selected,
}: EdgeProps) {
  const [isHovered, setIsHovered] = useState(false)

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  // Calculate midpoint for drop position
  const midX = (sourceX + targetX) / 2
  const midY = (sourceY + targetY) / 2

  // React DnD drop target
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: "NODE",
    drop: (item: any) => {
      // This will be handled by the parent component
      return {
        edgeId: id,
        position: { x: midX, y: midY },
        item,
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }))

  // Determine edge styling based on hover/selected state
  const isActive = isHovered || isOver || selected
  const edgeColor = isActive ? "#7c3aed" : "#b1b1b7"
  const edgeWidth = isActive ? 3 : 2
  const edgeStyle = {
    ...style,
    strokeWidth: edgeWidth,
    stroke: edgeColor,
    transition: "stroke 0.2s, stroke-width 0.2s",
    strokeDasharray: isOver ? "5" : "none",
  }

  return (
    <>
      <path
        id={id}
        style={edgeStyle}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        data-active={isActive}
      />
      <EdgeLabelRenderer>
        <div
          ref={drop}
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
            zIndex: 1000,
          }}
          className="nodrag nopan"
        >
          <div
            className={`edge-dropzone-button flex h-8 w-8 cursor-pointer items-center justify-center rounded-full shadow-md transition-all duration-200 ${
              isActive ? "bg-purple-500 text-white scale-110" : "bg-white text-purple-500 hover:bg-purple-100"
            }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <span className="text-xl">+</span>
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
