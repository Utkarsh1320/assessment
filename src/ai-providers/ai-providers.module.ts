import { Module } from '@nestjs/common';
import { OpenaiService } from './openai/openai.service';
import { GeminiAiService } from './gemini-ai/gemini-ai.service';

@Module({
  providers: [OpenaiService, GeminiAiService]
})
export class AiProvidersModule {}
