import { Review } from 'src/entities/reviews.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

export const getUserRaiting = async (
  reviewRepository: Repository<Review>,
  user: User,
): Promise<number> => {
  const [reviews, count] = await reviewRepository.findAndCount({
    where: {
      userTo: {
        id: user.id,
      },
    },
  });

  let stars = 0;

  for (const review of reviews) {
    stars += review.stars;
  }

  stars = stars / count;

  return stars;
};
