import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { UserRole } from 'src/entities/enums/roles.enum';

@Injectable()
export class FirstUserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findOrCreateUser(
    telegramId: string,
    telegramLogin: string,
    name: string,
  ) {
    let user = await this.userRepository.findOne({ where: { telegramId } });
    if (!user) {
      const isAdmin = (await this.userRepository.count()) === 0;
      user = this.userRepository.create({
        telegramId,
        telegramLogin,
        name,
        role: isAdmin ? UserRole.ADMIN : UserRole.CLIENT, // CLIENT по умолчанию
      });
      await this.userRepository.save(user);

      return { ...user, finded: isAdmin };
    }
    return { ...user, finded: true };
  }

  async updateUserRole(telegramId: string, role: UserRole): Promise<void> {
    await this.userRepository.update({ telegramId }, { role });
  }
}
