import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // Для работы с базой данных
import { User } from 'src/entities/user.entity'; // Импортируем сущность пользователя
import { Transaction } from 'src/entities/transaction.entity'; // Импортируем сущность транзакции
import { Task } from 'src/entities/task.entity'; // Импортируем сущность задачи
import { FirstUserService } from 'src/services/user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Transaction, Task]), // Подключаем сущности для работы с репозиториями
  ],
  providers: [FirstUserService],
  exports: [FirstUserService], // Экспортируем сервис для использования в других модулях
})
export class FirstUserModule {}
