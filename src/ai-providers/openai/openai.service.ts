import { Injectable } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios'
import { IncomingMessage } from 'http';

@Injectable()
export class OpenaiService {
    async streamPrompt(prompt: string, onChunk: (chunk: string, metrics?: { firstChunkLatency: number, totalTime: number, cost: number }) => void) {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) throw new Error('OPENAI_API_KEY is not set');
        const startTime = Date.now();
        let firstChunkTime: number | null = null;
        let totalTokens = 0;

        const res: AxiosResponse<IncomingMessage> = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-5',
                messages: [{ role: 'user', content: prompt }],
                stream: true,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`,
                },
                responseType: 'stream',
            },
        );
        const stream = res.data;
        stream.on('data', (chunk: Buffer | string) => {
            if (!firstChunkTime) {
                firstChunkTime = Date.now();
            }
            const str = Buffer.isBuffer(chunk) ? chunk.toString('utf-8') : String(chunk);
            str.split('\n').forEach(lineRaw => {
                const line = lineRaw.trim();
                if (!line) return;
                if (!line.startsWith('data:')) return;

                const payload = line.replace(/^data:\s*/, '');
                if (payload === '[DONE]') {
                    const endTime = Date.now();
                    const totalTime = endTime - startTime;
                    const firstChunkLatency = firstChunkTime ? firstChunkTime - startTime : 0;
                    const cost = (totalTokens / 1000) * 0.002; // Example cost for gpt-3.5-turbo
                    onChunk('[END]', { firstChunkLatency, totalTime, cost });
                    return;
                }
                try {
                    const json = JSON.parse(payload) as any;
                    const token: string = json?.choices?.[0]?.delta?.content;
                    if (token) {
                        totalTokens++;
                        onChunk(token);
                    }
                } catch (e) {
                    console.error(e);
                }
                
            });
        });
        res.data.on('end', () => {
            const endTime = Date.now();
            const totalTime = endTime - startTime;
            const firstChunkLatency = firstChunkTime ? firstChunkTime - startTime : 0;
            const cost = (totalTokens / 1000) * 0.002; // Example cost for gpt-3.5-turbo
            onChunk('[END]', { firstChunkLatency, totalTime, cost });
        });
        stream.on('error', (err: Error) => {
             const endTime = Date.now();
            const totalTime = endTime - startTime;
            const firstChunkLatency = firstChunkTime ? firstChunkTime - startTime : 0;
            const cost = (totalTokens / 1000) * 0.002; // Example cost for gpt-3.5-turbo
            onChunk('[END]', { firstChunkLatency, totalTime, cost });
        });
    }
}
