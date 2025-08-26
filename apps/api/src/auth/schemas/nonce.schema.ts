import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NonceDocument = Nonce & Document;

@Schema({
  timestamps: true,
  collection: 'nonces',
})
export class Nonce {
  @Prop({
    required: true,
    unique: true,
    index: true,
  })
  nonce: string;

  @Prop({
    required: true,
    index: { expireAfterSeconds: 600 }, // Auto-expire after 10 minutes
  })
  createdAt: Date;

  @Prop({ default: false })
  used: boolean;
}

export const NonceSchema = SchemaFactory.createForClass(Nonce);
