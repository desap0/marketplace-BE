import { TransactionType } from 'src/entities/enums/transactionType.enum';
import { Transaction } from 'src/entities/transaction.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

export const getUserBalance = async (
  transactionRepository: Repository<Transaction>,
  user: User,
): Promise<number> => {
  const transactions = await transactionRepository.find({
    where: {
      user: {
        id: user.id,
      },
    },
  });

  let balance = 0;

  for (const transaction of transactions) {
    if (transaction.type === TransactionType.ADD) {
      balance += transaction.amount;
    }
    if (transaction.type === TransactionType.SUB) {
      balance -= transaction.amount;
    }
  }

  return balance;
};
