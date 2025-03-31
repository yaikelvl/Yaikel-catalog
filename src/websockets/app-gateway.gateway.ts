import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Logger } from 'winston';
import { Inject } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    @Inject('winston') 
    private readonly logger: Logger) {}

  handleConnection(client: Socket) {
    this.logger.info(`Client conected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.info(`Client disconected: ${client.id}`);
  }

  sendMessage(user: string, operation: string) {
    const message = `The user ${user} performed the operation ${operation}`;
    this.logger.info(message); 
    this.server.emit('notification', message);
  }
}
