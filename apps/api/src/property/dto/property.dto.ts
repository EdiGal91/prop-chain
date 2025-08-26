import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
  ValidateNested,
  Min,
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

export class UpdatePropertyDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @IsOptional()
  @IsNumber()
  @Min(0)
  area?: number;

  @IsOptional()
  @IsString()
  @IsEnum(['active', 'sold', 'pending', 'withdrawn'])
  status?: string;
}

export class PropertyResponseDto {
  id: string;
  issuer: string;
  title: string;
  address: AddressDto;
  area: number;
  status: string;
  hasImage: boolean;
  createdAt: Date;
  updatedAt: Date;
}
