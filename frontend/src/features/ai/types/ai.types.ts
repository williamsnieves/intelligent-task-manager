import { TaskPriority } from '../../tasks/types';

export interface TitleSuggestion {
  title: string;
  reasoning: string;
}

export interface DescriptionSuggestion {
  description: string;
  reasoning: string;
}

export interface AiAnalysisRequest {
  description: string;
  currentTitle?: string;
}

export interface AiAnalysisResponse {
  priority: TaskPriority;
  dueDate?: string;
  reasoning?: string;
  titleSuggestions?: TitleSuggestion[];
  descriptionSuggestions?: DescriptionSuggestion[];
}

export interface AiHealthResponse {
  available: boolean;
  provider: string;
}

