import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
  Res,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { PropertyService } from '../services/property.service';
import {
  CreatePropertyDto,
  UpdatePropertyDto,
  PropertyResponseDto,
} from '../dto/property.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { JwtPayload } from '../../auth/interfaces/user.interface';

@Controller('properties')
@UseGuards(JwtAuthGuard)
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Post()
  async create(
    @Body() createPropertyDto: CreatePropertyDto,
    @GetUser() user: JwtPayload,
  ): Promise<PropertyResponseDto> {
    return this.propertyService.create(createPropertyDto, user.address);
  }

  @Post(':id/image')
  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
      },
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return callback(
            new BadRequestException('Only image files are allowed!'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadImage(
    @Param('id') id: string,
    @GetUser() user: JwtPayload,
    @UploadedFile() imageFile: Express.Multer.File,
  ): Promise<PropertyResponseDto> {
    return this.propertyService.uploadImage(id, user.address, imageFile);
  }

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('issuer') issuer?: string,
  ): Promise<{
    properties: PropertyResponseDto[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    return this.propertyService.findAll(pageNum, limitNum, issuer);
  }

  @Get('my-properties')
  async findMyProperties(
    @GetUser() user: JwtPayload,
  ): Promise<PropertyResponseDto[]> {
    return this.propertyService.findByIssuer(user.address);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PropertyResponseDto> {
    return this.propertyService.findOne(id);
  }

  @Get(':id/image')
  async getPropertyImage(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    const imageData = await this.propertyService.getPropertyImage(id);

    if (!imageData) {
      res.status(HttpStatus.NOT_FOUND).json({ message: 'Image not found' });
      return;
    }

    res.set({
      'Content-Type': imageData.mimeType,
      'Content-Length': imageData.image.length.toString(),
      'Cache-Control': 'public, max-age=31536000', // 1 year cache
    });

    res.send(imageData.image);
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
      },
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return callback(
            new BadRequestException('Only image files are allowed!'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
    @GetUser() user: JwtPayload,
    @UploadedFile() imageFile?: Express.Multer.File,
  ): Promise<PropertyResponseDto> {
    return this.propertyService.update(
      id,
      updatePropertyDto,
      user.address,
      imageFile,
    );
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @GetUser() user: JwtPayload,
  ): Promise<{ message: string }> {
    await this.propertyService.remove(id, user.address);
    return { message: 'Property deleted successfully' };
  }
}
