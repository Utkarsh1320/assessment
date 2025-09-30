import { Injectable } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios'
import { IncomingMessage } from 'http';

@Injectable()
export class OpenaiService {
    async streamPrompt(prompt: string, onChunk: (chunk: string) => void) {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) throw new Error('OPENAI_API_KEY is not set');
        const res: AxiosResponse<IncomingMessage> = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-5',
                message: [{ role: 'user', content: prompt }],
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
            const str = Buffer.isBuffer(chunk) ? chunk.toString('utf-8') : String(chunk);
            str.split('\n').forEach(lineRaw => {
                const line = lineRaw.trim();
                if (!line) return;
                if (!line.startsWith('data:')) return;

                const payload = line.replace(/^data:\s*/, '');
                if (payload === '[DONE]') {
                    onChunk('[END]');
                    return;
                }
                try {
                    const json = JSON.parse(payload) as any;
                    const token: string = json?.choices?.[0]?.delta?.content;
                    if (token) {
                        onChunk(token);
                    }
                } catch (e) {
                    console.error(e);
                }
                
            });
        });
        res.data.on('end', () => {
            onChunk('[END]');
        });
        stream.on('error', (err: Error) => {
            onChunk('[END]');
        });
    }
}
