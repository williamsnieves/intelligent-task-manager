import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IAnalysisStrategy,
  TaskToAnalyze,
  ReminderRecommendation,
} from '../domain/analysis-strategy.interface';

interface OllamaAnalysisResponse {
  reminders: Array<{
    taskId: string;
    urgencyScore: number;
    reasoning: string;
    suggestedAction: string;
  }>;
}

@Injectable()
export class OllamaAnalyzer implements IAnalysisStrategy {
  private readonly logger = new Logger(OllamaAnalyzer.name);
  private readonly ollamaHost: string;
  private readonly ollamaModel: string;

  constructor(private readonly configService: ConfigService) {
    this.ollamaHost =
      this.configService.get<string>('OLLAMA_HOST') || 'http://localhost:11434';
    this.ollamaModel =
      this.configService.get<string>('OLLAMA_MODEL') || 'mistral';
  }

  async analyze(
    tasks: TaskToAnalyze[],
    userLanguage = 'es',
  ): Promise<ReminderRecommendation[]> {
    if (tasks.length === 0) {
      return [];
    }

    try {
      const prompt = this.buildAnalysisPrompt(tasks, userLanguage);
      const response = await this.callOllama(prompt);
      return this.parseResponse(response, tasks);
    } catch (error) {
      this.logger.error('Failed to analyze tasks with Ollama', error);
      // Fallback: Use simple heuristic if AI fails
      return this.fallbackAnalysis(tasks);
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

  private buildAnalysisPrompt(
    tasks: TaskToAnalyze[],
    language: string,
  ): string {
    const today = new Date();
    const languageInstruction =
      language === 'es'
        ? 'Responde en español'
        : language === 'en'
          ? 'Respond in English'
          : `Respond in ${language}`;

    const tasksDescription = tasks
      .map((task, index) => {
        const daysPending = Math.floor(
          (today.getTime() - new Date(task.createdAt).getTime()) /
            (1000 * 60 * 60 * 24),
        );
        const dueInfo = task.dueDate
          ? `Due: ${new Date(task.dueDate).toLocaleDateString()}`
          : 'No due date';

        return `${index + 1}. "${task.title}"
   Priority: ${task.priority}
   ${dueInfo}
   Created: ${daysPending} days ago
   Status: ${task.status}`;
      })
      .join('\n\n');

    return `You are an intelligent task reminder assistant. ${languageInstruction}.

Today's date: ${today.toISOString().split('T')[0]}

Analyze these pending tasks and determine which ones need a reminder:

${tasksDescription}

Criteria for reminders:
- HIGH/URGENT tasks pending > 1 day
- MEDIUM tasks pending > 3 days  
- Tasks with due date in next 24-48 hours
- Tasks that are overdue
- Tasks not updated in several days

For each task that needs a reminder:
1. Calculate urgency score (0-100)
2. Provide reasoning in user's language
3. Suggest an action

Respond ONLY with valid JSON:
{
  "reminders": [
    {
      "taskId": "task_id_here",
      "urgencyScore": 85,
      "reasoning": "Esta tarea de alta prioridad lleva 2 días pendiente y vence mañana",
      "suggestedAction": "Completar hoy para evitar retraso"
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
          temperature: 0.3,
          top_p: 0.9,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = (await response.json()) as { response: string };
    return data.response;
  }

  private parseResponse(
    response: string,
    tasks: TaskToAnalyze[],
  ): ReminderRecommendation[] {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]) as OllamaAnalysisResponse;
      const today = new Date();

      const recommendations: ReminderRecommendation[] = parsed.reminders
        .map((reminder) => {
          const task = tasks.find((t) => t._id === reminder.taskId);
          if (!task) return null;

          const daysPending = Math.floor(
            (today.getTime() - new Date(task.createdAt).getTime()) /
              (1000 * 60 * 60 * 24),
          );

          return {
            taskId: task._id,
            taskTitle: task.title,
            priority: task.priority,
            dueDate: task.dueDate,
            daysPending,
            urgencyScore: reminder.urgencyScore,
            reasoning: reminder.reasoning,
            suggestedAction: reminder.suggestedAction,
          } as ReminderRecommendation;
        })
        .filter((r): r is ReminderRecommendation => r !== null);

      return recommendations;
    } catch (error) {
      this.logger.error('Failed to parse Ollama response', error);
      return this.fallbackAnalysis(tasks);
    }
  }

  private fallbackAnalysis(tasks: TaskToAnalyze[]): ReminderRecommendation[] {
    const today = new Date();
    const recommendations: ReminderRecommendation[] = [];

    for (const task of tasks) {
      const daysPending = Math.floor(
        (today.getTime() - new Date(task.createdAt).getTime()) /
          (1000 * 60 * 60 * 24),
      );

      let needsReminder = false;
      let urgencyScore = 50;
      let reasoning = '';

      // Check if overdue
      if (task.dueDate && new Date(task.dueDate) < today) {
        needsReminder = true;
        urgencyScore = 95;
        reasoning = 'Esta tarea está vencida y necesita atención inmediata';
      }
      // Check if due soon
      else if (task.dueDate) {
        const daysUntilDue = Math.floor(
          (new Date(task.dueDate).getTime() - today.getTime()) /
            (1000 * 60 * 60 * 24),
        );
        if (daysUntilDue <= 1) {
          needsReminder = true;
          urgencyScore = 85;
          reasoning = 'Esta tarea vence pronto';
        }
      }
      // Check by priority and days pending
      else if (
        ((task.priority as string) === 'HIGH' ||
          (task.priority as string) === 'URGENT') &&
        daysPending > 1
      ) {
        needsReminder = true;
        urgencyScore = 75;
        reasoning = `Tarea de prioridad ${task.priority as string} pendiente por ${daysPending} días`;
      } else if ((task.priority as string) === 'MEDIUM' && daysPending > 3) {
        needsReminder = true;
        urgencyScore = 60;
        reasoning = `Tarea pendiente por ${daysPending} días`;
      }

      if (needsReminder) {
        recommendations.push({
          taskId: task._id,
          taskTitle: task.title,
          priority: task.priority,
          dueDate: task.dueDate,
          daysPending,
          urgencyScore,
          reasoning,
          suggestedAction: 'Revisar y completar esta tarea',
        });
      }
    }

    return recommendations.sort((a, b) => b.urgencyScore - a.urgencyScore);
  }
}
