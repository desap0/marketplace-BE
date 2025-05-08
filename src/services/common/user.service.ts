import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { getUserBalance } from 'src/helpers/getUserBalance.helper';
import { Transaction } from 'src/entities/transaction.entity';
import { UserRole } from 'src/entities/enums/roles.enum';
import { getUserRaiting } from 'src/helpers/getUserRaiting.helper';
import { Review } from 'src/entities/reviews.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,

    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  async my(telegramId: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { telegramId } });

    if (!user || user?.role === UserRole.BANNED) {
      return 'Пользователь с таким telegramId не найден.';
    }

    const balance = await getUserBalance(this.transactionRepository, user);
    const raiting = await getUserRaiting(this.reviewRepository, user);

    const data = { ...user, balance, raiting };

    return data;
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findOne({
      where: {
        id,
        role: Not(UserRole.ADMIN),
      },
    });

    console.log(user)

    return user;
  }
}
