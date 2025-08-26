import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomBytes } from 'crypto';
import { Nonce, NonceDocument } from '../schemas/nonce.schema';

@Injectable()
export class NonceService {
  constructor(
    @InjectModel(Nonce.name) private nonceModel: Model<NonceDocument>,
  ) {
    // Clean up expired and used nonces every 5 minutes
    setInterval(() => this.cleanupNonces(), 5 * 60 * 1000);
  }

  async generateNonce(): Promise<string> {
    const nonce = randomBytes(32).toString('hex');

    // Create nonce in database
    await this.nonceModel.create({
      nonce,
      createdAt: new Date(),
      used: false,
    });

    return nonce;
  }

  async validateAndConsumeNonce(nonce: string): Promise<boolean> {
    const nonceDoc = await this.nonceModel
      .findOne({
        nonce,
        used: false,
      })
      .exec();

    if (!nonceDoc) {
      throw new UnauthorizedException('Invalid or expired nonce');
    }

    // Check if nonce is expired (10 minutes)
    const now = new Date();
    const expirationTime = new Date(
      nonceDoc.createdAt.getTime() + 10 * 60 * 1000,
    );

    if (now > expirationTime) {
      // Clean up expired nonce
      await this.nonceModel.deleteOne({ _id: nonceDoc._id }).exec();
      throw new UnauthorizedException('Nonce has expired');
    }

    // Mark nonce as used
    await this.nonceModel
      .findByIdAndUpdate(nonceDoc._id, { used: true }, { new: true })
      .exec();

    return true;
  }

  private async cleanupNonces(): Promise<void> {
    const expiredTime = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago

    // Remove expired or used nonces
    await this.nonceModel
      .deleteMany({
        $or: [{ createdAt: { $lt: expiredTime } }, { used: true }],
      })
      .exec();
  }

  async getNonceStats(): Promise<{ activeNonces: number; usedNonces: number }> {
    const [activeNonces, usedNonces] = await Promise.all([
      this.nonceModel.countDocuments({ used: false }).exec(),
      this.nonceModel.countDocuments({ used: true }).exec(),
    ]);

    return { activeNonces, usedNonces };
  }
}
