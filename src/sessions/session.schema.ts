import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
@Schema()
export class Session extends Document{
    @Prop({ required: true })
    prompt: string;

    @Prop({ type: Object })
    response: Record<string, any>;

    @Prop({ default: Date.now })
    createdAt: Date;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
