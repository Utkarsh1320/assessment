import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session } from './session.schema';
import { OpenaiService } from '../ai-providers/openai/openai.service';
import { GeminiAiService } from '../ai-providers/gemini-ai/gemini-ai.service';
import { ResponseGateway } from '../response/response.gateway';

@Injectable()
export class SessionsService {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<Session>,
    private readonly openaiService: OpenaiService,
    private readonly geminiAiService: GeminiAiService,
    private readonly responseGateway: ResponseGateway,
  ) {}

  async create(prompt: string) {
    const session = await this.sessionModel.create({ prompt, responses: {} });
    const sessionId = session.id;

    const openaiResponse: string[] = [];
    this.openaiService.streamPrompt(prompt, (chunk, metrics) => {
      if (chunk === '[END]') {
        if (metrics) {
            this.sessionModel.findByIdAndUpdate(sessionId, { $set: { 'responses.openai.response': openaiResponse.join(''), 'responses.openai.performance': metrics, 'responses.openai.cost': metrics.cost } }).exec();
        }
      } else {
        openaiResponse.push(chunk);
        this.responseGateway.sendChunk(sessionId, 'openai', chunk);
      }
    });

    const geminiResponse: string[] = [];
    this.geminiAiService.streamPrompt(prompt, (chunk, metrics) => {
        if (chunk === '[END]') {
            if (metrics) {
                this.sessionModel.findByIdAndUpdate(sessionId, { $set: { 'responses.gemini.response': geminiResponse.join(''), 'responses.gemini.performance': metrics, 'responses.gemini.cost': metrics.cost } }).exec();
            }
        } else {
            geminiResponse.push(chunk);
            this.responseGateway.sendChunk(sessionId, 'gemini', chunk);
        }
    });

    return session;
  }

  async findAll() {
    return this.sessionModel.find().exec();
  }

  async findById(sessionId: string) {
    return this.sessionModel.findById(sessionId);
  }
}
