import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { Task } from './task.entity';

@Entity('reviews')
export class Review {
  @ApiProperty({
    example: '1a2b3c',
    description: 'Уникальный идентификатор задачи',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Описание задачи', description: 'Описание задачи' })
  @Column({
    length: 128,
    nullable: true,
  })
  message: string;

  @ApiProperty({ example: 3000, description: 'Стоимость задачи' })
  @Column({
    nullable: false,
    type: 'int',
  })
  stars: number;

  @ManyToOne(() => User, (user) => user.id)
  userFrom: User;

  @ManyToOne(() => User, (user) => user.id, { nullable: true })
  userTo: User;

  @ManyToOne(() => Task, (task) => task.id)
  task: Task;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Дата создания задачи',
  })
  @CreateDateColumn()
  createdAt: Date;
}
