import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Plus,
  MessageSquare,
  Settings,
  BarChart3,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Create Task",
    href: "/task",
    icon: Plus,
  },
  {
    name: "Context",
    href: "/context",
    icon: MessageSquare,
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div
      className={cn(
        "flex flex-col border-r bg-background transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className,
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b">
        {!collapsed && <h2 className="text-lg font-semibold">Navigation</h2>}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <Button
              key={item.name}
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                collapsed && "px-2",
                isActive &&
                  "bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 dark:from-purple-900/20 dark:to-blue-900/20 dark:text-purple-300",
              )}
              onClick={() => navigate(item.href)}
            >
              <Icon className={cn("h-4 w-4", !collapsed && "mr-2")} />
              {!collapsed && <span>{item.name}</span>}
            </Button>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <div
          className={cn(
            "flex items-center space-x-3",
            collapsed && "justify-center",
          )}
        >
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600" />
          {!collapsed && (
            <div className="flex-1">
              <p className="text-sm font-medium">AI Assistant</p>
              <p className="text-xs text-muted-foreground">AI Powered</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
