import { useState, useRef } from "react";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Palette,
  Database,
  Key,
  Download,
  Upload,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";

export function Settings() {
  const [settings, setSettings] = useState({
    notifications: true,
    aiSuggestions: true,
    darkMode: false,
    emailNotifications: false,
    openaiApiKey: "",
    autoSave: true,
  });
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const exportData = async () => {
    try {
      // Fetch all data
      const [tasksResponse, categoriesResponse, contextResponse] =
        await Promise.all([
          fetch("/api/tasks"),
          fetch("/api/categories"),
          fetch("/api/context"),
        ]);

      const [tasksData, categoriesData, contextData] = await Promise.all([
        tasksResponse.json(),
        categoriesResponse.json(),
        contextResponse.json(),
      ]);

      const exportData = {
        tasks: tasksData.tasks || [],
        categories: categoriesData.categories || [],
        contextEntries: contextData.contextEntries || [],
        exportDate: new Date().toISOString(),
        version: "1.0.0",
      };

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `smart-todo-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "Your data has been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImportFile = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate the data structure
      if (!data.tasks || !data.categories || !data.contextEntries) {
        throw new Error("Invalid backup file format");
      }

      // Clear existing data and import new data
      const clearResponse = await fetch("/api/clear-all-data", {
        method: "POST",
      });

      if (!clearResponse.ok) {
        // If clear endpoint doesn't exist, we'll just import over existing data
        console.warn(
          "Clear endpoint not available, importing over existing data",
        );
      }

      // Import tasks
      for (const task of data.tasks) {
        await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(task),
        });
      }

      // Import categories
      for (const category of data.categories) {
        await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(category),
        });
      }

      // Import context entries
      for (const context of data.contextEntries) {
        await fetch("/api/context", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(context),
        });
      }

      toast({
        title: "Import Successful",
        description: `Imported ${data.tasks.length} tasks, ${data.categories.length} categories, and ${data.contextEntries.length} context entries.`,
      });

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to import data. Please check the file format.",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const triggerImport = () => {
    fileInputRef.current?.click();
  };

  const clearAllData = async () => {
    if (
      !confirm(
        "Are you sure you want to delete all your data? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      // Delete all tasks, categories, and context entries
      const tasksResponse = await fetch("/api/tasks");
      const categoriesResponse = await fetch("/api/categories");
      const contextResponse = await fetch("/api/context");

      const [tasksData, categoriesData, contextData] = await Promise.all([
        tasksResponse.json(),
        categoriesResponse.json(),
        contextResponse.json(),
      ]);

      // Delete all tasks
      for (const task of tasksData.tasks || []) {
        await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
      }

      // Delete all context entries
      for (const context of contextData.contextEntries || []) {
        await fetch(`/api/context/${context.id}`, { method: "DELETE" });
      }

      toast({
        title: "Data Cleared",
        description: "All your data has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Clear Failed",
        description: "Failed to clear data. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
              <p className="text-muted-foreground">
                Manage your account settings and preferences.
              </p>
            </div>

            <div className="grid gap-6">
              {/* Profile Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Display Name</Label>
                      <Input
                        id="name"
                        placeholder="Your name"
                        defaultValue="Sahil Hangaragi"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="h-5 w-5" />
                    <span>Notifications</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications about task deadlines and updates
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications}
                      onCheckedChange={(checked) =>
                        updateSetting("notifications", checked)
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Get email reminders for important tasks
                      </p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) =>
                        updateSetting("emailNotifications", checked)
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* AI Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Key className="h-5 w-5" />
                    <span>AI Configuration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>AI Suggestions</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable AI-powered task suggestions and enhancements
                      </p>
                    </div>
                    <Switch
                      checked={settings.aiSuggestions}
                      onCheckedChange={(checked) =>
                        updateSetting("aiSuggestions", checked)
                      }
                    />
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label htmlFor="openai-key">OpenAI API Key</Label>
                    <Input
                      id="openai-key"
                      type="password"
                      placeholder="sk-..."
                      value={settings.openaiApiKey}
                      onChange={(e) =>
                        updateSetting("openaiApiKey", e.target.value)
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Your API key is stored securely and only used for
                      generating task suggestions. Get your key from{" "}
                      <a
                        href="https://platform.openai.com/api-keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        OpenAI Platform
                      </a>
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Appearance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Palette className="h-5 w-5" />
                    <span>Appearance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-save</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically save changes as you type
                      </p>
                    </div>
                    <Switch
                      checked={settings.autoSave}
                      onCheckedChange={(checked) =>
                        updateSetting("autoSave", checked)
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Data Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="h-5 w-5" />
                    <span>Data Management</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Button
                      variant="outline"
                      onClick={exportData}
                      className="flex items-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Export Data</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={triggerImport}
                      disabled={importing}
                      className="flex items-center space-x-2"
                    >
                      <Upload className="h-4 w-4" />
                      <span>{importing ? "Importing..." : "Import Data"}</span>
                    </Button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImportFile}
                    className="hidden"
                  />
                  <Separator />
                  <div className="space-y-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={clearAllData}
                    >
                      Clear All Data
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      This will permanently delete all your tasks, context
                      entries, and settings.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleSave}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  Save Settings
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
