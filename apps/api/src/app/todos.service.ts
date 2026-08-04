import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type {
  CreateTodoDto,
  Todo,
  TodoListResponse,
  UpdateTodoDto,
} from '@nestjs-template/types';
import { TodoEntity } from './todo.entity';

@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(TodoEntity)
    private readonly todoRepository: Repository<TodoEntity>,
  ) {}

  async findAll(): Promise<TodoListResponse> {
    const [todos, total] = await this.todoRepository.findAndCount({
      order: { id: 'ASC' },
    });
    
    return { 
      data: todos.map(t => this.toTodoDto(t)), 
      total 
    };
  }

  async findOne(id: number): Promise<Todo> {
    const todo = await this.todoRepository.findOne({ where: { id } });
    if (!todo) throw new NotFoundException(`Todo #${id} not found`);
    return this.toTodoDto(todo);
  }

  async create(dto: CreateTodoDto): Promise<Todo> {
    const todo = this.todoRepository.create({
      title: dto.title,
      completed: false,
    });
    const saved = await this.todoRepository.save(todo);
    return this.toTodoDto(saved);
  }

  async update(id: number, dto: UpdateTodoDto): Promise<Todo> {
    const todo = await this.todoRepository.findOne({ where: { id } });
    if (!todo) throw new NotFoundException(`Todo #${id} not found`);
    
    if (dto.title !== undefined) todo.title = dto.title;
    if (dto.completed !== undefined) todo.completed = dto.completed;
    
    const saved = await this.todoRepository.save(todo);
    return this.toTodoDto(saved);
  }

  async remove(id: number): Promise<void> {
    const result = await this.todoRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Todo #${id} not found`);
  }

  private toTodoDto(entity: TodoEntity): Todo {
    return {
      id: entity.id,
      title: entity.title,
      completed: entity.completed,
      createdAt: entity.createdAt.toISOString(),
    };
  }
}
