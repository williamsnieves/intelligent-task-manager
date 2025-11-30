import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Project } from '../../../projects/infrastructure/schemas/project.schema';
import { Label } from '../../../labels/infrastructure/schemas/label.schema';
import { User } from '../../../users/infrastructure/schemas/user.schema';

export type TaskDocument = HydratedDocument<Task>;

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ enum: TaskStatus, default: TaskStatus.TODO })
  status: TaskStatus;

  @Prop({ enum: TaskPriority, default: TaskPriority.MEDIUM })
  priority: TaskPriority;

  @Prop()
  dueDate: Date;

  @Prop({ type: Types.ObjectId, ref: 'Project', index: true })
  projectId: Project;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Label' }] })
  labels: Label[];

  @Prop()
  aiSuggestedPriority: string;

  @Prop()
  aiSuggestedDueDate: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: User;
}

export const TaskSchema = SchemaFactory.createForClass(Task);

