import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { StartNode } from "@/components/hello-pangea/nodes/start-node";

// Mock the necessary modules
jest.mock("@xyflow/react", () => ({
  Handle: ({ type, position }: { type: string; position: string }) => (
    <div data-testid={`handle-${type}`} data-position={position} />
  ),
  Position: {
    Bottom: "bottom",
  },
}));

describe("StartNode", () => {
  it("renders without crashing", () => {
    const { getByTestId, getByText } = render(
      <StartNode data={{ label: "Start" }} />
    );
    expect(getByTestId("handle-source")).toBeInTheDocument();
    expect(getByText("Start")).toBeInTheDocument();
  });

  it("renders with the correct label", () => {
    const { getByText } = render(
      <StartNode data={{ label: "Custom Start" }} />
    );
    expect(getByText("Custom Start")).toBeInTheDocument();
  });
});
