import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { getUserBalance } from 'src/helpers/getUserBalance.helper';
import { Transaction } from 'src/entities/transaction.entity';
import { UserRole } from 'src/entities/enums/roles.enum';
import { Task } from 'src/entities/task.entity';
import { Status } from 'src/entities/enums/Status.enum';
import { TransactionType } from 'src/entities/enums/transactionType.enum';

@Injectable()
export class ModeratorUserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,

    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async getAllUsers(
    telegramId: string,
    filters: any,
    limit: number,
    skip: number,
  ): Promise<any> {
    const user = await this.userRepository.findOne({
      where: {
        telegramId,
      },
    });

    if (user.role !== UserRole.MODERATOR) {
      return 'Вы не имеете доступа.';
    }

    const users = await this.userRepository.find({
      where: {
        role: Not(UserRole.ADMIN),
        skip: skip,
        take: limit,
        ...filters,
      },
      select: {
        id: true,
        name: true,
        role: true,
      },
    });

    const data = [];

    for (const user of users) {
      const balance = await getUserBalance(this.transactionRepository, user);

      data.push({ ...user, balance });
    }

    return data;
  }

  async banUser(myId: string, telegramId: string) {
    const me = await this.userRepository.findOne({
      where: {
        telegramId: myId,
      },
    });

    if (me.role !== UserRole.MODERATOR || !me) {
      return 'Вы не имеете доступа.';
    }

    const user = await this.userRepository.findOne({
      where: {
        telegramId,
        role: Not(UserRole.ADMIN),
      },
    });

    if (!user) {
      return 'Пользователя с таким id не существует';
    }

    if (user.role === UserRole.MODERATOR) {
      return 'Вы не можете забанить модератора';
    }

    if (user.role === UserRole.CLIENT) {
      const tasks = await this.taskRepository.find({
        where: {
          client: user,
          isClientApproved: false,
        },
        relations: ['performer'],
      });

      for (const task of tasks) {
        if (!task.performer) {
          task.status = Status.CANCELED;
        }

        if (task.performer) {
          const transaction = this.transactionRepository.create({
            amount: task.price,
            type: TransactionType.ADD,
            user: task.performer,
            task,
          });

          task.isClientApproved = true;
          await this.transactionRepository.save(transaction);
          await this.taskRepository.save(task);
        }
      }
    }

    if (user.role === UserRole.PERFORMER) {
      const tasks = await this.taskRepository.find({
        where: {
          performer: user,
          isClientApproved: false,
        },
        relations: ['client'],
      });

      for (const task of tasks) {
        task.status = Status.NOT_STARTED;
        task.performer = null;

        const transaction = this.transactionRepository.create({
          amount: task.price,
          type: TransactionType.ADD,
          user: task.client,
          task,
        });

        await this.transactionRepository.save(transaction);
        await this.taskRepository.save(task);
      }
    }

    user.role = UserRole.BANNED;

    await this.userRepository.save(user);

    return user;
  }
}
