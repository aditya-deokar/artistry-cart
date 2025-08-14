

import { FC } from 'react';

type StarRatingProps = { rating: number; maxRating?: number; className?: string; };

const StarIcon: FC<{ fill: 'full' | 'half' | 'none' }> = ({ fill }) => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><defs><linearGradient id="half"><stop offset="50%" stopColor="currentColor" /><stop offset="50%" stopColor="#A1A1AA" stopOpacity="0.4" /></linearGradient></defs><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z" fill={fill === 'full' ? 'currentColor' : fill === 'half' ? 'url(#half)' : 'rgba(161, 161, 170, 0.4)'} /></svg>
);

export const StarRating: FC<StarRatingProps> = ({ rating, maxRating = 5, className = 'text-yellow-400' }) => {
  const stars = Array.from({ length: maxRating }, (_, i) => {
    const val = i + 1;
    if (val <= rating) return 'full';
    if (val - 0.5 <= rating) return 'half';
    return 'none';
  });

  return (
    <div className={`flex items-center gap-0.5 ${className}`} aria-label={`Rating: ${rating} out of ${maxRating}`}>
      {stars.map((fill, i) => <StarIcon key={i} fill={fill} />)}
    </div>
  );
};