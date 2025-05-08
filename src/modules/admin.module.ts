import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // Для работы с базой данных
import { User } from 'src/entities/user.entity'; // Импортируем сущность пользователя
import { Transaction } from 'src/entities/transaction.entity'; // Импортируем сущность транзакции
import { Task } from 'src/entities/task.entity'; // Импортируем сущность задачи
import { AdminUserService } from 'src/services/admin/user.service';
import { Review } from 'src/entities/reviews.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Transaction, Task, Review]), // Подключаем сущности для работы с репозиториями
  ],
  providers: [AdminUserService],
  exports: [AdminUserService], // Экспортируем сервис для использования в других модулях
})
export class AdminModule {}
