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
    this.logger.info(`Cliente conectado: ${client.id}`);
    console.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.info(`Cliente desconectado: ${client.id}`);
    console.log(`Cliente desconectado: ${client.id}`);
  }

  sendMessage(user: string, operation: string) {
    const message = `El usuario ${user} realizó la operación ${operation}`;
    this.logger.info(message); 
    this.server.emit('notification', message);
    console.log(message);
  }
}
