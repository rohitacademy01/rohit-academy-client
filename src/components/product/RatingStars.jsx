import React, { useMemo } from "react";
import { Star } from "lucide-react";

function RatingStars({ rating = 4.3, reviews = 120 }) {

  // ✅ clamp rating
  const safeRating = Math.max(0, Math.min(5, rating));

  // ✅ better rounding (nearest 0.5)
  const roundedRating = Math.round(safeRating * 2) / 2;

  const fullStars = Math.floor(roundedRating);
  const hasHalfStar = roundedRating % 1 !== 0;

  // ✅ memo for performance
  const stars = useMemo(() => {

    return [...Array(5)].map((_, i) => {

      const starIndex = i + 1;

      if (starIndex <= fullStars) {
        return (
          <Star
            key={i}
            size={16}
            className="text-yellow-400 fill-yellow-400"
          />
        );
      }

      if (starIndex === fullStars + 1 && hasHalfStar) {
        return (
          <div key={i} className="relative w-4 h-4">

            <Star size={16} className="text-gray-300 absolute" />

            <div className="absolute overflow-hidden w-1/2">
              <Star size={16} className="text-yellow-400 fill-yellow-400" />
            </div>

          </div>
        );
      }

      return (
        <Star
          key={i}
          size={16}
          className="text-gray-300"
        />
      );

    });

  }, [fullStars, hasHalfStar]);

  // ✅ better format
  const formatReviews = (num) => {
    if (num >= 1000) {
      const value = (num / 1000).toFixed(1);
      return value.endsWith(".0")
        ? `${parseInt(value)}k`
        : `${value}k`;
    }
    return num;
  };

  return (

    <div
      className="flex items-center gap-2 text-sm"
      aria-label={`Rating ${safeRating} out of 5 from ${reviews} reviews`}
    >

      {/* ⭐ Stars */}
      <div className="flex items-center">
        {stars}
      </div>

      {/* 🔢 Rating */}
      <span className="font-medium text-gray-700">
        {safeRating.toFixed(1)}
      </span>

      {/* 💬 Reviews */}
      <span className="text-gray-500">
        ({formatReviews(reviews)} reviews)
      </span>

    </div>

  );

}

export default React.memo(RatingStars);