import { Handle, Position } from "@xyflow/react"
import { Mail, MessageSquare, User, Bell, Webhook, Clock, GitBranch } from "lucide-react"

// Function to get the icon component based on name
const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case "mail":
      return <Mail className="h-5 w-5 text-emerald-500" />
    case "messageSquare":
      return <MessageSquare className="h-5 w-5 text-emerald-500" />
    case "user":
      return <User className="h-5 w-5 text-amber-500" />
    case "bell":
      return <Bell className="h-5 w-5 text-indigo-500" />
    case "webhook":
      return <Webhook className="h-5 w-5 text-blue-500" />
    case "clock":
      return <Clock className="h-5 w-5 text-blue-500" />
    case "gitBranch":
      return <GitBranch className="h-5 w-5 text-gray-500" />
    default:
      return null
  }
}

export function ActionNode({ data }: { data: any }) {
  return (
    <div className={`flex h-16 w-64 items-center justify-start rounded-md ${data.color || "bg-white"} shadow-md`}>
      <Handle type="target" position={Position.Top} id="t" style={{ visibility: "hidden" }} />
      <div className="flex items-center space-x-3 p-4">
        <div>{getIconComponent(data.iconName)}</div>
        <div className="text-md font-medium">{data.label}</div>
      </div>
      <Handle type="source" position={Position.Bottom} id="b" style={{ visibility: "hidden" }} />
    </div>
  )
}
