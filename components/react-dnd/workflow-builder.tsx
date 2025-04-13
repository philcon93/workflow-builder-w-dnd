"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  type Connection,
  type Edge,
  type Node,
  type NodeTypes,
  type EdgeTypes,
  MarkerType,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { Sidebar } from "./sidebar"
import { StartNode } from "../nodes/start-node"
import { ActionNode } from "../nodes/action-node"
import { EdgeDropZone } from "./edge-drop-zone"
import { NavigationHeader } from "../navigation-header"

// Define custom node types
const nodeTypes: NodeTypes = {
  start: StartNode,
  action: ActionNode,
}

// Define custom edge types
const edgeTypes: EdgeTypes = {
  dropzone: EdgeDropZone,
}

// Initial nodes and edges
const initialNodes: Node[] = [
  {
    id: "start",
    type: "start",
    position: { x: 250, y: 5 },
    data: { label: "Start" },
  },
]

const initialEdges: Edge[] = []

export default function WorkflowBuilder() {
  return (
    <DndProvider backend={HTML5Backend}>
      <ReactFlowProvider>
        <FlowCanvas />
      </ReactFlowProvider>
    </DndProvider>
  )
}

function FlowCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [activeEdge, setActiveEdge] = useState<string | null>(null)
  const [isValidDropTarget, setIsValidDropTarget] = useState(false)

  // Handle connections between nodes
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "dropzone",
            animated: false,
            style: { strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
          },
          eds,
        ),
      )
    },
    [setEdges],
  )

  // Update edges to show which ones are being hovered over during drag
  useEffect(() => {
    if (activeEdge) {
      setEdges((eds) =>
        eds.map((edge) => {
          if (edge.id === activeEdge) {
            return {
              ...edge,
              selected: true,
              style: { ...edge.style, stroke: "#7c3aed", strokeWidth: 3 },
            }
          }
          return edge
        }),
      )
    } else if (!isDraggingOver) {
      setEdges((eds) =>
        eds.map((edge) => ({
          ...edge,
          selected: false,
          style: { ...edge.style, stroke: "#b1b1b7", strokeWidth: 2 },
        })),
      )
    }
  }, [activeEdge, isDraggingOver, setEdges])

  // Add a plus button node after the start node if no other nodes exist
  useEffect(() => {
    if (nodes.length === 1 && nodes[0].id === "start" && edges.length === 0) {
      const startNode = nodes[0]
      const plusButtonPosition = {
        x: startNode.position.x + 40,
        y: startNode.position.y + 100,
      }

      // Add a plus button node
      setNodes((nds) => [
        ...nds,
        {
          id: "plus-button",
          type: "default",
          position: plusButtonPosition,
          data: {
            label: (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 text-white">
                <span className="text-xl">+</span>
              </div>
            ),
          },
          style: {
            background: "transparent",
            border: "none",
            width: 40,
            height: 40,
          },
        },
      ])

      // Add an edge from start to plus button
      setEdges([
        {
          id: "e-start-plus",
          source: "start",
          target: "plus-button",
          type: "dropzone",
          style: { strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
        },
      ])
    }
  }, [nodes, edges, setNodes, setEdges])

  return (
    <>
      <Sidebar />
      <div className="flex h-full flex-1 flex-col">
        <NavigationHeader currentLibrary="React DnD" />
        <div
          className={`h-full w-full flex-1 ${isDraggingOver && !isValidDropTarget ? "invalid-drop-target" : ""}`}
          ref={reactFlowWrapper}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            onEdgeMouseEnter={(_, edge) => {
              if (isDraggingOver) {
                setActiveEdge(edge.id)
                setIsValidDropTarget(true)
              }
            }}
            onEdgeMouseLeave={(_, edge) => {
              if (isDraggingOver && edge.id === activeEdge) {
                setActiveEdge(null)
                setIsValidDropTarget(false)
              }
            }}
            proOptions={{ hideAttribution: true }}
            className={`${isDraggingOver ? "dragging-over" : ""} ${isValidDropTarget ? "valid-drop-target" : ""}`}
          >
            <Background color="#aaa" gap={16} />
            <Controls position="bottom-left" showInteractive={false} className="bg-white" />
          </ReactFlow>
        </div>
      </div>
    </>
  )
}
