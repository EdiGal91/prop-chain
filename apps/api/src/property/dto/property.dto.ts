import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
  ValidateNested,
  Min,
  IsEthereumAddress,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';

class AddressDto {
  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsNotEmpty()
  city: string;
}

export class CreatePropertyDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @IsNumber()
  @Min(0)
  area: number;
}

export class TokenizePropertyDto {
  @IsNumber()
  @IsPositive()
  tokenAmount: number;

  @IsString()
  @IsNotEmpty()
  transactionHash: string;

  @IsNumber()
  @IsPositive()
  tokenId: number;
}

class TokenizationDto {
  tokenId: number;
  tokenAmount: number;
  contractAddress: string;
  transactionHash: string;
  tokenizedAt: Date;
}

export class PropertyResponseDto {
  id: string;
  issuer: string;
  title: string;
  address: AddressDto;
  area: number;
  status: string;
  hasImage: boolean;
  tokenization?: TokenizationDto;
  createdAt: Date;
  updatedAt: Date;
}
