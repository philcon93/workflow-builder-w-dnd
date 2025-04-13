import { useReactFlow, CoordinateExtent } from "@xyflow/react";
import { useMemo } from "react";
import { useCanvasSize } from "./useCanvasSize";

const translatePadding = 20;

export const useTranslateExtent = () => {
  const { getNodes, getNodesBounds } = useReactFlow();
  const nodes = getNodes();
  const bounds = getNodesBounds(nodes);
  const { width, height, zoom } = useCanvasSize();

  /**
   * Will ensure when a user scrolls down it will always show the first node,
   * and when the user scrolls up, it will always show the last node.
   */
  const translateExtent = useMemo(() => {
    const firstNode = nodes[0];
    const lastNode = nodes[nodes.length - 1];

    const topLeft: CoordinateExtent[0] = [
      (bounds.x - width + translatePadding) * (1 / zoom),
      (bounds.y -
        height +
        (translatePadding + (firstNode?.measured?.height || 0))) *
        (1 / zoom),
    ];
    const bottomRight: CoordinateExtent[1] = [
      (bounds.x + width + bounds.width + translatePadding) * (1 / zoom),
      (bounds.y +
        height +
        bounds.height -
        (translatePadding + (lastNode?.measured?.height || 0))) *
        (1 / zoom),
    ];

    const extent: CoordinateExtent = [topLeft, bottomRight];

    return extent;
  }, [bounds, nodes, width, height, zoom]);

  return {
    translateExtent,
  };
};
