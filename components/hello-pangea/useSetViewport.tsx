import { useReactFlow } from "@xyflow/react";
import { useCallback, useMemo } from "react";
import { useCanvasSize } from "./useCanvasSize";

export const useSetViewport = () => {
  const { setViewport, getNodes, getNodesBounds, getViewport } = useReactFlow();
  const nodeBounds = getNodesBounds(getNodes());
  const { width } = useCanvasSize();
  const viewport = getViewport();
  const xPosition = useMemo(
    () => width / 2 - nodeBounds.width / 2,
    [nodeBounds.width, width]
  );

  const setFlowViewport = useCallback(
    (YPosition?: number) => {
      setViewport({
        x: xPosition,
        y: YPosition ? YPosition : viewport.y,
        zoom: 1,
      });
    },
    [setViewport, viewport.y, xPosition]
  );

  return {
    setFlowViewport,
  };
};
