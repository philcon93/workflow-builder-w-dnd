"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Background,
  type Connection,
  type Edge,
  type Node,
  type NodeTypes,
  type EdgeTypes,
  MarkerType,
  PanOnScrollMode,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { Sidebar } from "./sidebar";
import { StartNode } from "./nodes/start-node";
import { ActionNode } from "./nodes/action-node";
import { EndNode } from "./nodes/end-node";
import { EdgeDropZone } from "./edge-drop-zone";
import { NavigationHeader } from "../navigation-header";
import { useSetViewport } from "./useSetViewport";
import { useCanvasSize } from "./useCanvasSize";
import { useTranslateExtent } from "./useTranslateExtent";
import { getLayoutedElements } from "./getLayoutedElements";

// Define custom node types
const nodeTypes: NodeTypes = {
  start: StartNode,
  action: ActionNode,
  end: EndNode,
};

// Define custom edge types
const edgeTypes: EdgeTypes = {
  dropzone: EdgeDropZone,
};

// Initial nodes without specific positions (dagre will handle positioning)
const initialNodes: Node[] = [
  {
    id: "start",
    type: "start",
    position: { x: 0, y: 0 }, // Position will be calculated by dagre
    data: { label: "Start" },
  },
  {
    id: "update-profile",
    type: "action",
    position: { x: 0, y: 0 }, // Position will be calculated by dagre
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
    position: { x: 0, y: 0 }, // Position will be calculated by dagre
    data: {
      id: "notification",
      label: "Notification",
      iconName: "bell",
      category: "actions",
      color: "bg-indigo-50",
    },
  },
  {
    id: "end",
    type: "end",
    position: { x: 0, y: 0 }, // Position will be calculated by dagre
    data: { label: "End" },
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
  {
    id: "e-notification-end",
    source: "notification",
    target: "end",
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
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [sidebarItems, setSidebarItems] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const isLayoutingRef = useRef(false);

  const { translateExtent } = useTranslateExtent();
  const { setFlowViewport } = useSetViewport();
  const { width } = useCanvasSize();
  const [viewportInitialized, setViewportInitialized] = useState(false);

  // Handle edge hover state changes
  const handleEdgeHover = useCallback(
    (edgeId: string, isHovered: boolean) => {
      if (isHovered) {
        setHoveredEdgeId(edgeId);
      } else if (hoveredEdgeId === edgeId) {
        setHoveredEdgeId(null);
      }
    },
    [hoveredEdgeId]
  );

  // Initialize the layout only once
  useEffect(() => {
    if (!isInitialized && !isLayoutingRef.current) {
      isLayoutingRef.current = true;
      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedElements(initialNodes, initialEdges);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      setIsInitialized(true);
      isLayoutingRef.current = false;
    }
  }, [isInitialized, setNodes, setEdges]);

  // Apply layout function - only called explicitly, not in useEffect
  const applyLayout = useCallback(() => {
    if (isLayoutingRef.current) return;
    isLayoutingRef.current = true;

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodes,
      edges,
      hoveredEdgeId,
      isDragging
    );

    // Update nodes with new positions
    setNodes((nds) =>
      nds.map((node) => {
        const layoutNode = layoutedNodes.find((n) => n.id === node.id);
        if (layoutNode) {
          return {
            ...node,
            position: layoutNode.position,
          };
        }
        return node;
      })
    );

    // Set timeout to reset the layouting flag
    setTimeout(() => {
      isLayoutingRef.current = false;
    }, 50);
  }, [nodes, edges, setNodes, hoveredEdgeId, isDragging]);

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

  // Handle drag start
  const onDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  // Handle drag end from hello-pangea/dnd
  const onDragEnd = useCallback(
    (result: DropResult) => {
      setIsDragging(false);
      setHoveredEdgeId(null);

      // Apply layout with default spacing
      setTimeout(() => {
        applyLayout();
      }, 50);

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

        if (isNodeReordering && draggedNodeId) {
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

          // Update edges
          setEdges([...filteredEdges, ...newEdges]);

          // Schedule layout after state updates are complete
          setTimeout(applyLayout, 50);
        } else {
          // Handle new node from sidebar
          // Find the item that was dragged
          const sidebarId = draggableId.replace("sidebar-", "");
          const item = sidebarItems.find((item) => item.id === sidebarId);
          if (!item) return;

          // Create a new node (position will be calculated by dagre)
          const newNode = {
            id: `${item.category}-${Date.now()}`,
            type: "action",
            position: { x: 0, y: 0 }, // Temporary position, will be updated by dagre
            data: { ...item },
          };

          // Remove the original edge
          const updatedEdges = edges.filter((e) => e.id !== edgeId);

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

          // Update state in a single batch
          setNodes((nds) => [...nds, newNode]);
          setEdges([...updatedEdges, ...newEdges]);

          // Schedule layout after state updates are complete
          setTimeout(applyLayout, 50);
        }
      }
    },
    [edges, nodes, sidebarItems, setNodes, setEdges, applyLayout]
  );

  // Handle viewport initialization
  useEffect(() => {
    if (nodes.length > 0 && !viewportInitialized) {
      setViewportInitialized(true);
      // set initial viewport
      setFlowViewport(0.3);
    }
  }, [nodes.length, setFlowViewport, viewportInitialized]);

  // Handle viewport updates on window resize
  useEffect(() => {
    if (width > 0 && viewportInitialized) {
      setFlowViewport(0.3);
    }
  }, [width, setFlowViewport, viewportInitialized]);

  // Apply layout when nodes or edges change significantly
  useEffect(() => {
    if (isInitialized && nodes.length > 0 && !isLayoutingRef.current) {
      // This will only run after initial setup and when nodes/edges change
      // due to user actions, not during the layout process itself
      applyLayout();
    }
  }, [isInitialized, nodes.length, edges.length, applyLayout]);

  // Apply layout when hoveredEdgeId changes during dragging
  useEffect(() => {
    if (isInitialized && !isLayoutingRef.current) {
      applyLayout();
    }
  }, [hoveredEdgeId, isInitialized, applyLayout]);

  // Memoize the edges with isDragging state to prevent unnecessary re-renders
  const edgesWithDraggingState = useMemo(() => {
    return edges.map((edge) => ({
      ...edge,
      data: {
        ...edge.data,
        isDragging,
        onHoverChange: handleEdgeHover,
        isHovered: edge.id === hoveredEdgeId,
      },
    }));
  }, [edges, isDragging, hoveredEdgeId, handleEdgeHover]);

  return (
    <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="flex h-screen w-full">
        <Sidebar setSidebarItems={setSidebarItems} />
        <div className="flex h-full flex-1 flex-col">
          <NavigationHeader currentLibrary="Hello Pangea DnD" />
          <div className="h-full w-full flex-1" ref={reactFlowWrapper}>
            <ReactFlow
              nodes={nodes}
              edges={edgesWithDraggingState}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              fitView={true}
              fitViewOptions={{ padding: 0.2 }}
              panOnScroll
              panOnScrollMode={PanOnScrollMode.Vertical}
              zoomOnScroll={false}
              panOnDrag={false}
              nodesDraggable={false}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              proOptions={{ hideAttribution: true }}
              edgesFocusable={false}
              defaultEdgeOptions={{ selectable: false }}
              nodesFocusable={false}
              translateExtent={translateExtent}
            >
              <Background color="#aaa" gap={16} />
            </ReactFlow>
          </div>
        </div>
      </div>
    </DragDropContext>
  );
}
