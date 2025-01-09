import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // Для работы с базой данных
import { User } from 'src/entities/user.entity'; // Импортируем сущность пользователя
import { Transaction } from 'src/entities/transaction.entity'; // Импортируем сущность транзакции
import { Task } from 'src/entities/task.entity'; // Импортируем сущность задачи
import { UserService } from 'src/services/common/user.service';
import { Review } from 'src/entities/reviews.entity';
import { Payment } from 'src/entities/payment.entity';
import { PaymentService } from 'src/services/common/payment.service';
import { ReviewService } from 'src/services/common/review.service';
import { SupprotService } from 'src/services/common/support.service';
import { Support } from 'src/entities/support.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Transaction, Task, Review, Payment, Support]), // Подключаем сущности для работы с репозиториями
  ],
  providers: [UserService, PaymentService, ReviewService, SupprotService],
  exports: [UserService, PaymentService, ReviewService, SupprotService], // Экспортируем сервис для использования в других модулях
})
export class CommonModule {}
