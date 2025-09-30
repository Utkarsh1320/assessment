import { Test, TestingModule } from '@nestjs/testing';
import { GeminiService } from './gemini.service';
import { GoogleGenerativeAI } from '@google/generative-ai';

jest.mock('@google/generative-ai');

describe('GeminiService', () => {
  let service: GeminiService;

  beforeEach(async () => {
    process.env.GEMINI_API_KEY = 'test-api-key';

    const module: TestingModule = await Test.createTestingModule({
      providers: [GeminiService],
    }).compile();

    service = module.get<GeminiService>(GeminiService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('streamPrompt', () => {
    it('should call onChunk with text from the stream and [END] at the end', async () => {
      const mockStream = {
        async *[Symbol.asyncIterator]() {
          yield { text: () => 'first chunk' };
          yield { text: () => 'second chunk' };
        },
      };
      const mockGenerateContentStream = jest.fn().mockResolvedValue({ stream: mockStream });
      const mockGetGenerativeModel = jest.fn().mockReturnValue({
        generateContentStream: mockGenerateContentStream,
      });

      (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
        getGenerativeModel: mockGetGenerativeModel,
      }));

      const onChunk = jest.fn();
      await service.streamPrompt('test prompt', onChunk);

      expect(onChunk).toHaveBeenCalledWith('first chunk');
      expect(onChunk).toHaveBeenCalledWith('second chunk');
      expect(onChunk).toHaveBeenCalledWith('[END]');
      expect(onChunk).toHaveBeenCalledTimes(3);
    });

    it('should throw an error if GEMINI_API_KEY is not set', async () => {
        delete process.env.GEMINI_API_KEY;
        const onChunk = jest.fn();
        await expect(service.streamPrompt('test prompt', onChunk)).rejects.toThrow('GEMINI_API_KEY is not set');
    });

    it('should call onChunk with [END] on error', async () => {
        const errorMessage = 'error message';
        const mockGenerateContentStream = jest.fn().mockRejectedValue(new Error(errorMessage));
        const mockGetGenerativeModel = jest.fn().mockReturnValue({
          generateContentStream: mockGenerateContentStream,
        });
  
        (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
          getGenerativeModel: mockGetGenerativeModel,
        }));
  
        const onChunk = jest.fn();
        await service.streamPrompt('test prompt', onChunk);
  
        expect(onChunk).toHaveBeenCalledWith('[END]');
        expect(onChunk).toHaveBeenCalledTimes(2);
      });
  });
});
