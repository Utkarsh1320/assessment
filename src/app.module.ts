import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SessionsModule } from './sessions/sessions.module';
import { MongooseModule } from '@nestjs/mongoose';
import { OpenaiService } from './ai-providers/openai/openai.service';
import { GeminiAiService } from './ai-providers/gemini-ai/gemini-ai.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URL || 'mongodb://localhost/nest'),
    SessionsModule,
  ],
  controllers: [AppController],
  providers: [AppService, OpenaiService, GeminiAiService],
})
export class AppModule {}
