import { Test, TestingModule } from '@nestjs/testing';
import { ResponseGateway } from './response.gateway';

describe('ResponseGateway', () => {
  let gateway: ResponseGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResponseGateway],
    }).compile();

    gateway = module.get<ResponseGateway>(ResponseGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
