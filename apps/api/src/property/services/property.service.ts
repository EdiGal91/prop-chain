import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Property, PropertyDocument } from '../schemas/property.schema';
import {
  CreatePropertyDto,
  UpdatePropertyDto,
  PropertyResponseDto,
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

    // Update property with image
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

  async findAll(
    page = 1,
    limit = 10,
    issuer?: string,
  ): Promise<{
    properties: PropertyResponseDto[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const filter = issuer ? { issuer } : {};
    const skip = (page - 1) * limit;

    const [properties, total] = await Promise.all([
      this.propertyModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.propertyModel.countDocuments(filter).exec(),
    ]);

    return {
      properties: properties.map((property) => this.toResponseDto(property)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
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

  async update(
    id: string,
    updatePropertyDto: UpdatePropertyDto,
    issuer: string,
    imageFile?: Express.Multer.File,
  ): Promise<PropertyResponseDto> {
    const property = await this.propertyModel.findById(id).exec();

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (property.issuer !== issuer) {
      throw new ForbiddenException('You can only update your own properties');
    }

    const updateData: any = { ...updatePropertyDto };

    // Handle image update if provided
    if (imageFile) {
      if (imageFile.size > 2 * 1024 * 1024) {
        throw new Error('Image size must be less than 2MB');
      }

      updateData.image = {
        filename: `${Date.now()}-${imageFile.originalname}`,
        originalName: imageFile.originalname,
        mimeType: imageFile.mimetype,
        size: imageFile.size,
        data: imageFile.buffer,
      };
    }

    const updatedProperty = await this.propertyModel
      .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .exec();

    return this.toResponseDto(updatedProperty!);
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
      createdAt: property.createdAt!,
      updatedAt: property.updatedAt!,
    };
  }
}
