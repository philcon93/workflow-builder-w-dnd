import type React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import WorkflowBuilder from "@/components/hello-pangea/workflow-builder";

// Mock the necessary modules
jest.mock("@xyflow/react", () => {
  const originalModule = jest.requireActual("@xyflow/react");
  return {
    ...originalModule,
    ReactFlow: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="react-flow">{children}</div>
    ),
    ReactFlowProvider: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="react-flow-provider">{children}</div>
    ),
    Background: () => <div data-testid="background" />,
    useNodesState: () => [[], jest.fn(), jest.fn()],
    useEdgesState: () => [[], jest.fn(), jest.fn()],
    useReactFlow: () => ({
      fitView: jest.fn(),
    }),
  };
});

jest.mock("@hello-pangea/dnd", () => {
  return {
    DragDropContext: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="drag-drop-context">{children}</div>
    ),
    Droppable: ({
      children,
    }: {
      children: (provided: any) => React.ReactNode;
    }) =>
      children({
        innerRef: () => {},
        droppableProps: {},
        placeholder: null,
      }),
    Draggable: ({
      children,
    }: {
      children: (provided: any, snapshot: any) => React.ReactNode;
    }) =>
      children(
        {
          innerRef: () => {},
          draggableProps: {},
          dragHandleProps: {},
        },
        { isDragging: false }
      ),
  };
});

jest.mock("lucide-react", () => ({
  Mail: () => <div data-testid="mail-icon" />,
  MessageSquare: () => <div data-testid="message-square-icon" />,
  User: () => <div data-testid="user-icon" />,
  Bell: () => <div data-testid="bell-icon" />,
  Webhook: () => <div data-testid="webhook-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  GitBranch: () => <div data-testid="git-branch-icon" />,
  GripVertical: () => <div data-testid="grip-vertical-icon" />,
}));

describe("WorkflowBuilder", () => {
  it("renders without crashing", () => {
    render(<WorkflowBuilder />);
    expect(screen.getByTestId("react-flow-provider")).toBeInTheDocument();
  });

  it("renders the drag-drop context", () => {
    render(<WorkflowBuilder />);
    expect(screen.getByTestId("drag-drop-context")).toBeInTheDocument();
  });

  it("renders the navigation header", () => {
    render(<WorkflowBuilder />);
    expect(screen.getByText("Hello Pangea DnD")).toBeInTheDocument();
  });
});
