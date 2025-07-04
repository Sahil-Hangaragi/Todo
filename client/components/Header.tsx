import { useState, useEffect } from "react";
import {
  Moon,
  Sun,
  Plus,
  Bell,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import { useNavigate } from "react-router-dom";
import { Task } from "@shared/types";
import { format, isToday, isTomorrow, isPast } from "date-fns";

export function Header() {
  const { setTheme, theme } = useTheme();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    fetchTasks();
    // Refresh notifications every minute
    const interval = setInterval(fetchTasks, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks");
      const data = await response.json();
      const tasks = data.tasks || [];
      setTasks(tasks);

      // Calculate notification count
      const now = new Date();
      const notifications = tasks.filter((task: Task) => {
        if (task.status === "completed") return false;
        if (!task.deadline) return false;

        const deadline = new Date(task.deadline);
        // Show notifications for overdue and due today/tomorrow
        return isPast(deadline) || isToday(deadline) || isTomorrow(deadline);
      });

      setNotificationCount(notifications.length);
    } catch (error) {
      console.error("Failed to fetch tasks for notifications:", error);
    }
  };

  const getNotifications = () => {
    const now = new Date();
    return tasks
      .filter((task) => {
        if (task.status === "completed") return false;
        if (!task.deadline) return false;

        const deadline = new Date(task.deadline);
        return isPast(deadline) || isToday(deadline) || isTomorrow(deadline);
      })
      .sort(
        (a, b) =>
          new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime(),
      )
      .slice(0, 10); // Show max 10 notifications
  };

  const formatNotificationTime = (deadline: string) => {
    const date = new Date(deadline);
    if (isPast(date)) return "Overdue";
    if (isToday(date)) return "Due today";
    if (isTomorrow(date)) return "Due tomorrow";
    return format(date, "MMM d");
  };

  const getNotificationIcon = (deadline: string) => {
    const date = new Date(deadline);
    if (isPast(date)) return <AlertCircle className="h-4 w-4 text-red-500" />;
    if (isToday(date)) return <Calendar className="h-4 w-4 text-orange-500" />;
    return <Calendar className="h-4 w-4 text-blue-500" />;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center"
              style={{
                backgroundImage:
                  "url(https://ik.imagekit.io/obihp2mbm/pink.webp?updatedAt=1751630982496)",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backgroundSize: "cover",
              }}
            >
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <h1
              className="text-xl font-bold bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "url(https://ik.imagekit.io/obihp2mbm/pink.webp?updatedAt=1751630982496)",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backgroundSize: "cover",
              }}
            >
              Todo
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            onClick={() => navigate("/task")}
            size="sm"
            className="text-white"
            style={{
              backgroundImage:
                "url(https://ik.imagekit.io/obihp2mbm/pink.webp?updatedAt=1751630982496)",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundSize: "cover",
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                {notificationCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="px-3 py-2 text-sm font-semibold border-b">
                Notifications ({notificationCount})
              </div>
              {getNotifications().length === 0 ? (
                <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p>All caught up!</p>
                  <p className="text-xs">No upcoming deadlines</p>
                </div>
              ) : (
                <>
                  {getNotifications().map((task) => (
                    <DropdownMenuItem
                      key={task.id}
                      className="cursor-pointer px-3 py-3"
                      onClick={() => navigate(`/task?id=${task.id}`)}
                    >
                      <div className="flex items-start space-x-3 w-full">
                        {getNotificationIcon(task.deadline!)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {task.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatNotificationTime(task.deadline!)}
                          </p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer px-3 py-2 text-center text-sm text-muted-foreground"
                    onClick={() => navigate("/")}
                  >
                    View all tasks
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
