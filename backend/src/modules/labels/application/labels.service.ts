import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Label, LabelDocument } from '../infrastructure/schemas/label.schema';
import { CreateLabelDto, UpdateLabelDto } from '../dto/label.dto';

@Injectable()
export class LabelsService {
  constructor(
    @InjectModel(Label.name) private labelModel: Model<LabelDocument>,
  ) {}

  async create(userId: string, createLabelDto: CreateLabelDto): Promise<Label> {
    const newLabel = new this.labelModel({
      ...createLabelDto,
      userId,
    });
    return newLabel.save();
  }

  async findAll(userId: string): Promise<Label[]> {
    return this.labelModel.find({ userId: userId } as any).exec();
  }

  async findOne(userId: string, labelId: string): Promise<Label> {
    const label = await this.labelModel.findOne({ _id: labelId, userId: userId } as any).exec();
    if (!label) {
      throw new NotFoundException('Label not found or access denied');
    }
    return label;
  }

  async update(userId: string, labelId: string, updateLabelDto: UpdateLabelDto): Promise<Label> {
    const label = await this.labelModel.findOneAndUpdate(
      { _id: labelId, userId: userId } as any,
      updateLabelDto,
      { new: true },
    ).exec();

    if (!label) {
      throw new NotFoundException('Label not found or access denied');
    }
    return label;
  }

  async remove(userId: string, labelId: string): Promise<void> {
    const result = await this.labelModel.deleteOne({ _id: labelId, userId: userId } as any).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Label not found or access denied');
    }
  }
}

