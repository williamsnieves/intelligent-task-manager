import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../../../users/infrastructure/schemas/user.schema';

export type ProjectDocument = HydratedDocument<Project>;

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true })
  name: string;

  @Prop({ default: '#000000' })
  color: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: User;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
