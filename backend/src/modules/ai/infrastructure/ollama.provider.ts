import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IAiProvider,
  IAiAnalysisResult,
} from '../domain/ai-provider.interface';
import { TaskPriority } from '../../tasks/infrastructure/schemas/task.schema';

interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

@Injectable()
export class OllamaProvider implements IAiProvider {
  private readonly logger = new Logger(OllamaProvider.name);
  private readonly ollamaHost: string;
  private readonly ollamaModel: string;

  constructor(private readonly configService: ConfigService) {
    this.ollamaHost =
      this.configService.get<string>('OLLAMA_HOST') || 'http://localhost:11434';
    this.ollamaModel =
      this.configService.get<string>('OLLAMA_MODEL') || 'mistral';
  }

  async analyzeTask(
    description: string,
    currentTitle?: string,
  ): Promise<IAiAnalysisResult> {
    try {
      const prompt = this.buildPrompt(description, currentTitle);
      const response = await this.callOllama(prompt);
      return this.parseResponse(response);
    } catch (error) {
      this.logger.error('Failed to analyze task with Ollama', error);
      throw new Error('AI analysis failed. Please ensure Ollama is running.');
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.ollamaHost}/api/tags`);
      return response.ok;
    } catch (error) {
      this.logger.warn('Ollama is not available', error);
      return false;
    }
  }

  private buildPrompt(description: string, currentTitle?: string): string {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const titleContext = currentTitle
      ? `Current title: "${currentTitle}"\n`
      : '';

    return `You are a multilingual task management AI assistant. Today's date is ${today}.

${titleContext}Task description: "${description}"

IMPORTANT INSTRUCTIONS:
1. Detect the language of the task description
2. Respond in THE SAME LANGUAGE as the user's input
3. All suggestions (titles, descriptions, reasoning) must be in that language

Analyze this task and provide:
1. Priority: Choose ONLY one: LOW, MEDIUM, HIGH, or URGENT
2. Due date: Specific date in YYYY-MM-DD format (consider urgency and complexity)
3. Title suggestions: 2-3 clear, actionable titles (5-8 words each) in the USER'S LANGUAGE
4. Description suggestions: 2-3 improved descriptions with more context in the USER'S LANGUAGE
5. Reasoning: Brief explanation in the USER'S LANGUAGE

CRITICAL: Respond with ONLY valid JSON. No additional text before or after.

Format:
{
  "priority": "MEDIUM",
  "dueDate": "2025-12-15",
  "reasoning": "Brief explanation in user's language",
  "titleSuggestions": [
    {
      "title": "Title in user's language",
      "reasoning": "Why this works (in user's language)"
    },
    {
      "title": "Alternative title in user's language",
      "reasoning": "Why this alternative is good (in user's language)"
    }
  ],
  "descriptionSuggestions": [
    {
      "description": "Improved description in user's language",
      "reasoning": "What makes this better (in user's language)"
    },
    {
      "description": "Alternative description in user's language",
      "reasoning": "Why this alternative works (in user's language)"
    }
  ]
}`;
  }

  private async callOllama(prompt: string): Promise<string> {
    const response = await fetch(`${this.ollamaHost}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.ollamaModel,
        prompt,
        stream: false,
        options: {
          temperature: 0.3, // Lower temperature for more consistent output
          top_p: 0.9,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = (await response.json()) as OllamaResponse;
    return data.response;
  }

  private parseResponse(response: string): IAiAnalysisResult {
    try {
      // Extract JSON from response (LLM might add extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]) as {
        priority: string;
        dueDate?: string;
        reasoning?: string;
        titleSuggestions?: Array<{ title: string; reasoning: string }>;
        descriptionSuggestions?: Array<{
          description: string;
          reasoning: string;
        }>;
      };

      // Validate and normalize priority
      const priority = this.normalizePriority(parsed.priority);

      return {
        priority,
        dueDate: parsed.dueDate,
        reasoning: parsed.reasoning,
        titleSuggestions: parsed.titleSuggestions || [],
        descriptionSuggestions: parsed.descriptionSuggestions || [],
      };
    } catch (error) {
      this.logger.error('Failed to parse Ollama response', error);
      // Fallback to default values
      return {
        priority: TaskPriority.MEDIUM,
        reasoning: 'AI analysis failed to parse. Using default priority.',
        titleSuggestions: [],
        descriptionSuggestions: [],
      };
    }
  }

  private normalizePriority(priority: string): TaskPriority {
    const normalized = priority.toUpperCase();
    if (Object.values(TaskPriority).includes(normalized as TaskPriority)) {
      return normalized as TaskPriority;
    }
    this.logger.warn(`Invalid priority "${priority}", defaulting to MEDIUM`);
    return TaskPriority.MEDIUM;
  }
}
