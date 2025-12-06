import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../../../users/infrastructure/schemas/user.schema';

export type LabelDocument = HydratedDocument<Label>;

@Schema({ timestamps: true })
export class Label {
  @Prop({ required: true })
  name: string;

  @Prop()
  color: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: User;
}

export const LabelSchema = SchemaFactory.createForClass(Label);
