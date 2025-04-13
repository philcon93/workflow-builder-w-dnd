import type React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ActionNode } from "@/components/hello-pangea/nodes/action-node";

// Mock the necessary modules
jest.mock("@xyflow/react", () => ({
  Handle: ({ type, position }: { type: string; position: string }) => (
    <div data-testid={`handle-${type}`} data-position={position} />
  ),
  Position: {
    Top: "top",
    Bottom: "bottom",
  },
}));

jest.mock("@hello-pangea/dnd", () => ({
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
  Droppable: ({ children }: { children: (provided: any) => React.ReactNode }) =>
    children({
      innerRef: () => {},
      droppableProps: {},
      placeholder: null,
    }),
}));

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

describe("ActionNode", () => {
  const defaultProps = {
    id: "node-1",
    data: {
      id: "notification",
      label: "Notification",
      iconName: "bell",
      category: "actions",
      color: "bg-indigo-50",
    },
  };

  it("renders without crashing", () => {
    const { getByTestId, getByText } = render(<ActionNode {...defaultProps} />);
    expect(getByTestId("handle-target")).toBeInTheDocument();
    expect(getByTestId("handle-source")).toBeInTheDocument();
    expect(getByText("Notification")).toBeInTheDocument();
    expect(getByTestId("bell-icon")).toBeInTheDocument();
    expect(getByTestId("grip-vertical-icon")).toBeInTheDocument();
  });

  it("renders the correct icon based on iconName", () => {
    const props = {
      ...defaultProps,
      data: {
        ...defaultProps.data,
        iconName: "mail",
      },
    };
    const { getByTestId } = render(<ActionNode {...props} />);
    expect(getByTestId("mail-icon")).toBeInTheDocument();
  });
});
