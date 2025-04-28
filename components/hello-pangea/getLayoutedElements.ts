"use client";
import { type Edge, type Node } from "@xyflow/react";
import dagre from "@dagrejs/dagre";

// Function to calculate layout using dagre with custom ranksep for hovered edge
export const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  hoveredEdgeId: string | null = null,
  isDragging = false
) => {
  if (nodes.length === 0) return { nodes, edges };

  // Create a new directed graph
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Set graph options
  const nodeWidth = 256; // Width of our nodes
  const nodeHeight = 64; // Height of our nodes

  // Default ranksep is 50
  const defaultRanksep = 50;
  const expandedRanksep = 100;

  // Set the default graph settings
  dagreGraph.setGraph({
    rankdir: "TB",
    nodesep: 80,
    ranksep: defaultRanksep,
    marginx: 20,
    marginy: 20,
  });

  // Add nodes to the graph with their dimensions
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  // Add edges to the graph with custom weights for the hovered edge
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Calculate the layout
  dagre.layout(dagreGraph);

  // Get the positioned nodes from the layout
  let layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    if (!nodeWithPosition) return node;

    return {
      ...node,
      // We need to center the node based on the calculated position
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  // Find the hovered edge if any
  const hoveredEdge = hoveredEdgeId
    ? edges.find((e) => e.id === hoveredEdgeId)
    : null;

  // If we have a hovered edge and we're dragging, adjust the positions of nodes after the target node
  if (hoveredEdge && isDragging) {
    const sourceNode = layoutedNodes.find((n) => n.id === hoveredEdge.source);
    const targetNode = layoutedNodes.find((n) => n.id === hoveredEdge.target);

    if (sourceNode && targetNode) {
      // Calculate the extra space needed
      const extraSpace = expandedRanksep - defaultRanksep;

      // Find all nodes that are positioned below the target node
      const nodesBelow = layoutedNodes.filter((n) => {
        // If the node is positioned below the target node
        return n.position.y >= targetNode.position.y;
      });

      // Move all nodes below the target node down by the extra space
      layoutedNodes = layoutedNodes.map((node) => {
        if (nodesBelow.some((n) => n.id === node.id)) {
          console.info(node.id);
          return {
            ...node,
            position: {
              x: node.position.x,
              y: node.position.y + extraSpace,
            },
          };
        }
        return node;
      });
    }
  }

  return { nodes: layoutedNodes, edges };
};
