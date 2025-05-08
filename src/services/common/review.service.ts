import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { Review } from 'src/entities/reviews.entity';
import { Task } from 'src/entities/task.entity';
import { Status } from 'src/entities/enums/Status.enum';
import { UserRole } from 'src/entities/enums/roles.enum';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,

    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async getReviews(telegramId: string): Promise<Review[] | string> {
    const user = await this.userRepository.findOne({ where: { telegramId } });

    if (!user || user?.role === UserRole.BANNED) {
      return 'Пользователь с таким telegramId не найден.';
    }

    const reviews = await this.reviewRepository.find({
      where: {
        userTo: user,
      },
      select: {
        message: true,
        stars: true,
        userFrom: {
          name: true,
        },
      },
    });

    return reviews;
  }

  async createReview(
    telegramId: string,
    taskId: string,
    message: string,
    stars: number,
  ): Promise<Review | string> {
    const user = await this.userRepository.findOne({ where: { telegramId } });

    if (!user || user?.role === UserRole.BANNED) {
      return 'Пользователь с таким telegramId не найден.';
    }

    const task = await this.taskRepository.findOne({
      where: {
        id: taskId,
      },
      relations: ['client', 'performer'],
    });

    if (!task) {
      return 'Задача с таким id не найдена';
    }

    if (task.status !== Status.DONE || Status.CANCELED || Status.PROBLEM) {
      return 'Вы не можете оставить отзыв по незавершенно задаче';
    }

    if (
      task.client.telegramId !== telegramId ||
      task.performer.id !== telegramId
    ) {
      return 'Вы не можете оставить отзыв по этой задаче';
    }

    const userTo =
      telegramId === task.client.telegramId ? task.client : task.performer;

    if (!(stars > 0 && stars < 6)) {
      return 'Можно поставить от 1 до 5 звезд';
    }

    const review = this.reviewRepository.create({
      userFrom: user,
      userTo,
      message,
      stars,
    });

    await this.reviewRepository.save(review);

    return review;
  }

  async getTasksWithoutRivew(telegramId: string): Promise<Task[] | string> {
    const user = await this.userRepository.findOne({ where: { telegramId } });

    if (!user) {
      return 'Пользователь с таким telegramId не найден.';
    }

    const performerTasks = await this.taskRepository.find({
      where: {
        performer: user,
      },
    });

    const clientTasks = await this.taskRepository.find({
      where: {
        client: user,
      },
    });

    return { ...performerTasks, ...clientTasks };
  }
}
