import {
  IsBoolean,
  IsString,
  IsEnum,
  IsOptional,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TaskPriority } from '../../tasks/infrastructure/schemas/task.schema';

class QuietHoursDto {
  @IsString()
  start: string; // Format: "22:00"

  @IsString()
  end: string; // Format: "08:00"
}

export class UpdateReminderPreferencesDto {
  @IsString()
  @IsOptional()
  phone?: string;

  @IsBoolean()
  @IsOptional()
  notificationsEnabled?: boolean;

  @IsEnum(['daily', 'twice-daily', 'every-6-hours'])
  @IsOptional()
  frequency?: 'daily' | 'twice-daily' | 'every-6-hours';

  @ValidateNested()
  @Type(() => QuietHoursDto)
  @IsOptional()
  quietHours?: QuietHoursDto;

  @IsArray()
  @IsEnum(TaskPriority, { each: true })
  @IsOptional()
  priorityFilter?: TaskPriority[];

  @IsString()
  @IsOptional()
  language?: string; // 'es', 'en', etc.
}
