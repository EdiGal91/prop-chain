import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findByAddress(address: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ address: address.toLowerCase() }).exec();
  }

  async createOrUpdateUser(address: string): Promise<UserDocument> {
    const normalizedAddress = address.toLowerCase();

    const user = await this.userModel
      .findOneAndUpdate(
        { address: normalizedAddress },
        {
          address: normalizedAddress,
          lastLogin: new Date(),
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
        },
      )
      .exec();

    return user;
  }

  async updateLastLogin(address: string): Promise<UserDocument | null> {
    return this.userModel
      .findOneAndUpdate(
        { address: address.toLowerCase() },
        { lastLogin: new Date() },
        { new: true },
      )
      .exec();
  }

  async getUserStats(): Promise<{ totalUsers: number; activeToday: number }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalUsers, activeToday] = await Promise.all([
      this.userModel.countDocuments().exec(),
      this.userModel
        .countDocuments({
          lastLogin: { $gte: today },
        })
        .exec(),
    ]);

    return { totalUsers, activeToday };
  }
}
