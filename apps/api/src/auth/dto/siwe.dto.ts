import { IsString, IsNotEmpty } from 'class-validator';

export class SiweVerifyDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsNotEmpty()
  signature: string;
}

export class AuthResponseDto {
  success: boolean;
  token?: string;
  user?: {
    address: string;
  };
  error?: string;
}
