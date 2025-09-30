import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ResponseGateway } from './response/response.gateway';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AiProvidersModule } from './ai-providers/ai-providers.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal:true,
  }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService], 
    }),
    AiProvidersModule,],
  controllers: [AppController],
  providers: [AppService, ResponseGateway],
})
export class AppModule {}
