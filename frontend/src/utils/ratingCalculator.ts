// Утилита для расчета рейтинга на основе отзывов
export interface Review {
  rating: number;
}

export const calculateAverageRating = (reviews: Review[]): number => {
  if (reviews.length === 0) return 0;
  
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const average = totalRating / reviews.length;
  
  // Округляем до одного знака после запятой
  return Math.round(average * 10) / 10;
};

export const getReviewStats = (reviews: Review[]) => {
  const averageRating = calculateAverageRating(reviews);
  const totalReviews = reviews.length;
  
  // Подсчет по звездам
  const ratingDistribution = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  };
  
  return {
    averageRating,
    totalReviews,
    ratingDistribution
  };
};