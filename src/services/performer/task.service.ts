import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Status } from 'src/entities/enums/Status.enum';
import { TransactionType } from 'src/entities/enums/transactionType.enum';
import { Task } from 'src/entities/task.entity';
import { Transaction } from 'src/entities/transaction.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PerformerTaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async assignTask(taskId: string, performerId: string) {
    const task = await this.taskRepository.findOne({
      where: {
        id: taskId,
      },
      relations: ['client', 'performer'],
    });
    const performer = await this.userRepository.findOne({
      where: {
        telegramId: performerId,
      },
    });

    if (!task || !performer) {
      return 'Task or Performer not found';
    }

    if (task.performer) {
      return 'На эту задачу уже есть исполнитель';
    }

    if (task.status === Status.CANCELED) {
      return 'Эта задача была отменена';
    }

    task.performer = performer;
    task.status = Status.PROGRESS;

    const transaction = this.transactionRepository.create({
      amount: task.price,
      type: TransactionType.SUB,
      user: task.client,
      task,
    });

    await this.transactionRepository.save(transaction);

    await this.taskRepository.save(task);
    return task;
  }

  async changeTaskStatus(taskId: string, myId: string, status: Status) {
    const user = await this.userRepository.findOne({
      where: {
        telegramId: myId,
      },
    });

    const task = await this.taskRepository.findOne({
      where: {
        id: taskId,
        performer: user,
      },
      relations: ['performer', 'client'],
    });

    if (!task || !user) {
      return 'Задача или пользователь не найдены';
    }

    if (task.status === Status.CANCELED || Status.DONE) {
      return 'Из статусов Canceled и Done нельзя перевести в другие статусы';
    }

    if (status === Status.CANCELED) {
      const transaction = this.transactionRepository.create({
        amount: task.price,
        type: TransactionType.ADD,
        user: task.client,
        task,
      });

      await this.transactionRepository.save(transaction);

      task.status = Status.CANCELED;
    }

    if (status === Status.PROBLEM) {
      task.status = Status.PROBLEM;
    }

    if (status === Status.DONE) {
      task.status = Status.DONE;
    }

    await this.taskRepository.save(task);

    await this.userRepository.save(task.performer);
    await this.userRepository.save(task.client);

    return task;
  }

  async getMyTasks(
    telegramId: string,
    filters: any,
    skip: number,
    limit: number,
  ) {
    const user = await this.userRepository.findOne({
      where: {
        telegramId,
      },
    });

    if (!user) {
      return 'Пользователь с таким telegramId не найден';
    }

    const [tasks, total] = await this.taskRepository.findAndCount({
      where: {
        performer: user,
        skip: skip,
        take: limit,
        ...filters,
      },
      select: {
        id: true,
        name: true,
        status: true,
        price: true,
      },
    });

    return { tasks, total };
  }

  async getAllTasks(filters: any, skip: number, limit: number) {
    const [tasks, total] = await this.taskRepository.findAndCount({
      where: {
        performer: null,
        skip: skip,
        take: limit,
        status: Status.NOT_STARTED,
        ...filters,
      },
      select: {
        id: true,
        name: true,
        price: true,
      },
    });

    return { tasks, total };
  }

  async getTaskById(taskId: string) {
    const task = await this.taskRepository.findOne({
      where: {
        id: taskId,
      },
    });

    return task;
  }
}
