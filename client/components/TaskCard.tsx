import { useState } from "react";
import { format, isToday, isTomorrow, isPast } from "date-fns";
import {
  Calendar,
  Clock,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle2,
  Circle,
  PlayCircle,
} from "lucide-react";
import { Task } from "@shared/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Task["status"]) => void;
}

export function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
}: TaskCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const getPriorityColor = (priority: number) => {
    if (priority >= 4) return "priority-high";
    if (priority === 3) return "priority-medium";
    return "priority-low";
  };

  const getPriorityLabel = (priority: number) => {
    if (priority >= 4) return "High";
    if (priority === 3) return "Medium";
    return "Low";
  };

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "in_progress":
        return <PlayCircle className="h-5 w-5 text-blue-600" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "MMM d");
  };

  const isOverdue = task.deadline && isPast(new Date(task.deadline));

  const handleStatusChange = async (newStatus: Task["status"]) => {
    setIsLoading(true);
    try {
      await onStatusChange(task.id, newStatus);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      className={cn(
        "group hover:shadow-md transition-all duration-200",
        task.status === "completed" && "opacity-75",
        isOverdue && task.status !== "completed" && "border-red-200",
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <button
              onClick={() =>
                handleStatusChange(
                  task.status === "completed" ? "pending" : "completed",
                )
              }
              disabled={isLoading}
              className="mt-1"
            >
              {getStatusIcon(task.status)}
            </button>
            <div className="flex-1 min-w-0">
              <h3
                className={cn(
                  "font-semibold text-sm leading-tight",
                  task.status === "completed" &&
                    "line-through text-muted-foreground",
                )}
              >
                {task.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {task.description}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  handleStatusChange(
                    task.status === "in_progress" ? "pending" : "in_progress",
                  )
                }
              >
                <PlayCircle className="h-4 w-4 mr-2" />
                {task.status === "in_progress" ? "Mark Pending" : "Start Task"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(task.id)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge
              variant="outline"
              className={cn("text-xs", getPriorityColor(task.priority_score))}
            >
              {getPriorityLabel(task.priority_score)}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {task.category}
            </Badge>
          </div>

          {task.deadline && (
            <div
              className={cn(
                "flex items-center space-x-1 text-xs",
                isOverdue && task.status !== "completed"
                  ? "text-red-600"
                  : "text-muted-foreground",
              )}
            >
              <Calendar className="h-3 w-3" />
              <span>{formatDeadline(task.deadline)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>Created {format(new Date(task.created_at), "MMM d")}</span>
          </div>
          <div className="text-xs">Status: {task.status.replace("_", " ")}</div>
        </div>
      </CardContent>
    </Card>
  );
}
