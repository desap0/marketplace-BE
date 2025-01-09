import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from 'src/entities/enums/roles.enum';
import { Support } from 'src/entities/support.entity';
import { Task } from 'src/entities/task.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SupprotService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Support)
    private readonly supportRepository: Repository<Support>,
  ) {}

  async createSupport(telegramId: string, message: string, taskId: string) {
    const user = await this.userRepository.findOne({
      where: {
        telegramId,
      },
    });

    if (!user || user?.role === UserRole.BANNED) {
      return 'Пользователь с таким telegramId не найден';
    }
    let task = null;

    if (user.role === UserRole.CLIENT) {
      task = await this.taskRepository.findOne({
        where: {
          client: user,
          id: taskId,
        },
      });
    } else {
      task = await this.taskRepository.findOne({
        where: {
          performer: user,
          id: taskId,
        },
      });
    }

    if (!task) {
      return 'Такая задача не найдена.';
    }

    const support = this.supportRepository.create({
      user: user,
      task,
      message,
    });

    await this.supportRepository.save(support);

    return support;
  }

  async getAllSupports(
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

    const [supports, total] = await this.supportRepository.findAndCount({
      where: {
        user,
        skip: skip,
        take: limit,
        ...filters,
      },
      select: {
        id: true,
        isEnded: true,
        createdAt: true,
      },
    });

    return { supports, total };
  }

  async getSupportById(telegramId: string, supportId: string) {
    const user = await this.userRepository.findOne({
      where: {
        telegramId,
      },
    });

    if (!user || user?.role === UserRole.BANNED) {
      return 'Пользователь с таким telegramId не найден';
    }

    const support = await this.supportRepository.findOne({
      where: {
        user,
        id: supportId,
      },
    });

    return support;
  }
}
