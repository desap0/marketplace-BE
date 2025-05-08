import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { PaymentType } from './enums/paymentType.enum';

@Entity('payments')
export class Payment {
  @ApiProperty({
    example: '1a2b3c',
    description: 'Уникальный идентификатор платежа',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: '1234123412341234',
    description:
      'Номер карты или номер телефона который использовался при вооде средств или будет использоваться для вывода',
  })
  @Column({ length: 16, nullable: false })
  requisites: string;

  @ApiProperty({ example: 3000, description: 'Сумма платежа' })
  @Column()
  amount: number;

  @ApiProperty({ example: PaymentType.IN, description: 'Тип платежа' })
  @Column({
    type: 'enum',
    enum: PaymentType,
  })
  type: PaymentType;

  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Дата создания платежа',
  })
  @CreateDateColumn()
  createdAt: Date;
}
