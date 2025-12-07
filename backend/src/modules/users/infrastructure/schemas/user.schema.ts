import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

class QuietHours {
  @Prop({ default: '22:00' })
  start: string;

  @Prop({ default: '08:00' })
  end: string;
}

class ReminderPreferences {
  @Prop({ default: 'daily', enum: ['daily', 'twice-daily', 'every-6-hours'] })
  frequency: string;

  @Prop({ type: QuietHours, default: () => ({ start: '22:00', end: '08:00' }) })
  quietHours: QuietHours;

  @Prop({ type: [String], default: ['HIGH', 'URGENT'] })
  priorityFilter: string[];
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true })
  name: string;

  @Prop({ index: true })
  phone?: string;

  @Prop({ default: false })
  notificationsEnabled: boolean;

  @Prop({ type: ReminderPreferences, default: () => ({}) })
  reminderPreferences: ReminderPreferences;

  @Prop({ default: 'es' })
  language: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
