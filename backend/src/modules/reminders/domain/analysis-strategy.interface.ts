import { TaskPriority } from '../../tasks/infrastructure/schemas/task.schema';

export interface TaskToAnalyze {
  _id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  status: string;
}

export interface ReminderRecommendation {
  taskId: string;
  taskTitle: string;
  priority: TaskPriority;
  dueDate?: Date;
  daysPending: number;
  urgencyScore: number; // 0-100
  reasoning: string;
  suggestedAction: string;
}

export interface IAnalysisStrategy {
  /**
   * Analyzes a list of pending tasks and determines which need reminders
   * @param tasks - Array of pending tasks to analyze
   * @param userLanguage - User's preferred language for reasoning
   * @returns Array of tasks that need reminders with AI reasoning
   */
  analyze(
    tasks: TaskToAnalyze[],
    userLanguage?: string,
  ): Promise<ReminderRecommendation[]>;

  /**
   * Checks if the analysis service is available
   */
  isAvailable(): Promise<boolean>;
}
