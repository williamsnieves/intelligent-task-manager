import { TaskPriority } from '../../tasks/infrastructure/schemas/task.schema';

export class TitleSuggestionDto {
  title: string;
  reasoning: string;
}

export class DescriptionSuggestionDto {
  description: string;
  reasoning: string;
}

export class AiAnalysisResponseDto {
  priority: TaskPriority;
  dueDate?: string;
  reasoning?: string;
  titleSuggestions?: TitleSuggestionDto[];
  descriptionSuggestions?: DescriptionSuggestionDto[];
}

