import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  TableInheritance,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from './enums/roles.enum';

@Entity({
  name: 'users',
})
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: '874908979', description: 'Telegram ID' })
  @Column({ length: 256, nullable: false, unique: true })
  telegramId: string;

  @ApiProperty({ example: '@desap00', description: 'Telegram Login' })
  @Column({ length: 256, nullable: false, unique: true })
  telegramLogin: string;

  @ApiProperty({ example: 'Денис', description: 'Имя пользователя' })
  @Column({ length: 256, nullable: false })
  name: string;

  @ApiProperty({ example: UserRole, description: 'Роль' })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CLIENT,
    nullable: false,
  })
  role: UserRole;

  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
