import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CONTRACTS } from '../../config/contracts';
import { Property, PropertyDocument } from '../schemas/property.schema';
import {
  CreatePropertyDto,
  PropertyResponseDto,
  TokenizePropertyDto,
} from '../dto/property.dto';

@Injectable()
export class PropertyService {
  constructor(
    @InjectModel(Property.name) private propertyModel: Model<PropertyDocument>,
  ) {}

  async create(
    createPropertyDto: CreatePropertyDto,
    issuer: string,
  ): Promise<PropertyResponseDto> {
    const propertyData: any = {
      ...createPropertyDto,
      issuer,
    };

    const property = new this.propertyModel(propertyData);
    const savedProperty = await property.save();

    return this.toResponseDto(savedProperty);
  }

  async uploadImage(
    propertyId: string,
    issuer: string,
    imageFile: Express.Multer.File,
  ): Promise<PropertyResponseDto> {
    const property = await this.propertyModel.findById(propertyId);

    if (!property) {
      throw new NotFoundException(`Property with ID ${propertyId} not found`);
    }

    if (property.issuer !== issuer) {
      throw new ForbiddenException(
        'You can only upload images to your own properties',
      );
    }

    property.image = {
      filename: `${Date.now()}-${imageFile.originalname}`,
      originalName: imageFile.originalname,
      mimeType: imageFile.mimetype,
      size: imageFile.size,
      data: imageFile.buffer,
    };

    const savedProperty = await property.save();
    return this.toResponseDto(savedProperty);
  }

  async findOne(id: string): Promise<PropertyResponseDto> {
    const property = await this.propertyModel.findById(id).exec();
    if (!property) {
      throw new NotFoundException('Property not found');
    }
    return this.toResponseDto(property);
  }

  async findByIssuer(issuer: string): Promise<PropertyResponseDto[]> {
    const properties = await this.propertyModel
      .find({ issuer })
      .sort({ createdAt: -1 })
      .exec();

    return properties.map((property) => this.toResponseDto(property));
  }

  async remove(id: string, issuer: string): Promise<void> {
    const property = await this.propertyModel.findById(id).exec();

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (property.issuer !== issuer) {
      throw new ForbiddenException('You can only delete your own properties');
    }

    await this.propertyModel.findByIdAndDelete(id).exec();
  }

  async tokenizeProperty(
    propertyId: string,
    tokenizeDto: TokenizePropertyDto,
    issuer: string,
  ): Promise<PropertyResponseDto> {
    const property = await this.propertyModel.findById(propertyId);

    if (!property) {
      throw new NotFoundException(`Property with ID ${propertyId} not found`);
    }

    if (property.issuer !== issuer) {
      throw new ForbiddenException('You can only tokenize your own properties');
    }

    if (property.tokenization) {
      throw new ForbiddenException('Property is already tokenized');
    }

    // Add tokenization data using shared contract configuration
    property.tokenization = {
      tokenId: tokenizeDto.tokenId,
      tokenAmount: tokenizeDto.tokenAmount,
      contractAddress: CONTRACTS.PROPERTY_TOKENIZATION,
      transactionHash: tokenizeDto.transactionHash,
      tokenizedAt: new Date(),
    };

    const savedProperty = await property.save();
    return this.toResponseDto(savedProperty);
  }

  async getPropertyImage(
    id: string,
  ): Promise<{ image: Buffer; mimeType: string } | null> {
    const property = await this.propertyModel.findById(id).exec();

    if (!property || !property.image) {
      return null;
    }

    return {
      image: property.image.data,
      mimeType: property.image.mimeType,
    };
  }

  private toResponseDto(property: PropertyDocument): PropertyResponseDto {
    return {
      id: property._id?.toString() || property.id,
      issuer: property.issuer,
      title: property.title,
      address: property.address,
      area: property.area,
      status: property.status,
      hasImage: !!property.image,
      tokenization: property.tokenization,
      createdAt: property.createdAt!,
      updatedAt: property.updatedAt!,
    };
  }
}
