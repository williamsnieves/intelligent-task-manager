import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  INotificationChannel,
  NotificationMessage,
  NotificationResult,
} from '../domain/notification-channel.interface';

interface EvolutionApiResponse {
  key: {
    remoteJid: string;
    fromMe: boolean;
    id: string;
  };
  message: any;
  messageTimestamp: number;
  status: string;
}

@Injectable()
export class WhatsAppEvolutionProvider implements INotificationChannel {
  private readonly logger = new Logger(WhatsAppEvolutionProvider.name);
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly instanceId: string;

  constructor(private readonly configService: ConfigService) {
    this.apiUrl =
      this.configService.get<string>('WHATSAPP_API_URL') ||
      'http://localhost:8080';
    this.apiKey = this.configService.get<string>('WHATSAPP_API_KEY') || '';
    this.instanceId =
      this.configService.get<string>('WHATSAPP_INSTANCE_ID') || '';
  }

  async send(message: NotificationMessage): Promise<NotificationResult> {
    try {
      const formattedMessage = this.formatMessage(message);
      const response = await this.sendToEvolutionApi(
        message.recipient,
        formattedMessage,
      );

      return {
        success: true,
        messageId: response.key.id,
        sentAt: new Date(response.messageTimestamp * 1000),
      };
    } catch (error) {
      this.logger.error(
        `Failed to send WhatsApp message to ${message.recipient}`,
        error,
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        sentAt: new Date(),
      };
    }
  }

  async sendBatch(
    messages: NotificationMessage[],
  ): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];

    for (const message of messages) {
      const result = await this.send(message);
      results.push(result);

      // Rate limiting: wait 1 second between messages
      if (messages.indexOf(message) < messages.length - 1) {
        await this.sleep(1000);
      }
    }

    return results;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.apiUrl}/instance/connectionState/${this.instanceId}`,
        {
          headers: {
            apikey: this.apiKey,
          },
        },
      );

      if (!response.ok) {
        return false;
      }

      const data = (await response.json()) as { state: string };
      return data.state === 'open';
    } catch (error) {
      this.logger.warn('Evolution API is not available', error);
      return false;
    }
  }

  async sendTest(recipient: string): Promise<NotificationResult> {
    const testMessage: NotificationMessage = {
      recipient,
      taskTitle: 'Test Task',
      priority: 'MEDIUM',
      daysPending: 1,
      reasoning: 'This is a test message from Task Manager',
      language: 'es',
    };

    return this.send(testMessage);
  }

  private formatMessage(message: NotificationMessage): string {
    const emoji = this.getPriorityEmoji(message.priority);
    const dueText = message.dueDate ? `\n⏰ *Vence:* ${message.dueDate}` : '';

    if (message.language === 'es') {
      return `🔔 *Recordatorio de Tarea*

${emoji} Tienes una tarea de prioridad *${message.priority}* pendiente:
"*${message.taskTitle}*"
${dueText}
📅 *Pendiente desde hace:* ${message.daysPending} día${message.daysPending > 1 ? 's' : ''}

💡 ${message.reasoning}

¡No olvides completarla! 💪`;
    } else {
      // English
      return `🔔 *Task Reminder*

${emoji} You have a *${message.priority}* priority task pending:
"*${message.taskTitle}*"
${dueText}
📅 *Pending for:* ${message.daysPending} day${message.daysPending > 1 ? 's' : ''}

💡 ${message.reasoning}

Don't forget to complete it! 💪`;
    }
  }

  private getPriorityEmoji(priority: string): string {
    const emojiMap: Record<string, string> = {
      URGENT: '🔴',
      HIGH: '🟠',
      MEDIUM: '🟡',
      LOW: '🟢',
    };
    return emojiMap[priority] || '⚪';
  }

  private async sendToEvolutionApi(
    recipient: string,
    message: string,
  ): Promise<EvolutionApiResponse> {
    // Format phone number (remove any non-digit characters)
    const formattedPhone = recipient.replace(/\D/g, '');

    // Evolution API expects phone@s.whatsapp.net format
    const remoteJid = `${formattedPhone}@s.whatsapp.net`;

    const response = await fetch(
      `${this.apiUrl}/message/sendText/${this.instanceId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: this.apiKey,
        },
        body: JSON.stringify({
          number: remoteJid,
          text: message,
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Evolution API error: ${response.status} - ${errorText}`);
    }

    return (await response.json()) as EvolutionApiResponse;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
