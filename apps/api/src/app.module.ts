import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user';
import { AuthModule } from './auth/auth.module';
import { PropertyModule } from './property';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGODB_URI,
        retryWrites: true,
        w: 'majority',
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      }),
    }),
    UserModule,
    AuthModule,
    PropertyModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
