import { Module } from '@nestjs/common';
import { OpenaiService } from './openai/openai.service';

@Module({
  providers: [OpenaiService]
})
export class AiProvidersModule {}
