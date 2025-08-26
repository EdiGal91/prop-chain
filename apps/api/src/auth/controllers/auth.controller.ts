import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Res,
  Req,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { SiweService } from '../services/siwe.service';
import { SiweVerifyDto, AuthResponseDto } from '../dto/siwe.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { GetUser } from '../decorators/get-user.decorator';
import { JwtPayload } from '../interfaces/user.interface';

@Controller('auth')
export class AuthController {
  constructor(private siweService: SiweService) {}

  @Post('nonce')
  async generateNonce(): Promise<{ nonce: string }> {
    const nonce = await this.siweService.generateNonce();
    return { nonce };
  }

  @Post('verify')
  async verifySignature(
    @Body() verifyDto: SiweVerifyDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    try {
      const { token, user } = await this.siweService.verifySignature(
        verifyDto.message,
        verifyDto.signature,
      );

      // Set HTTP-only cookie for security
      response.cookie('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        partitioned: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      return {
        success: true,
        token,
        user: {
          address: user.address,
        },
      };
    } catch (error) {
      response.status(HttpStatus.UNAUTHORIZED);
      return {
        success: false,
        error: error.message || 'Authentication failed',
      };
    }
  }

  @Get('session')
  async validateSession(
    @Req() request: any,
  ): Promise<{ authenticated: boolean; user?: any }> {
    try {
      const token =
        this.extractTokenFromHeader(request) ||
        this.extractTokenFromCookies(request);

      if (!token) {
        return { authenticated: false };
      }

      const payload = this.siweService.validateToken(token);
      const userData = await this.siweService.getUser(payload.address);

      return {
        authenticated: true,
        user: {
          address: userData?.address || payload.address,
          createdAt: userData?.createdAt,
          lastLogin: userData?.lastLogin,
        },
      };
    } catch (error) {
      return { authenticated: false };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@GetUser() user: JwtPayload): Promise<{ user: any }> {
    const userData = await this.siweService.getUser(user.address);
    return {
      user: {
        address: userData?.address || user.address,
        createdAt: userData?.createdAt,
        lastLogin: userData?.lastLogin,
      },
    };
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private extractTokenFromCookies(request: any): string | undefined {
    return request.cookies?.['auth-token'];
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response): { success: boolean } {
    response.clearCookie('auth-token');
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  async getStats(): Promise<{ users: any; nonces: any }> {
    const [userStats, nonceStats] = await Promise.all([
      this.siweService.getUserStats(),
      this.siweService.getNonceStats(),
    ]);

    return {
      users: userStats,
      nonces: nonceStats,
    };
  }
}
