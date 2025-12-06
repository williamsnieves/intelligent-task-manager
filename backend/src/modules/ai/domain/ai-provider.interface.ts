import { TaskPriority } from '../../tasks/infrastructure/schemas/task.schema';

export interface TitleSuggestion {
  title: string;
  reasoning: string;
}

export interface DescriptionSuggestion {
  description: string;
  reasoning: string;
}

export interface IAiAnalysisResult {
  priority: TaskPriority;
  dueDate?: string; // ISO 8601 format (YYYY-MM-DD)
  reasoning?: string; // Optional explanation from AI
  titleSuggestions?: TitleSuggestion[]; // 2-3 title alternatives
  descriptionSuggestions?: DescriptionSuggestion[]; // 2-3 description alternatives
}

export interface IAiProvider {
  /**
   * Analyzes a task description and suggests priority, due date, titles, and descriptions
   * @param description - The initial task description to analyze
   * @param currentTitle - Optional current title for context
   * @returns Promise with AI analysis result
   */
  analyzeTask(description: string, currentTitle?: string): Promise<IAiAnalysisResult>;

  /**
   * Checks if the AI provider is available/healthy
   * @returns Promise<boolean>
   */
  isAvailable(): Promise<boolean>;
}

