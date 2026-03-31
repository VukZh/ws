import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { PrismaService } from "./prisma/prisma.service";


@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private roomUsers: Map<string, Set<string>> = new Map();

  constructor(private prisma: PrismaService) {
  }

  handleConnection(client: Socket): any {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: any): any {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('room:join')
  async onRoomJoin(
    @MessageBody() data: {room: string, username: string},
    @ConnectedSocket() client: Socket
  ) {

    const {room, username} = data;
    client.join(room);

    if (!this.roomUsers.has(room)){
        this.roomUsers.set(room, new Set());
    }
    this.roomUsers.get(room)!.add(username);

    const history = await this.prisma.event.findMany({
      where: {
        room: room,
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 20
    });

    client.emit('event:list', history);

    this.server.to(room).emit('user:list', Array.from(this.roomUsers.get(room) || []));

    console.log(`Client joined room: ${room}`);

  }

  @SubscribeMessage('event:new')
  async onEventNew(
    @MessageBody() data: {
      room: string,
      author: string,
      message: string
    }
  ) {
    const event = await this.prisma.event.create({
      data: {
        room: data.room,
        author: data.author,
        message: data.message
      }
    });
    this.server.to(data.room).emit('event:new', event);
  }

  @SubscribeMessage('room:leave')
  async onLeaveRoom (
    @MessageBody() data: {room: string, username: string},
    @ConnectedSocket() client: Socket
  ) {
    client.leave(data.room);
    if (this.roomUsers.get(data.room)) {
      this.roomUsers.get(data.room)?.delete(data.username);
      this.server.to(data.room).emit('user:list', Array.from(this.roomUsers.get(data.room) || []));
    }
  }


}

