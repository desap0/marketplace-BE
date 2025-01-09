import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from 'src/entities/enums/roles.enum';
import { Status } from 'src/entities/enums/Status.enum';
import { TransactionType } from 'src/entities/enums/transactionType.enum';
import { Task } from 'src/entities/task.entity';
import { Transaction } from 'src/entities/transaction.entity';
import { User } from 'src/entities/user.entity';
import { getUserBalance } from 'src/helpers/getUserBalance.helper';
import { Repository } from 'typeorm';

@Injectable()
export class ClientTaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async createTask(
    clientId: string,
    name: string,
    description: string,
    price: number,
  ) {
    const client = await this.userRepository.findOne({
      where: {
        telegramId: clientId,
      },
    });

    if (!client || client?.role === UserRole.BANNED) {
      return 'Пользователь с таким telegramId не найден';
    }

    const balance = await getUserBalance(this.transactionRepository, client);

    if (balance < price) {
      return 'У вас недостаточно денег для создания задачи. Пополните счет.';
    }

    const task = this.taskRepository.create({
      name,
      description,
      price,
      client,
      status: Status.NOT_STARTED,
    });

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
        client: user,
      },
      relations: ['performer', 'client'],
    });

    if (task.status === Status.CANCELED || Status.DONE) {
      return 'Из статусов Canceled и Done нельзя перевести в другие статусы';
    }

    if (status !== Status.CANCELED) {
      return 'Вы можете только отменять задачи на которые еще не нашелся исполнитель';
    }

    if (!task.performer) {
      task.status = Status.CANCELED;
    } else {
      return 'Вы не можете отменить задачу на которую уже есть исполнитель';
    }

    if (!task || !user || user?.role === UserRole.BANNED) {
      return 'Задача или пользователь не найдены';
    }

    await this.taskRepository.save(task);

    await this.userRepository.save(task.performer);
    await this.userRepository.save(task.client);

    return task;
  }

  async getAllTasks(
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

    if (!user || user?.role === UserRole.BANNED) {
      return 'Пользователь с таким telegramId не найден';
    }

    const [tasks, total] = await this.taskRepository.findAndCount({
      where: {
        client: user,
        ...filters,
      },
      skip: skip,
      take: limit,
      select: {
        id: true,
        name: true,
        status: true,
        price: true,
      },
    });

    return { tasks, total };
  }

  async getTaskById(telegramId: string, taskId: string) {
    const user = await this.userRepository.findOne({
      where: {
        telegramId,
      },
    });

    if (!user || user?.role === UserRole.BANNED) {
      return 'Пользователь с таким telegramId не найден';
    }

    const task = await this.taskRepository.findOne({
      where: {
        client: user,
        id: taskId,
      },
    });

    return task;
  }

  async approveTask(telegramId: string, taskId: string) {
    const user = await this.userRepository.findOne({
      where: {
        telegramId,
      },
    });

    if (!user || user?.role === UserRole.BANNED) {
      return 'Пользователь с таким telegramId не найден';
    }

    const task = await this.taskRepository.findOne({
      where: {
        client: user,
        id: taskId,
      },
    });

    if (task.status !== Status.DONE) {
      return 'Вы не можете подтвердить задачу которая не была выполнена';
    }

    if (task.isClientApproved) {
      return 'Выполнение этой задачи уже было подтверждено';
    }

    task.isClientApproved = true;

    const transaction = this.transactionRepository.create({
      amount: task.price,
      type: TransactionType.ADD,
      user: task.performer,
      task,
    });

    await this.taskRepository.save(task);
    await this.transactionRepository.save(transaction);
  }
}
