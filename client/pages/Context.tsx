import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  MessageSquare,
  Mail,
  FileText,
  Users,
  Plus,
  Trash2,
  Brain,
} from "lucide-react";
import { ContextEntry } from "@shared/types";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
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

const sourceTypeIcons = {
  email: Mail,
  message: MessageSquare,
  note: FileText,
  meeting: Users,
  other: FileText,
};

const sourceTypeColors = {
  email: "bg-blue-100 text-blue-700 border-blue-200",
  message: "bg-green-100 text-green-700 border-green-200",
  note: "bg-yellow-100 text-yellow-700 border-yellow-200",
  meeting: "bg-purple-100 text-purple-700 border-purple-200",
  other: "bg-gray-100 text-gray-700 border-gray-200",
};

export function Context() {
  const [contextEntries, setContextEntries] = useState<ContextEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newEntry, setNewEntry] = useState({
    content: "",
    source_type: "note" as ContextEntry["source_type"],
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchContextEntries();
  }, []);

  const fetchContextEntries = async () => {
    try {
      const response = await fetch("/api/context");
      const data = await response.json();
      setContextEntries(data.contextEntries || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch context entries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry.content.trim()) {
      toast({
        title: "Missing Content",
        description: "Please provide content for the context entry",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEntry),
      });

      if (response.ok) {
        const data = await response.json();
        setContextEntries((prev) => [data.contextEntry, ...prev]);
        setNewEntry({ content: "", source_type: "note" });
        toast({
          title: "Success",
          description: "Context entry added successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add context entry",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/context/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setContextEntries((prev) => prev.filter((entry) => entry.id !== id));
        toast({
          title: "Success",
          description: "Context entry deleted successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete context entry",
        variant: "destructive",
      });
    }
  };

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
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Daily Context
              </h1>
              <p className="text-muted-foreground">
                Add context from your daily activities to help AI better
                understand your work and priorities.
              </p>
            </div>

            {/* Add New Entry Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Add Context Entry</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="source_type">Source Type</Label>
                    <Select
                      value={newEntry.source_type}
                      onValueChange={(value) =>
                        setNewEntry((prev) => ({
                          ...prev,
                          source_type: value as ContextEntry["source_type"],
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4" />
                            <span>Email</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="message">
                          <div className="flex items-center space-x-2">
                            <MessageSquare className="h-4 w-4" />
                            <span>Message</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="note">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4" />
                            <span>Note</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="meeting">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4" />
                            <span>Meeting</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="other">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4" />
                            <span>Other</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      value={newEntry.content}
                      onChange={(e) =>
                        setNewEntry((prev) => ({
                          ...prev,
                          content: e.target.value,
                        }))
                      }
                      placeholder="Describe the context from your day - emails received, meeting notes, important messages, etc."
                      rows={4}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {submitting ? "Adding..." : "Add Entry"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Context Entries */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Recent Context</h2>
              {contextEntries.length === 0 ? (
                <Card className="p-8 text-center">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                      <MessageSquare className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold">No context entries yet</h3>
                      <p className="text-sm text-muted-foreground">
                        Start adding context from your daily activities to
                        improve AI suggestions
                      </p>
                    </div>
                  </div>
                </Card>
              ) : (
                <div className="space-y-4">
                  {contextEntries.map((entry) => {
                    const Icon = sourceTypeIcons[entry.source_type];
                    return (
                      <Card
                        key={entry.id}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4 flex-1">
                              <div className="flex items-center space-x-2">
                                <Icon className="h-5 w-5 text-muted-foreground" />
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-xs",
                                    sourceTypeColors[entry.source_type],
                                  )}
                                >
                                  {entry.source_type}
                                </Badge>
                              </div>
                              <div className="flex-1 space-y-3">
                                <div>
                                  <p className="text-sm leading-relaxed">
                                    {entry.content}
                                  </p>
                                </div>

                                {entry.processed_insights && (
                                  <div className="p-3 bg-muted/50 rounded-lg border">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <Brain className="h-4 w-4 text-purple-600" />
                                      <span className="text-sm font-medium">
                                        AI Insights
                                      </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                      {entry.processed_insights}
                                    </p>
                                  </div>
                                )}

                                <div className="text-xs text-muted-foreground">
                                  Added on{" "}
                                  {format(
                                    new Date(entry.created_at),
                                    "MMM d, yyyy 'at' h:mm a",
                                  )}
                                </div>
                              </div>
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(entry.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
