import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class ResponseGateway {
  @WebSocketServer()
  server: Server;

  sendChunk(sessionId: string, model: string, chunk: string) {
    this.server.to(sessionId).emit('chunk', { model, chunk });
  }
}
