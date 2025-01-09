import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  TableInheritance,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { Task } from './task.entity';

@Entity({
  name: 'supports',
})
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class Support {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @ManyToOne(() => User, (moderator) => moderator.id)
  moderator: User;

  @OneToOne(() => Task, (task) => task.id)
  task: Task;

  @ApiProperty({
    example: 'У меня проблема с тем...',
    description: 'Сообщение о проблеме',
  })
  @Column({ length: 5000, nullable: false })
  message: string;

  @ApiProperty({ example: true, description: 'Завершено ли обращение' })
  @Column({
    default: false,
    nullable: false,
  })
  isEnded: boolean;

  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @ApiProperty({
    example: 'Мой ответ....',
    description: 'Ответ модератора',
  })
  @Column({ length: 5000, nullable: true })
  answer: string;
}
