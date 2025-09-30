import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SessionSchema } from './session.schema';
import { OpenaiService } from '../ai-providers/openai/openai.service';
import { GeminiAiService } from '../ai-providers/gemini-ai/gemini-ai.service';
import { ResponseGateway } from '../response/response.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'Session', schema: SessionSchema}]),
  ],
  providers: [SessionsService, OpenaiService, GeminiAiService, ResponseGateway],
  controllers: [SessionsController],
  exports:[SessionsService]
})
export class SessionsModule {}
