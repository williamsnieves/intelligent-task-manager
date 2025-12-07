import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Reminder extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Task', required: true, index: true })
  taskId: Types.ObjectId;

  @Prop({ required: true })
  taskTitle: string;

  @Prop({ required: true })
  priority: string;

  @Prop({ required: true })
  sentAt: Date;

  @Prop({
    required: true,
    enum: ['whatsapp', 'email', 'push'],
    default: 'whatsapp',
  })
  channel: string;

  @Prop({
    required: true,
    enum: ['sent', 'failed', 'delivered', 'read'],
    default: 'sent',
  })
  status: string;

  @Prop()
  messageId?: string;

  @Prop()
  recipient: string;

  @Prop()
  aiReasoning: string;

  @Prop()
  urgencyScore: number;

  @Prop()
  error?: string;
}

export const ReminderSchema = SchemaFactory.createForClass(Reminder);

// Indexes for efficient queries
ReminderSchema.index({ userId: 1, sentAt: -1 });
ReminderSchema.index({ taskId: 1 });
ReminderSchema.index({ status: 1, sentAt: -1 });
