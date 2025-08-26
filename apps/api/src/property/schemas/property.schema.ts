import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PropertyDocument = Property & Document;

@Schema({
  timestamps: true,
  collection: 'properties',
})
export class Property {
  @Prop({
    required: true,
    type: String,
    ref: 'User',
    index: true,
  })
  issuer: string; // User's wallet address

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({
    required: true,
    _id: false,
    type: {
      country: { type: String, required: true },
      city: { type: String, required: true },
    },
  })
  address: {
    country: string;
    city: string;
  };

  @Prop({ required: true, min: 0 })
  area: number; // in square meters

  @Prop({
    required: false,
    type: {
      filename: String,
      originalName: String,
      mimeType: String,
      size: Number,
      data: Buffer,
    },
  })
  image?: {
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    data: Buffer;
  };

  @Prop({
    required: true,
    enum: ['active', 'sold', 'pending', 'withdrawn'],
    default: 'active',
  })
  status: string;

  // Timestamps added automatically by timestamps: true
  createdAt?: Date;
  updatedAt?: Date;
}

export const PropertySchema = SchemaFactory.createForClass(Property);
