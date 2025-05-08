import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { TransactionType } from './enums/transactionType.enum';
import { Payment } from './payment.entity';
import { Task } from './task.entity';

@Entity('transactions')
export class Transaction {
  @ApiProperty({
    example: '1a2b3c',
    description: 'Уникальный идентификатор транзакции',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 3000, description: 'Сумма транзакции' })
  @Column()
  amount: number;

  @ApiProperty({ example: TransactionType.ADD, description: 'Тип транзакции' })
  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @ManyToOne(() => Payment, (payment) => payment.id)
  payment: Payment;

  @ManyToOne(() => Task, (task) => task.id)
  task: Task;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Дата создания транзакции',
  })
  @CreateDateColumn()
  createdAt: Date;
}
