import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { TodosService } from './todos.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(GameGateway.name);

  constructor(private readonly todosService: TodosService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('ping')
  handlePing(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    try {
      this.logger.log(`Received ping from ${client.id}`);
      client.emit('pong', 'pong');
    } catch (e) {
      this.logger.error('Error in handlePing', e);
    }
  }

  @SubscribeMessage('getTodos')
  handleGetTodos(@ConnectedSocket() client: Socket) {
    try {
      client.emit('todosUpdated', this.todosService.findAll());
    } catch (e) {
      this.logger.error('Error in handleGetTodos', e);
    }
  }

  @SubscribeMessage('addTodo')
  handleAddTodo(@MessageBody() data: { title: string }) {
    try {
      this.logger.log(`Adding todo: ${data?.title}`);
      this.todosService.create({ title: data.title });
      this.server.emit('todosUpdated', this.todosService.findAll());
    } catch (e) {
      this.logger.error('Error in handleAddTodo', e);
    }
  }

  @SubscribeMessage('completeTodo')
  handleCompleteTodo(@MessageBody() data: { id: number, completed: boolean }) {
    try {
      this.logger.log(`Updating todo ${data?.id}: completed=${data?.completed}`);
      this.todosService.update(data.id, { completed: data.completed });
      this.server.emit('todosUpdated', this.todosService.findAll());
    } catch (e) {
      this.logger.error('Error in handleCompleteTodo', e);
    }
  }

  @SubscribeMessage('deleteTodo')
  handleDeleteTodo(@MessageBody() data: { id: number }) {
    try {
      this.logger.log(`Deleting todo ${data?.id}`);
      this.todosService.remove(data.id);
      this.server.emit('todosUpdated', this.todosService.findAll());
    } catch (e) {
      this.logger.error('Error in handleDeleteTodo', e);
    }
  }
}
