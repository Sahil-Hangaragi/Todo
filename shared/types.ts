export interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  priority_score: number;
  deadline?: string;
  status: "pending" | "in_progress" | "completed";
  created_at: string;
  updated_at: string;
}

export interface ContextEntry {
  id: string;
  content: string;
  source_type: "email" | "message" | "note" | "meeting" | "other";
  processed_insights?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  usage_count: number;
  color?: string;
}

export interface AITaskSuggestion {
  priority_score: number;
  priority_label: "Low" | "Medium" | "High";
  suggested_deadline?: string;
  enhanced_description: string;
  suggested_category: string;
  reasoning: string;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  category?: string;
  deadline?: string;
}

export interface AddContextRequest {
  content: string;
  source_type: ContextEntry["source_type"];
}

export interface TaskFilters {
  status?: Task["status"];
  category?: string;
  priority?: "low" | "medium" | "high";
}
