import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { Status } from './enums/Status.enum';

@Entity('tasks')
export class Task {
  @ApiProperty({
    example: '1a2b3c',
    description: 'Уникальный идентификатор задачи',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Создать бота', description: 'Название задачи' })
  @Column({
    length: 256,
    nullable: false,
  })
  name: string;

  @ApiProperty({ example: 'Описание задачи', description: 'Описание задачи' })
  @Column({
    length: 5000,
    nullable: true,
  })
  description: string;

  @ApiProperty({ example: Status.NOT_STARTED, description: 'Статус задачи' })
  @Column({
    type: 'enum',
    enum: Status,
    default: Status.NOT_STARTED,
  })
  status: Status;

  @ApiProperty({ example: 3000, description: 'Стоимость задачи' })
  @Column({
    nullable: false,
    type: 'int',
  })
  price: number;

  @ApiProperty({
    example: false,
    description: 'Подтверждено ли выполнение задачи',
    nullable: false,
    default: false,
  })
  @Column({
    nullable: false,
    default: false,
  })
  isClientApproved: boolean;

  @ManyToOne(() => User, (user) => user.id)
  client: User;

  @ManyToOne(() => User, (user) => user.id, { nullable: true })
  performer: User;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Дата создания задачи',
  })
  @CreateDateColumn()
  createdAt: Date;
}
