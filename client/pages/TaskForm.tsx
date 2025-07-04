import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Sparkles, Calendar, Tag, AlertCircle } from "lucide-react";
import { Task, Category, AITaskSuggestion } from "@shared/types";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

export function TaskForm() {
  const [task, setTask] = useState<Partial<Task>>({
    title: "",
    description: "",
    category: "",
    deadline: "",
    priority_score: 3,
    status: "pending",
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<AITaskSuggestion | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const taskId = searchParams.get("id");
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
    if (taskId) {
      fetchTask(taskId);
      setIsEditing(true);
    }
  }, [taskId]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchTask = async (id: string) => {
    try {
      const response = await fetch(`/api/tasks/${id}`);
      const data = await response.json();
      setTask(data.task);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch task",
        variant: "destructive",
      });
    }
  };

  const generateAISuggestions = async () => {
    if (!task.title || !task.description) {
      toast({
        title: "Missing Information",
        description: "Please provide a title and description first",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
        }),
      });

      const data = await response.json();
      setAiSuggestions(data.suggestions);
      toast({
        title: "AI Suggestions Generated",
        description: "Review the suggestions below",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate AI suggestions",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const applySuggestions = () => {
    if (!aiSuggestions) return;

    setTask((prev) => ({
      ...prev,
      priority_score: aiSuggestions.priority_score,
      category: aiSuggestions.suggested_category,
      description: aiSuggestions.enhanced_description,
      deadline: aiSuggestions.suggested_deadline,
    }));

    toast({
      title: "Suggestions Applied",
      description: "AI suggestions have been applied to your task",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.title || !task.description) {
      toast({
        title: "Missing Information",
        description: "Please provide a title and description",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const url = isEditing ? `/api/tasks/${taskId}` : "/api/tasks";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Task ${isEditing ? "updated" : "created"} successfully`,
        });
        navigate("/");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} task`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityLabel = (priority: number) => {
    if (priority >= 4) return "High";
    if (priority === 3) return "Medium";
    return "Low";
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 4) return "text-red-600 bg-red-50 border-red-200";
    if (priority === 3) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-green-600 bg-green-50 border-green-200";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  {isEditing ? "Edit Task" : "Create New Task"}
                </h1>
                <p className="text-muted-foreground">
                  {isEditing
                    ? "Update your task details"
                    : "Add a new task with AI-powered suggestions"}
                </p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Task Form */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Task Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                          id="title"
                          value={task.title}
                          onChange={(e) =>
                            setTask((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          placeholder="What needs to be done?"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                          id="description"
                          value={task.description}
                          onChange={(e) =>
                            setTask((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          placeholder="Provide more details about this task..."
                          rows={4}
                          required
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Select
                            value={task.category}
                            onValueChange={(value) =>
                              setTask((prev) => ({ ...prev, category: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem
                                  key={category.id}
                                  value={category.name}
                                >
                                  <div className="flex items-center space-x-2">
                                    <div
                                      className="h-3 w-3 rounded-full"
                                      style={{
                                        backgroundColor: category.color,
                                      }}
                                    />
                                    <span>{category.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="deadline">Deadline</Label>
                          <Input
                            id="deadline"
                            type="datetime-local"
                            value={task.deadline}
                            onChange={(e) =>
                              setTask((prev) => ({
                                ...prev,
                                deadline: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Priority</Label>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-sm",
                              getPriorityColor(task.priority_score || 3),
                            )}
                          >
                            {getPriorityLabel(task.priority_score || 3)}{" "}
                            Priority
                          </Badge>
                          <Input
                            type="range"
                            min="1"
                            max="5"
                            value={task.priority_score}
                            onChange={(e) =>
                              setTask((prev) => ({
                                ...prev,
                                priority_score: parseInt(e.target.value),
                              }))
                            }
                            className="flex-1"
                          />
                          <span className="text-sm text-muted-foreground w-8">
                            {task.priority_score}/5
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button
                          type="submit"
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                          disabled={isLoading}
                        >
                          {isLoading
                            ? "Saving..."
                            : isEditing
                              ? "Update Task"
                              : "Create Task"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => navigate("/")}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* AI Suggestions Panel */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      <span>AI Assistant</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      onClick={generateAISuggestions}
                      disabled={
                        isGenerating || !task.title || !task.description
                      }
                      className="w-full"
                      variant="outline"
                    >
                      {isGenerating ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600" />
                          <span>Generating...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Sparkles className="h-4 w-4" />
                          <span>Get AI Suggestions</span>
                        </div>
                      )}
                    </Button>

                    {aiSuggestions && (
                      <div className="space-y-4 mt-4">
                        <div className="p-4 border rounded-lg space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-sm">
                              AI Suggestions
                            </h4>
                            <Button
                              size="sm"
                              onClick={applySuggestions}
                              className="text-xs"
                            >
                              Apply All
                            </Button>
                          </div>

                          <div className="space-y-2 text-sm">
                            <div className="flex items-center space-x-2">
                              <AlertCircle className="h-4 w-4 text-purple-600" />
                              <span className="font-medium">Priority:</span>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-xs",
                                  getPriorityColor(
                                    aiSuggestions.priority_score,
                                  ),
                                )}
                              >
                                {aiSuggestions.priority_label}
                              </Badge>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Tag className="h-4 w-4 text-purple-600" />
                              <span className="font-medium">Category:</span>
                              <span className="text-muted-foreground">
                                {aiSuggestions.suggested_category}
                              </span>
                            </div>

                            {aiSuggestions.suggested_deadline && (
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-purple-600" />
                                <span className="font-medium">Deadline:</span>
                                <span className="text-muted-foreground">
                                  {aiSuggestions.suggested_deadline}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <h5 className="font-medium text-sm">
                              Enhanced Description:
                            </h5>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {aiSuggestions.enhanced_description}
                            </p>
                          </div>

                          <div className="space-y-2">
                            <h5 className="font-medium text-sm">Reasoning:</h5>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {aiSuggestions.reasoning}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
