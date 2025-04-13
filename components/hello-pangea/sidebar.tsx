"use client";

import { useEffect, useMemo } from "react";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import {
  Mail,
  MessageSquare,
  User,
  Bell,
  Webhook,
  Clock,
  GitBranch,
} from "lucide-react";

type NodeCategory = {
  title: string;
  items: NodeItem[];
};

type NodeItem = {
  id: string;
  label: string;
  iconName: string;
  category: string;
  color: string;
};

// Function to get the icon component based on name
const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case "mail":
      return <Mail className="h-5 w-5 text-emerald-500" />;
    case "messageSquare":
      return <MessageSquare className="h-5 w-5 text-emerald-500" />;
    case "user":
      return <User className="h-5 w-5 text-amber-500" />;
    case "bell":
      return <Bell className="h-5 w-5 text-indigo-500" />;
    case "webhook":
      return <Webhook className="h-5 w-5 text-blue-500" />;
    case "clock":
      return <Clock className="h-5 w-5 text-blue-500" />;
    case "gitBranch":
      return <GitBranch className="h-5 w-5 text-gray-500" />;
    default:
      return null;
  }
};

export function Sidebar({
  setSidebarItems,
}: {
  setSidebarItems: (items: NodeItem[]) => void;
}) {
  const categories: NodeCategory[] = useMemo(
    () => [
      {
        title: "Actions",
        items: [
          {
            id: "email",
            label: "Email",
            iconName: "mail",
            category: "actions",
            color: "bg-emerald-50",
          },
          {
            id: "sms",
            label: "SMS",
            iconName: "messageSquare",
            category: "actions",
            color: "bg-emerald-50",
          },
          {
            id: "update-profile",
            label: "Update Profile Property",
            iconName: "user",
            category: "actions",
            color: "bg-amber-50",
          },
          {
            id: "notification",
            label: "Notification",
            iconName: "bell",
            category: "actions",
            color: "bg-indigo-50",
          },
          {
            id: "webhook",
            label: "Webhook",
            iconName: "webhook",
            category: "actions",
            color: "bg-blue-50",
          },
        ],
      },
      {
        title: "Timing",
        items: [
          {
            id: "time-delay",
            label: "Time Delay",
            iconName: "clock",
            category: "timing",
            color: "bg-blue-50",
          },
        ],
      },
      {
        title: "Logic",
        items: [
          {
            id: "conditional-split",
            label: "Conditional split",
            iconName: "gitBranch",
            category: "logic",
            color: "bg-gray-50",
          },
        ],
      },
    ],
    []
  );

  // Collect all items for the parent component
  useEffect(() => {
    const allItems = categories.flatMap((category) => category.items);
    setSidebarItems(allItems);
  }, [categories, setSidebarItems]);

  return (
    <div className="w-60 overflow-y-auto border-r border-gray-200 bg-white p-4">
      {categories.map((category, categoryIndex) => (
        <div key={category.title} className="mb-6">
          <h2 className="mb-2 text-lg font-semibold">{category.title}</h2>
          <Droppable
            droppableId={`category-${categoryIndex}`}
            type="NODE"
            isDropDisabled={true}
          >
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="space-y-2"
              >
                {category.items.map((item, index) => (
                  <Draggable
                    key={item.id}
                    draggableId={`sidebar-${item.id}`}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`flex cursor-grab items-center justify-between rounded-md border border-gray-200 bg-white p-3 transition-colors hover:bg-gray-50 ${
                          snapshot.isDragging ? "opacity-50" : ""
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`rounded-md ${item.color} p-1.5`}>
                            {getIconComponent(item.iconName)}
                          </div>
                          <span>{item.label}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-gray-100">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-gray-400"
                            >
                              <circle cx="12" cy="12" r="1" />
                              <circle cx="19" cy="12" r="1" />
                              <circle cx="5" cy="12" r="1" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      ))}
    </div>
  );
}
