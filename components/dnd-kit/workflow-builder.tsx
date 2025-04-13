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
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core"
import { Sidebar } from "./sidebar"
import { StartNode } from "../nodes/start-node"
import { ActionNode } from "../nodes/action-node"
import { EdgeDropZone } from "./edge-drop-zone"
import { NavigationHeader } from "../navigation-header"
import { EdgeDropTarget } from "./edge-drop-target"

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
    <ReactFlowProvider>
      <DndContextProvider />
    </ReactFlowProvider>
  )
}

function DndContextProvider() {
  // Use the pointer sensor for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  )

  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    console.log("Drag Start: ", event)
  }, [])

  // Handle drag end
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    console.log("Drag End: ", event)
  }, [])

  // Handle drag over
  const handleDragOver = useCallback((event: DragOverEvent) => {
    console.log("Drag Over: ", event)
  }, [])

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragOver={handleDragOver}>
      <div className="flex h-screen w-full">
        <FlowCanvas />
      </div>
    </DndContext>
  )
}

function FlowCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [activeEdge, setActiveEdge] = useState<string | null>(null)
  const [draggedItem, setDraggedItem] = useState<any>(null)

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

  // Function to handle node drop on an edge
  const handleNodeDropOnEdge = useCallback(
    (edgeId: string, nodeData: any, position: { x: number; y: number }) => {
      if (!nodeData) return

      const edge = edges.find((e) => e.id === edgeId)
      if (!edge) return

      // Create a new node
      const newNode = {
        id: `${nodeData.category}-${Date.now()}`,
        type: "action",
        position,
        data: { ...nodeData },
      }

      // Add the new node
      setNodes((nds) => nds.concat(newNode))

      // Remove the original edge
      setEdges((eds) => eds.filter((e) => e.id !== edgeId))

      // Create two new edges
      const newEdges = [
        {
          id: `e-${edge.source}-${newNode.id}`,
          source: edge.source,
          target: newNode.id,
          type: "dropzone",
          animated: false,
          style: { strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
          sourceHandle: edge.sourceHandle,
          targetHandle: "t",
        },
        {
          id: `e-${newNode.id}-${edge.target}`,
          source: newNode.id,
          target: edge.target,
          type: "dropzone",
          animated: false,
          style: { strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
          sourceHandle: "b",
          targetHandle: edge.targetHandle,
        },
      ]

      setEdges((eds) => [...eds, ...newEdges])
    },
    [edges, setNodes, setEdges],
  )

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
        <NavigationHeader currentLibrary="DnD Kit" />
        <div className="h-full w-full flex-1" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#aaa" gap={16} />
            <Controls position="bottom-left" showInteractive={false} className="bg-white" />

            {/* Overlay edge drop targets for dnd-kit */}
            {edges.map((edge) => (
              <EdgeDropTarget
                key={edge.id}
                edge={edge}
                nodes={nodes}
                activeEdge={activeEdge}
                draggedItem={draggedItem}
                onDrop={handleNodeDropOnEdge}
              />
            ))}
          </ReactFlow>
        </div>
      </div>
    </>
  )
}
