import { WebSocketGateway, WebSocketServer, type OnGatewayConnection, type OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, type Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', 
  },
})
export class WSGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
      console.log('Client connected', client.id);
  }

  handleDisconnect(client: Socket) {
      console.log('Client disconnected', client.id);
  }
  sendNotification(message: string) {
    this.server.emit('notification', message);
  }

}

