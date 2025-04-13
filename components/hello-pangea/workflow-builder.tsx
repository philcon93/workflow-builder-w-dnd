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
  PanOnScrollMode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { Sidebar } from "./sidebar";
import { ActionNode, StartNode } from "./nodes";
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

// Initial nodes with Start, Update Profile Property, and Notification
const initialNodes: Node[] = [
  {
    id: "start",
    type: "start",
    position: { x: 250, y: 0 },
    data: { label: "Start" },
  },
  {
    id: "update-profile",
    type: "action",
    position: { x: 250, y: 150 },
    data: {
      id: "update-profile",
      label: "Update Profile Property",
      iconName: "user",
      category: "actions",
      color: "bg-amber-50",
    },
  },
  {
    id: "notification",
    type: "action",
    position: { x: 250, y: 300 },
    data: {
      id: "notification",
      label: "Notification",
      iconName: "bell",
      category: "actions",
      color: "bg-indigo-50",
    },
  },
];

// Initial edges connecting the nodes
const initialEdges: Edge[] = [
  {
    id: "e-start-update-profile",
    source: "start",
    target: "update-profile",
    type: "dropzone",
    animated: false,
    style: { strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    sourceHandle: "b",
    targetHandle: "t",
  },
  {
    id: "e-update-profile-notification",
    source: "update-profile",
    target: "notification",
    type: "dropzone",
    animated: false,
    style: { strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    sourceHandle: "b",
    targetHandle: "t",
  },
];

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
      const { destination, source, draggableId } = result;

      // If dropped outside a droppable area
      if (!destination) {
        return;
      }

      // If dropped on an edge
      if (destination.droppableId.startsWith("edge-")) {
        const edgeId = destination.droppableId.replace("edge-", "");
        const edge = edges.find((e) => e.id === edgeId);

        if (!edge) return;

        // Check if this is a node being reordered (dragged from the flow)
        const isNodeReordering = source.droppableId.startsWith("node-");
        const draggedNodeId = isNodeReordering
          ? draggableId.replace("node-", "")
          : null;

        if (isNodeReordering) {
          // Handle node reordering
          const draggedNode = nodes.find((n) => n.id === draggedNodeId);
          if (!draggedNode) return;

          // Find the source and target nodes of the edge
          const sourceNode = nodes.find((n) => n.id === edge.source);
          const targetNode = nodes.find((n) => n.id === edge.target);
          if (!sourceNode || !targetNode) return;

          // Remove the dragged node from its current position
          // We need to find all edges connected to this node
          const incomingEdge = edges.find((e) => e.target === draggedNodeId);
          const outgoingEdge = edges.find((e) => e.source === draggedNodeId);

          if (!incomingEdge || !outgoingEdge) return;

          // Connect the nodes that were connected to the dragged node
          const newConnectingEdge = {
            id: `e-${incomingEdge.source}-${outgoingEdge.target}`,
            source: incomingEdge.source,
            target: outgoingEdge.target,
            type: "dropzone",
            animated: false,
            style: { strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
            sourceHandle: incomingEdge.sourceHandle,
            targetHandle: outgoingEdge.targetHandle,
          };

          // Remove the original edge and the edges connected to the dragged node
          const edgesToRemove = [edgeId, incomingEdge.id, outgoingEdge.id];
          const filteredEdges = edges.filter(
            (e) => !edgesToRemove.includes(e.id)
          );

          // Create new edges for the dragged node in its new position
          const newEdges = [
            {
              id: `e-${edge.source}-${draggedNodeId}`,
              source: edge.source,
              target: draggedNodeId,
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
              id: `e-${draggedNodeId}-${edge.target}`,
              source: draggedNodeId,
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
            newConnectingEdge,
          ];

          // Calculate new position for the dragged node
          const midX = (sourceNode.position.x + targetNode.position.x) / 2;
          const midY = (sourceNode.position.y + targetNode.position.y) / 2 + 50;

          // Update the node position
          setNodes((nds) =>
            nds.map((n) => {
              if (n.id === draggedNodeId) {
                return {
                  ...n,
                  position: { x: midX, y: midY },
                };
              }
              return n;
            })
          );

          // Update edges
          setEdges([...filteredEdges, ...newEdges]);
        } else {
          // Handle new node from sidebar
          // Find the item that was dragged
          const sidebarId = draggableId.replace("sidebar-", "");
          const item = sidebarItems.find((item) => item.id === sidebarId);
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
      }
    },
    [edges, nodes, sidebarItems, setNodes, setEdges]
  );

  // Add a plus button node at the end of the workflow
  useEffect(() => {
    // Find the last node in the workflow
    const lastNode = nodes.find((node) => {
      // A node is the last node if it has no outgoing edges
      return !edges.some((edge) => edge.source === node.id);
    });

    // If there's no last node or it's already a plus button, do nothing
    if (!lastNode || lastNode.id === "plus-button") return;

    // Calculate position for the plus button
    const plusButtonPosition = {
      x: lastNode.position.x + 110,
      y: lastNode.position.y + 150,
    };

    // Check if plus button already exists
    const plusButtonExists = nodes.some((node) => node.id === "plus-button");

    // If plus button doesn't exist, add it
    if (!plusButtonExists) {
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

      // Add an edge from the last node to the plus button
      setEdges((eds) => [
        ...eds,
        {
          id: `e-${lastNode.id}-plus`,
          source: lastNode.id,
          target: "plus-button",
          type: "dropzone",
          style: { strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
          sourceHandle: "b",
        },
      ]);
    } else {
      // Update plus button position and connection if it exists
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === "plus-button") {
            return {
              ...node,
              position: plusButtonPosition,
            };
          }
          return node;
        })
      );

      // Update or add the edge from the last node to the plus button
      const edgeExists = edges.some((edge) => edge.target === "plus-button");
      if (!edgeExists) {
        setEdges((eds) => [
          ...eds,
          {
            id: `e-${lastNode.id}-plus`,
            source: lastNode.id,
            target: "plus-button",
            type: "dropzone",
            style: { strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
            sourceHandle: "b",
          },
        ]);
      } else {
        setEdges((eds) =>
          eds.map((edge) => {
            if (edge.target === "plus-button") {
              return {
                ...edge,
                source: lastNode.id,
                id: `e-${lastNode.id}-plus`,
              };
            }
            return edge;
          })
        );
      }
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
              panOnScroll
              panOnScrollMode={PanOnScrollMode.Vertical}
              zoomOnScroll={false}
              panOnDrag={false}
              nodesDraggable={false}
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
