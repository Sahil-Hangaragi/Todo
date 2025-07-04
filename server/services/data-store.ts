import { Task, ContextEntry, Category } from "@shared/types";
import { v4 as uuidv4 } from "uuid";

// In-memory storage (replace with database in production)
class DataStore {
  private tasks: Task[] = [
    {
      id: "1",
      title: "Complete project proposal",
      description:
        "Finish the quarterly project proposal for the new product launch",
      category: "Work",
      priority_score: 4,
      deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
      status: "in_progress",
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      updated_at: new Date().toISOString(),
    },
    {
      id: "2",
      title: "Schedule dentist appointment",
      description:
        "Call the dentist office to schedule a routine cleaning appointment",
      category: "Health",
      priority_score: 2,
      status: "pending",
      created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
      updated_at: new Date().toISOString(),
    },
    {
      id: "3",
      title: "Review team presentations",
      description:
        "Go through all team member presentations for next week's client meeting",
      category: "Work",
      priority_score: 3,
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
      status: "completed",
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      updated_at: new Date().toISOString(),
    },
  ];
  private contextEntries: ContextEntry[] = [
    {
      id: "1",
      content:
        "Had a productive meeting with the design team about the new UI components. They mentioned some concerns about accessibility and performance.",
      source_type: "meeting",
      processed_insights:
        "Meeting focused on UI design with emphasis on accessibility and performance optimization. Key concerns raised by design team require attention.",
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    },
    {
      id: "2",
      content:
        "Received email from client requesting expedited delivery of the mobile app features. They want to launch before the holiday season.",
      source_type: "email",
      processed_insights:
        "Client urgency for mobile app delivery before holiday season. Timeline acceleration required for feature completion.",
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    },
  ];
  private categories: Category[] = [
    {
      id: "1",
      name: "Work",
      usage_count: 0,
      color: "#3B82F6",
    },
    {
      id: "2",
      name: "Personal",
      usage_count: 0,
      color: "#10B981",
    },
    {
      id: "3",
      name: "Health",
      usage_count: 0,
      color: "#F59E0B",
    },
    {
      id: "4",
      name: "Learning",
      usage_count: 0,
      color: "#8B5CF6",
    },
    {
      id: "5",
      name: "Finance",
      usage_count: 0,
      color: "#EF4444",
    },
  ];

  // Task operations
  getAllTasks(): Task[] {
    return [...this.tasks].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }

  getTaskById(id: string): Task | undefined {
    return this.tasks.find((task) => task.id === id);
  }

  createTask(taskData: Omit<Task, "id" | "created_at" | "updated_at">): Task {
    const now = new Date().toISOString();
    const task: Task = {
      id: uuidv4(),
      ...taskData,
      created_at: now,
      updated_at: now,
    };

    this.tasks.push(task);

    // Update category usage count
    const category = this.categories.find((c) => c.name === task.category);
    if (category) {
      category.usage_count++;
    }

    return task;
  }

  updateTask(id: string, updates: Partial<Task>): Task | null {
    const taskIndex = this.tasks.findIndex((task) => task.id === id);
    if (taskIndex === -1) return null;

    this.tasks[taskIndex] = {
      ...this.tasks[taskIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    return this.tasks[taskIndex];
  }

  deleteTask(id: string): boolean {
    const initialLength = this.tasks.length;
    this.tasks = this.tasks.filter((task) => task.id !== id);
    return this.tasks.length < initialLength;
  }

  // Category operations
  getAllCategories(): Category[] {
    return [...this.categories].sort((a, b) => b.usage_count - a.usage_count);
  }

  createCategory(name: string, color?: string): Category {
    const category: Category = {
      id: uuidv4(),
      name,
      usage_count: 0,
      color: color || "#6B7280",
    };

    this.categories.push(category);
    return category;
  }

  // Context operations
  getAllContextEntries(): ContextEntry[] {
    return [...this.contextEntries].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }

  getRecentContextEntries(limit: number = 10): ContextEntry[] {
    return this.getAllContextEntries().slice(0, limit);
  }

  createContextEntry(
    contextData: Omit<ContextEntry, "id" | "created_at">,
  ): ContextEntry {
    const contextEntry: ContextEntry = {
      id: uuidv4(),
      ...contextData,
      created_at: new Date().toISOString(),
    };

    this.contextEntries.push(contextEntry);
    return contextEntry;
  }

  deleteContextEntry(id: string): boolean {
    const initialLength = this.contextEntries.length;
    this.contextEntries = this.contextEntries.filter(
      (entry) => entry.id !== id,
    );
    return this.contextEntries.length < initialLength;
  }

  // Filter tasks
  filterTasks(filters: {
    status?: Task["status"];
    category?: string;
    priority?: "low" | "medium" | "high";
  }): Task[] {
    return this.tasks.filter((task) => {
      if (filters.status && task.status !== filters.status) return false;
      if (filters.category && task.category !== filters.category) return false;
      if (filters.priority) {
        const priorityRanges = {
          low: [1, 2],
          medium: [3],
          high: [4, 5],
        };
        const range = priorityRanges[filters.priority];
        if (!range.includes(task.priority_score)) return false;
      }
      return true;
    });
  }
}

// Install uuid package
export const dataStore = new DataStore();
