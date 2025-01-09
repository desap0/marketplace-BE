import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from 'src/entities/enums/roles.enum';
import { Support } from 'src/entities/support.entity';
import { Task } from 'src/entities/task.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AdminSupprotService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Support)
    private readonly supportRepository: Repository<Support>,
  ) {}

  async getSupports(
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

    if (user.role !== UserRole.ADMIN) {
      return 'Вы не имеете доступа.';
    }

    const [supports, total] = await this.supportRepository.findAndCount({
      where: {
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

  async getReportById(telegramId: string, reportId: string) {
    const user = await this.userRepository.findOne({
      where: {
        telegramId,
      },
    });

    if (!user || user?.role === UserRole.BANNED) {
      return 'Пользователь с таким telegramId не найден';
    }

    if (user.role !== UserRole.ADMIN) {
      return 'Вы не имеете доступа.';
    }

    const support = await this.supportRepository.findOne({
      where: {
        id: reportId,
      },
    });

    return support;
  }

  async answerSupport(telegramId: string, supportId: string, answer: string) {
    const user = await this.userRepository.findOne({
      where: {
        telegramId,
      },
    });

    if (!user || user?.role === UserRole.BANNED) {
      return 'Пользователь с таким telegramId не найден';
    }

    if (user.role !== UserRole.ADMIN) {
      return 'Вы не имеете доступа.';
    }

    const support = await this.supportRepository.findOne({
      where: {
        id: supportId,
      },
    });

    support.answer = answer;
    support.isEnded = true;

    await this.supportRepository.save(support);

    return support;
  }
}
