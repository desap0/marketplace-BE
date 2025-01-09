import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { Transaction } from 'src/entities/transaction.entity';
import { Payment } from 'src/entities/payment.entity';
import { PaymentType } from 'src/entities/enums/paymentType.enum';
import { TransactionType } from 'src/entities/enums/transactionType.enum';
import { getUserBalance } from 'src/helpers/getUserBalance.helper';
import { UserRole } from 'src/entities/enums/roles.enum';
import { Task } from 'src/entities/task.entity';
import { Status } from 'src/entities/enums/Status.enum';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,

    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,

    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async upBalance(
    telegramId: string,
    amount: number,
    requisites: string,
  ): Promise<Payment | string> {
    const user = await this.userRepository.findOne({ where: { telegramId } });

    if (!user || user?.role === UserRole.BANNED) {
      return 'Пользователь с таким telegramId не найден.';
    }

    const payment = this.paymentRepository.create({
      type: PaymentType.IN,
      amount,
      requisites,
      user,
    });

    const dbPayment = await this.paymentRepository.save(payment);
    const transaction = this.transactionRepository.create({
      type: TransactionType.ADD,
      payment: dbPayment,
      user,
      amount,
    });

    await this.transactionRepository.save(transaction);

    return dbPayment;
  }

  async withdrawBalance(
    telegramId: string,
    amount: any,
    requisites: string,
  ): Promise<Payment | string> {
    const user = await this.userRepository.findOne({ where: { telegramId } });

    if (!user || user?.role === UserRole.BANNED) {
      return 'Пользователь с таким telegramId не найден.';
    }

    const balance = await getUserBalance(this.transactionRepository, user);

    if (!(balance > amount)) {
      return 'У вас не хватает средств для вывода';
    }

    if (user.role === UserRole.CLIENT) {
      let tasksAmount = 0;
      const tasks = await this.taskRepository.find({
        where: {
          client: user,
          status: Status.NOT_STARTED,
        },
      });

      for (const task of tasks) {
        tasksAmount += task.price;
      }

      if (balance - tasksAmount < amount) {
        return 'У вас не хватает средств для вывода';
      }
    }

    const payment = this.paymentRepository.create({
      type: PaymentType.OUT,
      amount,
      requisites,
      user,
    });

    const dbPayment = await this.paymentRepository.save(payment);

    const transaction = this.transactionRepository.create({
      type: TransactionType.SUB,
      payment: dbPayment,
      user,
      amount,
    });

    await this.transactionRepository.save(transaction);

    return dbPayment;
  }
}
