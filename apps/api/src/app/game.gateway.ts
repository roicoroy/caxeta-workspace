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
  async handleGetTodos(@ConnectedSocket() client: Socket) {
    try {
      const todos = await this.todosService.findAll();
      client.emit('todosUpdated', todos);
    } catch (e) {
      this.logger.error('Error in handleGetTodos', e);
    }
  }

  @SubscribeMessage('addTodo')
  async handleAddTodo(@MessageBody() data: { title: string }) {
    try {
      this.logger.log(`Adding todo: ${data?.title}`);
      await this.todosService.create({ title: data.title });
      const todos = await this.todosService.findAll();
      this.server.emit('todosUpdated', todos);
    } catch (e) {
      this.logger.error('Error in handleAddTodo', e);
    }
  }

  @SubscribeMessage('completeTodo')
  async handleCompleteTodo(@MessageBody() data: { id: number, completed: boolean }) {
    try {
      this.logger.log(`Updating todo ${data?.id}: completed=${data?.completed}`);
      await this.todosService.update(data.id, { completed: data.completed });
      const todos = await this.todosService.findAll();
      this.server.emit('todosUpdated', todos);
    } catch (e) {
      this.logger.error('Error in handleCompleteTodo', e);
    }
  }

  @SubscribeMessage('deleteTodo')
  async handleDeleteTodo(@MessageBody() data: { id: number }) {
    try {
      this.logger.log(`Deleting todo ${data?.id}`);
      await this.todosService.remove(data.id);
      const todos = await this.todosService.findAll();
      this.server.emit('todosUpdated', todos);
    } catch (e) {
      this.logger.error('Error in handleDeleteTodo', e);
    }
  }
}
