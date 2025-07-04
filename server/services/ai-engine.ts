import OpenAI from "openai";
import { AITaskSuggestion, ContextEntry } from "@shared/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export class AIEngine {
  static async generateTaskSuggestions(
    title: string,
    description: string,
    contextEntries: ContextEntry[] = [],
  ): Promise<AITaskSuggestion> {
    try {
      const context = contextEntries
        .slice(-5) // Use last 5 context entries for relevance
        .map((entry) => `[${entry.source_type}]: ${entry.content}`)
        .join("\n");

      const prompt = `I have the following task:
Title: "${title}"
Description: "${description}"

Here is my recent context:
${context}

Based on this information, please analyze the task and provide suggestions. Respond in JSON format with the following structure:
{
  "priority_score": number (1-5, where 5 is highest priority),
  "priority_label": "Low" | "Medium" | "High",
  "suggested_deadline": "suggested deadline in natural language or ISO date string",
  "enhanced_description": "improved description with context-aware details",
  "suggested_category": "suggested category/tag for this task",
  "reasoning": "brief explanation of your suggestions"
}

Consider factors like:
- Urgency based on keywords and context
- Complexity and time requirements
- Dependencies on other work mentioned in context
- Standard business priorities`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are an AI assistant that helps with intelligent task management. Always respond with valid JSON.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response from AI");
      }

      return JSON.parse(content) as AITaskSuggestion;
    } catch (error) {
      console.error("AI Engine error:", error);
      // Return fallback suggestion
      return {
        priority_score: 3,
        priority_label: "Medium",
        enhanced_description: description,
        suggested_category: "General",
        reasoning: "AI suggestion temporarily unavailable, using defaults",
      };
    }
  }

  static async analyzeContext(content: string): Promise<string> {
    try {
      const prompt = `Analyze the following context and extract key insights that could help with task prioritization and planning:

"${content}"

Provide a brief summary of:
- Key themes or topics
- Urgency indicators
- People or projects mentioned
- Deadlines or time-sensitive items

Keep the response concise (2-3 sentences).`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are an AI assistant that analyzes context for better task management.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.5,
        max_tokens: 200,
      });

      return completion.choices[0]?.message?.content || "No insights available";
    } catch (error) {
      console.error("Context analysis error:", error);
      return "Context analysis temporarily unavailable";
    }
  }
}
