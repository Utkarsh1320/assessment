import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiAiService {
    async streamPrompt(prompt: string, onChunk: (chunk: string, metrics?: { firstChunkLatency: number, totalTime: number, cost: number }) => void) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error('GEMINI_API_KEY is not set');

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const startTime = Date.now();
        let firstChunkTime: number | null = null;
        let totalTokens = 0;

        try {
            const result = await model.generateContentStream(prompt);
            for await (const chunk of result.stream) {
                if (!firstChunkTime) {
                    firstChunkTime = Date.now();
                }
                const token = chunk.text();
                totalTokens++;
                onChunk(token);
            }
            const endTime = Date.now();
            const totalTime = endTime - startTime;
            const firstChunkLatency = firstChunkTime ? firstChunkTime - startTime : 0;
            const cost = (totalTokens / 1000) * 0.00025; // Example cost for gemini-pro
            onChunk('[END]', { firstChunkLatency, totalTime, cost });
        } catch (error) {
            console.error(error);
            const endTime = Date.now();
            const totalTime = endTime - startTime;
            const firstChunkLatency = firstChunkTime ? firstChunkTime - startTime : 0;
            const cost = (totalTokens / 1000) * 0.00025; // Example cost for gemini-pro
            onChunk('[END]', { firstChunkLatency, totalTime, cost });
        }
    }
}
