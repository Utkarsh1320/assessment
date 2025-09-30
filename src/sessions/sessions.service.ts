import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session } from './session.schema';

@Injectable()
export class SessionsService {
  constructor(@InjectModel(Session.name) private sessionModel: Model<Session>) {}

  async create(prompt: string, responses: string) {
    return this.sessionModel.create({ prompt, responses });
  }

  async findAll() {
    return this.sessionModel.find().exec();
  }

  async findById(sessionId: string) {
    return this.sessionModel.findById(sessionId);
  }
}
