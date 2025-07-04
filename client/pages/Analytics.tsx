import { useState, useEffect } from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isToday,
} from "date-fns";
import {
  ListTodo,
  TrendingUp,
  Clock,
  CheckCircle2,
  Target,
  Calendar,
  Timer,
  Award,
  PieChart,
  BarChart2,
} from "lucide-react";
import { Task, Category } from "@shared/types";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export function Analytics() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksResponse, categoriesResponse] = await Promise.all([
        fetch("/api/tasks"),
        fetch("/api/categories"),
      ]);

      const tasksData = await tasksResponse.json();
      const categoriesData = await categoriesResponse.json();

      setTasks(tasksData.tasks || []);
      setCategories(categoriesData.categories || []);
    } catch (error) {
      console.error("Failed to fetch analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate analytics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const inProgressTasks = tasks.filter(
    (t) => t.status === "in_progress",
  ).length;
  const pendingTasks = tasks.filter((t) => t.status === "pending").length;

  const completionRate =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Priority distribution
  const highPriorityTasks = tasks.filter((t) => t.priority_score >= 4).length;
  const mediumPriorityTasks = tasks.filter(
    (t) => t.priority_score === 3,
  ).length;
  const lowPriorityTasks = tasks.filter((t) => t.priority_score <= 2).length;

  // Weekly productivity
  const weekStart = startOfWeek(new Date());
  const weekEnd = endOfWeek(new Date());
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const thisWeekTasks = tasks.filter((task) => {
    const taskDate = new Date(task.created_at);
    return taskDate >= weekStart && taskDate <= weekEnd;
  });

  // Category breakdown
  const categoryStats = categories.map((category) => ({
    ...category,
    taskCount: tasks.filter((t) => t.category === category.name).length,
    completedCount: tasks.filter(
      (t) => t.category === category.name && t.status === "completed",
    ).length,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
              <p className="text-muted-foreground">
                Track your productivity and task completion patterns.
              </p>
            </div>

            {/* Overview Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Tasks
                  </CardTitle>
                  <ListTodo className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalTasks}</div>
                  <p className="text-xs text-muted-foreground">
                    +{thisWeekTasks.length} this week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Completion Rate
                  </CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {completionRate.toFixed(1)}%
                  </div>
                  <Progress value={completionRate} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    In Progress
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {inProgressTasks}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {pendingTasks} pending
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Completed
                  </CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {completedTasks}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Tasks finished
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Priority Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="h-5 w-5" />
                    <span>Priority Distribution</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-sm">High Priority</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">
                          {highPriorityTasks}
                        </span>
                        <Badge variant="outline" className="priority-high">
                          {totalTasks > 0
                            ? ((highPriorityTasks / totalTasks) * 100).toFixed(
                                0,
                              )
                            : 0}
                          %
                        </Badge>
                      </div>
                    </div>
                    <Progress
                      value={
                        totalTasks > 0
                          ? (highPriorityTasks / totalTasks) * 100
                          : 0
                      }
                      className="h-2"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span className="text-sm">Medium Priority</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">
                          {mediumPriorityTasks}
                        </span>
                        <Badge variant="outline" className="priority-medium">
                          {totalTasks > 0
                            ? (
                                (mediumPriorityTasks / totalTasks) *
                                100
                              ).toFixed(0)
                            : 0}
                          %
                        </Badge>
                      </div>
                    </div>
                    <Progress
                      value={
                        totalTasks > 0
                          ? (mediumPriorityTasks / totalTasks) * 100
                          : 0
                      }
                      className="h-2"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm">Low Priority</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">
                          {lowPriorityTasks}
                        </span>
                        <Badge variant="outline" className="priority-low">
                          {totalTasks > 0
                            ? ((lowPriorityTasks / totalTasks) * 100).toFixed(0)
                            : 0}
                          %
                        </Badge>
                      </div>
                    </div>
                    <Progress
                      value={
                        totalTasks > 0
                          ? (lowPriorityTasks / totalTasks) * 100
                          : 0
                      }
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Category Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart2 className="h-5 w-5" />
                    <span>Category Performance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categoryStats.map((category) => {
                      const completionRate =
                        category.taskCount > 0
                          ? (category.completedCount / category.taskCount) * 100
                          : 0;

                      return (
                        <div key={category.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: category.color }}
                              ></div>
                              <span className="text-sm font-medium">
                                {category.name}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-muted-foreground">
                                {category.completedCount}/{category.taskCount}
                              </span>
                              <Badge variant="outline">
                                {completionRate.toFixed(0)}%
                              </Badge>
                            </div>
                          </div>
                          <Progress value={completionRate} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>This Week's Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-4">
                  {weekDays.map((day, index) => {
                    const dayTasks = tasks.filter((task) => {
                      const taskDate = new Date(task.created_at);
                      return (
                        format(taskDate, "yyyy-MM-dd") ===
                        format(day, "yyyy-MM-dd")
                      );
                    });

                    return (
                      <div
                        key={index}
                        className={`text-center p-3 rounded-lg border ${
                          isToday(day)
                            ? "border-primary bg-primary/5"
                            : "border-border"
                        }`}
                      >
                        <div className="text-xs font-medium text-muted-foreground">
                          {format(day, "EEE")}
                        </div>
                        <div className="text-lg font-bold mt-1">
                          {format(day, "d")}
                        </div>
                        <div className="text-xs mt-1">
                          {dayTasks.length} tasks
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Productivity Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Productivity Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {completionRate > 75
                        ? "Excellent"
                        : completionRate > 50
                          ? "Good"
                          : "Needs Focus"}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Completion Performance
                    </p>
                  </div>

                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(totalTasks / 7)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Avg Tasks/Day
                    </p>
                  </div>

                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {categories.find(
                        (c) =>
                          c.usage_count ===
                          Math.max(...categories.map((cat) => cat.usage_count)),
                      )?.name || "N/A"}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Most Active Category
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
