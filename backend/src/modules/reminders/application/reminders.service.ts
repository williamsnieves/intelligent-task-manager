import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reminder } from '../infrastructure/schemas/reminder.schema';
import { OllamaAnalyzer } from '../infrastructure/ollama-analyzer';
import { WhatsAppEvolutionProvider } from '../infrastructure/whatsapp-evolution.provider';
import { TasksService } from '../../tasks/application/tasks.service';
import { UsersService } from '../../users/application/users.service';
import { TaskStatus } from '../../tasks/infrastructure/schemas/task.schema';

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);

  constructor(
    @InjectModel(Reminder.name) private reminderModel: Model<Reminder>,
    private readonly ollamaAnalyzer: OllamaAnalyzer,
    private readonly whatsappProvider: WhatsAppEvolutionProvider,
    private readonly tasksService: TasksService,
    private readonly usersService: UsersService,
  ) {}

  async checkRemindersForUser(userId: string): Promise<number> {
    try {
      // Get user with preferences
      const user = await this.usersService.findById(userId);
      if (!user || !user.notificationsEnabled || !user.phone) {
        this.logger.debug(
          `Skipping reminders for user ${userId}: notifications disabled or no phone`,
        );
        return 0;
      }

      // Check quiet hours
      if (this.isQuietHours(user.reminderPreferences?.quietHours as any)) {
        this.logger.debug(`Skipping reminders for user ${userId}: quiet hours`);
        return 0;
      }

      // Get pending tasks
      const tasks = await this.tasksService.findAll(userId, {
        status: TaskStatus.TODO,
      });

      if (tasks.length === 0) {
        return 0;
      }

      // Filter by priority preferences
      const priorityFilter = user.reminderPreferences?.priorityFilter || [
        'HIGH',
        'URGENT',
      ];
      const filteredTasks = tasks.filter((task) =>
        priorityFilter.includes(task.priority as string),
      );

      if (filteredTasks.length === 0) {
        return 0;
      }

      // AI Analysis

      const recommendations = await this.ollamaAnalyzer.analyze(
        filteredTasks.map((t) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const taskDoc = t as any; // TaskDocument with Mongoose properties
          return {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            _id: taskDoc._id.toString(),
            title: t.title,
            description: t.description,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            priority: t.priority as any,
            dueDate: t.dueDate,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            createdAt: taskDoc.createdAt,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            updatedAt: taskDoc.updatedAt,
            status: t.status as string,
          };
        }),
        user.language || 'es',
      );

      if (recommendations.length === 0) {
        this.logger.debug(`No reminders needed for user ${userId}`);
        return 0;
      }

      // Check rate limiting (max 1 reminder per task per day)
      const validRecommendations = await this.filterRecentReminders(
        userId,
        recommendations,
      );

      // Send WhatsApp notifications
      let sentCount = 0;
      for (const recommendation of validRecommendations) {
        const result = await this.whatsappProvider.send({
          recipient: user.phone,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          taskTitle: recommendation.taskTitle,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          priority: recommendation.priority as string,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          dueDate: recommendation.dueDate?.toLocaleDateString(),
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          daysPending: recommendation.daysPending,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          reasoning: recommendation.reasoning,
          language: user.language || 'es',
        });

        // Save reminder history
        await this.saveReminderHistory(userId, recommendation, result as any);

        if (result.success) {
          sentCount++;
        }
      }

      this.logger.log(
        `Sent ${sentCount} reminders to user ${userId} (${user.phone})`,
      );
      return sentCount;
    } catch (error) {
      this.logger.error(`Failed to check reminders for user ${userId}`, error);
      return 0;
    }
  }

  async checkAllReminders(): Promise<{
    totalUsers: number;
    totalReminders: number;
  }> {
    const users = await this.usersService.findAll();
    const enabledUsers = users.filter(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (u: any) => u.notificationsEnabled && u.phone,
    );

    this.logger.log(
      `Checking reminders for ${enabledUsers.length} users with notifications enabled`,
    );

    let totalReminders = 0;
    for (const user of enabledUsers) {
      const count = await this.checkRemindersForUser(user._id.toString());
      totalReminders += count;
    }

    return {
      totalUsers: enabledUsers.length,
      totalReminders,
    };
  }

  async getHistory(userId: string, limit = 10): Promise<Reminder[]> {
    return (
      this.reminderModel
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        .find({ userId: userId as any })
        .sort({ sentAt: -1 })
        .limit(limit)
        .lean()
        .exec()
    );
  }

  async sendTestNotification(userId: string): Promise<boolean> {
    const user = await this.usersService.findById(userId);
    if (!user || !user.phone) {
      throw new Error('User phone number not configured');
    }

    const result = await this.whatsappProvider.sendTest(user.phone);
    return result.success;
  }

  private isQuietHours(quietHours?: any): boolean {
    if (!quietHours) return false;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const [startHour, startMinute] = quietHours.start.split(':').map(Number);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const [endHour, endMinute] = quietHours.end.split(':').map(Number);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const startTime = startHour * 60 + startMinute;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const endTime = endHour * 60 + endMinute;

    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime <= endTime;
    }

    return currentTime >= startTime && currentTime <= endTime;
  }

  private async filterRecentReminders(
    userId: string,

    recommendations: any[],
  ): Promise<any[]> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const recentReminders = await this.reminderModel
      .find({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        userId: userId as any,
        sentAt: { $gte: oneDayAgo },
        status: 'sent',
      })
      .lean()
      .exec();

    const recentTaskIds = new Set(
      recentReminders.map((r) => r.taskId.toString()),
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
    return recommendations.filter((rec) => !recentTaskIds.has(rec.taskId));
  }

  private async saveReminderHistory(
    userId: string,
    recommendation: any,
    result: any,
  ): Promise<void> {
    try {
      await this.reminderModel.create({
        userId,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        taskId: recommendation.taskId,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        taskTitle: recommendation.taskTitle,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        priority: recommendation.priority,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        sentAt: result.sentAt,
        channel: 'whatsapp',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        status: result.success ? 'sent' : 'failed',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        messageId: result.messageId,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        recipient: result.success ? 'sent' : undefined,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        aiReasoning: recommendation.reasoning,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        urgencyScore: recommendation.urgencyScore,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        error: result.error,
      });
    } catch (error) {
      this.logger.error('Failed to save reminder history', error);
    }
  }
}
