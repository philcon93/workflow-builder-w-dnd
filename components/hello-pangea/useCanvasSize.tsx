import { useStore } from "@xyflow/react";

export const useCanvasSize = () => {
  const { width, height, zoom } = useStore(
    (state) => ({
      width: state.width,
      height: state.height,
      zoom: state.transform[2],
    }),
    (a, b) => a.width === b.width && a.height === b.height && a.zoom === b.zoom
  );

  return { width, height, zoom };
};
