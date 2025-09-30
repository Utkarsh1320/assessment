import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SessionSchema } from './session.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'Session', schema: SessionSchema}]),
  ],
  providers: [SessionsService],
  controllers: [SessionsController],
  exports:[SessionsService]
})
export class SessionsModule {}
