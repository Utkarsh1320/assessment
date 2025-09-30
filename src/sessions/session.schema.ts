import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Session extends Document {
  @Prop()
  prompt: string;

  @Prop({ type: Object })
  responses: {
    [key: string]: {
      model: string;
      response: string;
      performance?: {
        firstChunkLatency?: number;
        totalTime?: number;
      };
      cost?: number;
    };
  };
}

export const SessionSchema = SchemaFactory.createForClass(Session);
