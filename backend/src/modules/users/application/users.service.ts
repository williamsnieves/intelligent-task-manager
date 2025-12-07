import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../infrastructure/schemas/user.schema';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, name } = createUserDto;
    const passwordHash = await bcrypt.hash(password, 10);

    const createdUser = new this.userModel({
      email,
      name,
      passwordHash,
    });
    return createdUser.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(userId: string): Promise<UserDocument | null> {
    return this.userModel.findById(userId as any).exec();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async updateReminderPreferences(
    userId: string,
    preferences: any,
  ): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(
        userId as any,
        {
          $set: {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            notificationsEnabled: preferences.notificationsEnabled,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            phone: preferences.phone,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            language: preferences.language,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            reminderPreferences: preferences.reminderPreferences,
          },
        },
        { new: true },
      )
      .exec();
  }
}
