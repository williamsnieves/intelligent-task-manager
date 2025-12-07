import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RemindersService } from '../application/reminders.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RemindersScheduler {
  private readonly logger = new Logger(RemindersScheduler.name);
  private readonly isEnabled: boolean;

  constructor(
    private readonly remindersService: RemindersService,
    private readonly configService: ConfigService,
  ) {
    this.isEnabled =
      this.configService.get<string>('REMINDERS_ENABLED') === 'true';

    if (this.isEnabled) {
      this.logger.log('Reminders scheduler is ENABLED');
    } else {
      this.logger.warn('Reminders scheduler is DISABLED');
    }
  }

  // Run every day at 9:00 AM
  @Cron('0 9 * * *', {
    name: 'daily-reminders-morning',
    timeZone: 'America/New_York',
  })
  async handleDailyMorningReminders(): Promise<void> {
    if (!this.isEnabled) return;

    this.logger.log('Running daily morning reminders check...');
    try {
      const result = await this.remindersService.checkAllReminders();
      this.logger.log(
        `Morning reminders completed: ${result.totalReminders} sent to ${result.totalUsers} users`,
      );
    } catch (error) {
      this.logger.error('Failed to run morning reminders', error);
    }
  }

  // Run every day at 6:00 PM
  @Cron('0 18 * * *', {
    name: 'daily-reminders-evening',
    timeZone: 'America/New_York',
  })
  async handleDailyEveningReminders(): Promise<void> {
    if (!this.isEnabled) return;

    this.logger.log('Running daily evening reminders check...');
    try {
      const result = await this.remindersService.checkAllReminders();
      this.logger.log(
        `Evening reminders completed: ${result.totalReminders} sent to ${result.totalUsers} users`,
      );
    } catch (error) {
      this.logger.error('Failed to run evening reminders', error);
    }
  }

  // Run every 6 hours (for users with higher frequency)
  @Cron(CronExpression.EVERY_6_HOURS, {
    name: 'frequent-reminders',
  })
  async handleFrequentReminders(): Promise<void> {
    if (!this.isEnabled) return;

    this.logger.debug('Running frequent reminders check...');
    try {
      const result = await this.remindersService.checkAllReminders();
      this.logger.debug(
        `Frequent reminders completed: ${result.totalReminders} sent to ${result.totalUsers} users`,
      );
    } catch (error) {
      this.logger.error('Failed to run frequent reminders', error);
    }
  }

  // Manual trigger for testing
  async triggerManualCheck(): Promise<any> {
    this.logger.log('Manual reminders check triggered');
    return this.remindersService.checkAllReminders();
  }
}
