import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health.controller';
import { TodosController } from './todos.controller';
import { TodosService } from './todos.service';
import { GameGateway } from './game.gateway';
import { TodoEntity } from './todo.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/api/.env', // Specify path for Nx workspace
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST') || 'localhost',
        port: parseInt(configService.get<string>('DB_PORT') || '5432', 10),
        username: configService.get<string>('DB_USER') || 'admin',
        password: configService.get<string>('DB_PASSWORD') || 'password',
        database: configService.get<string>('DB_NAME') || 'caxetadb',
        entities: [TodoEntity],
        synchronize: true, // Auto create tables on start (dev only)
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([TodoEntity]),
  ],
  controllers: [AppController, HealthController, TodosController],
  providers: [AppService, TodosService, GameGateway],
})
export class AppModule {}
