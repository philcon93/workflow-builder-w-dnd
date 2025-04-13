"use client"

import { useMemo } from "react"
import { useDroppable } from "@dnd-kit/core"
import { getBezierPath } from "@xyflow/react"
import type { Edge, Node } from "@xyflow/react"

type EdgeDropTargetProps = {
  edge: Edge
  nodes: Node[]
  activeEdge: string | null
  draggedItem: any
  onDrop: (edgeId: string, nodeData: any, position: { x: number; y: number }) => void
}

export function EdgeDropTarget({ edge, nodes, activeEdge, draggedItem, onDrop }: EdgeDropTargetProps) {
  // Find source and target nodes
  const sourceNode = useMemo(() => nodes.find((n) => n.id === edge.source), [nodes, edge.source])
  const targetNode = useMemo(() => nodes.find((n) => n.id === edge.target), [nodes, edge.target])

  if (!sourceNode || !targetNode) return null

  // Calculate edge path
  const sourceX = sourceNode.position.x + (sourceNode.width || 0) / 2
  const sourceY = sourceNode.position.y + (sourceNode.height || 0)
  const targetX = targetNode.position.x + (targetNode.width || 0) / 2
  const targetY = targetNode.position.y

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition: edge.sourcePosition || { x: 0, y: 0 },
    targetX,
    targetY,
    targetPosition: edge.targetPosition || { x: 0, y: 0 },
  })

  // Calculate midpoint for drop position
  const midX = (sourceX + targetX) / 2
  const midY = (sourceY + targetY) / 2

  const { setNodeRef, isOver } = useDroppable({
    id: `edge-${edge.id}`,
    data: { edgeId: edge.id },
  })

  const isActive = isOver || activeEdge === edge.id

  // Handle drop
  const handleDrop = () => {
    if (draggedItem) {
      onDrop(edge.id, draggedItem, { x: midX, y: midY })
    }
  }

  // Create a drop target that follows the edge path
  return (
    <div
      ref={setNodeRef}
      className={`absolute pointer-events-auto z-10 ${isActive ? "edge-drop-highlight" : ""}`}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        pointerEvents: "none",
      }}
      onMouseUp={handleDrop}
    >
      <svg
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        <path
          d={edgePath}
          fill="none"
          stroke="transparent"
          strokeWidth={20}
          style={{ pointerEvents: "stroke" }}
          className={`${isActive ? "stroke-purple-500 opacity-30" : "opacity-0"}`}
        />
      </svg>

      {/* Drop zone indicator at the middle of the edge */}
      <div
        style={{
          position: "absolute",
          left: midX - 16,
          top: midY - 16,
          width: 32,
          height: 32,
          pointerEvents: "all",
          transform: `scale(${isActive ? 1.2 : 1})`,
          transition: "transform 0.2s",
        }}
        className={`flex items-center justify-center rounded-full ${
          isActive ? "bg-purple-500 text-white" : "bg-white text-purple-500"
        } shadow-md`}
      >
        <span className="text-xl">+</span>
      </div>
    </div>
  )
}
