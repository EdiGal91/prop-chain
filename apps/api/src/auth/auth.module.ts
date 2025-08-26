import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './controllers/auth.controller';
import { SiweService } from './services/siwe.service';
import { NonceService } from './services/nonce.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserModule } from '../user';
import { Nonce, NonceSchema } from './schemas/nonce.schema';

@Module({
  imports: [
    UserModule,
    MongooseModule.forFeature([{ name: Nonce.name, schema: NonceSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_SECRET') ||
          'your-secret-key-change-in-production',
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [SiweService, NonceService, JwtAuthGuard],
  exports: [SiweService, NonceService, JwtAuthGuard],
})
export class AuthModule {}
