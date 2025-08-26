import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SiweMessage } from 'siwe';
import { JwtPayload } from '../interfaces/user.interface';
import { NonceService } from './nonce.service';
import { UserService, UserDocument } from '../../user';

@Injectable()
export class SiweService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private nonceService: NonceService,
  ) {}

  async generateNonce(): Promise<string> {
    return this.nonceService.generateNonce();
  }

  async verifySignature(
    message: string,
    signature: string,
  ): Promise<{ token: string; user: UserDocument }> {
    try {
      const siweMessage = new SiweMessage(message);

      // Validate and consume nonce
      await this.nonceService.validateAndConsumeNonce(siweMessage.nonce);

      // Verify the signature
      await siweMessage.verify({ signature });

      // Get or create user
      const user = await this.userService.createOrUpdateUser(
        siweMessage.address,
      );

      // Generate JWT token
      const payload: JwtPayload = { address: user.address };
      const token = this.jwtService.sign(payload);

      return { token, user };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid signature or message');
    }
  }

  validateToken(token: string): JwtPayload {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async getUser(address: string): Promise<UserDocument | null> {
    return this.userService.findByAddress(address);
  }

  async getUserStats(): Promise<{ totalUsers: number; activeToday: number }> {
    return this.userService.getUserStats();
  }

  async getNonceStats(): Promise<{ activeNonces: number; usedNonces: number }> {
    return this.nonceService.getNonceStats();
  }
}
