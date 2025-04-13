"use client";

import { useState, useRef, useCallback, useEffect } from "react";
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
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { Sidebar } from "./sidebar";
import { StartNode } from "../nodes/start-node";
import { ActionNode } from "../nodes/action-node";
import { EdgeDropZone } from "./edge-drop-zone";
import { NavigationHeader } from "../navigation-header";

// Define custom node types
const nodeTypes: NodeTypes = {
  start: StartNode,
  action: ActionNode,
};

// Define custom edge types
const edgeTypes: EdgeTypes = {
  dropzone: EdgeDropZone,
};

// Initial nodes and edges
const initialNodes: Node[] = [
  {
    id: "start",
    type: "start",
    position: { x: 250, y: 5 },
    data: { label: "Start" },
  },
];

const initialEdges: Edge[] = [];

export default function WorkflowBuilder() {
  return (
    <ReactFlowProvider>
      <FlowCanvas />
    </ReactFlowProvider>
  );
}

function FlowCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [sidebarItems, setSidebarItems] = useState<any[]>([]);

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
          eds
        )
      );
    },
    [setEdges]
  );

  // Handle drag end from hello-pangea/dnd
  const onDragEnd = useCallback(
    (result: DropResult) => {
      const { destination, draggableId } = result;

      // If dropped outside a droppable area
      if (!destination) {
        return;
      }

      // If dropped on an edge
      if (destination.droppableId.startsWith("edge-")) {
        const edgeId = destination.droppableId.replace("edge-", "");
        const edge = edges.find((e) => e.id === edgeId);

        if (!edge) return;

        // Find the item that was dragged
        const item = sidebarItems.find((item) => item.id === draggableId);
        if (!item) return;

        // Find source and target nodes to calculate position
        const sourceNode = nodes.find((n) => n.id === edge.source);
        const targetNode = nodes.find((n) => n.id === edge.target);

        if (!sourceNode || !targetNode) return;

        // Calculate midpoint for drop position
        const midX = (sourceNode.position.x + targetNode.position.x) / 2;
        const midY = (sourceNode.position.y + targetNode.position.y) / 2 + 50;

        // Create a new node
        const newNode = {
          id: `${item.category}-${Date.now()}`,
          type: "action",
          position: { x: midX, y: midY },
          data: { ...item },
        };

        // Add the new node
        setNodes((nds) => nds.concat(newNode));

        // Remove the original edge
        setEdges((eds) => eds.filter((e) => e.id !== edgeId));

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
        ];

        setEdges((eds) => [...eds, ...newEdges]);
      }
    },
    [edges, nodes, sidebarItems, setNodes, setEdges]
  );

  // Add a plus button node after the start node if no other nodes exist
  useEffect(() => {
    if (nodes.length === 1 && nodes[0].id === "start" && edges.length === 0) {
      const startNode = nodes[0];
      const plusButtonPosition = {
        x: startNode.position.x + 40,
        y: startNode.position.y + 100,
      };

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
      ]);

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
      ]);
    }
  }, [nodes, edges, setNodes, setEdges]);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex h-screen w-full">
        <Sidebar setSidebarItems={setSidebarItems} />
        <div className="flex h-full flex-1 flex-col">
          <NavigationHeader currentLibrary="Hello Pangea DnD" />
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
              <Controls
                position="bottom-left"
                showInteractive={false}
                className="bg-white"
              />
            </ReactFlow>
          </div>
        </div>
      </div>
    </DragDropContext>
  );
}
