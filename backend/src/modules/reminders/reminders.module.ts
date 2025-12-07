import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { RemindersService } from './application/reminders.service';
import { RemindersController } from './interface/reminders.controller';
import { RemindersScheduler } from './infrastructure/reminders.scheduler';
import { OllamaAnalyzer } from './infrastructure/ollama-analyzer';
import { WhatsAppEvolutionProvider } from './infrastructure/whatsapp-evolution.provider';
import {
  Reminder,
  ReminderSchema,
} from './infrastructure/schemas/reminder.schema';
import { TasksModule } from '../tasks/tasks.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([
      { name: Reminder.name, schema: ReminderSchema },
    ]),
    TasksModule,
    UsersModule,
  ],
  controllers: [RemindersController],
  providers: [
    RemindersService,
    RemindersScheduler,
    OllamaAnalyzer,
    WhatsAppEvolutionProvider,
  ],
  exports: [RemindersService],
})
export class RemindersModule {}
