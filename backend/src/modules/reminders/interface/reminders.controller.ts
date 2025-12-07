import {
  Controller,
  Get,
  Post,
  UseGuards,
  Req,
  Query,
  Body,
  Patch,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RemindersService } from '../application/reminders.service';
import { RemindersScheduler } from '../infrastructure/reminders.scheduler';
import { UsersService } from '../../users/application/users.service';
import type { Request } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('reminders')
export class RemindersController {
  constructor(
    private readonly remindersService: RemindersService,
    private readonly remindersScheduler: RemindersScheduler,
    private readonly usersService: UsersService,
  ) {}

  @Get('history')
  async getHistory(@Req() req: Request, @Query('limit') limit?: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = (req.user as any).userId as string;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.remindersService.getHistory(userId, limitNum);
  }

  @Post('test')
  async sendTestNotification(@Req() req: Request) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = (req.user as any).userId as string;
    const success = await this.remindersService.sendTestNotification(userId);
    return {
      success,
      message: success
        ? 'Test notification sent successfully'
        : 'Failed to send test notification',
    };
  }

  @Post('trigger')
  async triggerManualCheck(@Req() req: Request) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = (req.user as any).userId as string;
    const count = await this.remindersService.checkRemindersForUser(userId);
    return {
      success: true,
      remindersSent: count,
      message: `${count} reminder(s) sent`,
    };
  }

  @Get('preferences')
  async getPreferences(@Req() req: Request) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = (req.user as any).userId as string;
    const user = await this.usersService.findById(userId);
    return {
      notificationsEnabled: user?.notificationsEnabled,
      phone: user?.phone,
      language: user?.language,
      reminderPreferences: user?.reminderPreferences,
    };
  }

  @Patch('preferences')
  async updatePreferences(@Req() req: Request, @Body() body: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = (req.user as any).userId as string;
    await this.usersService.updateReminderPreferences(userId, body);
    return {
      success: true,
      message: 'Preferences updated successfully',
    };
  }
}
