import React, { useMemo } from "react";
import { Star } from "lucide-react";

function RatingStars({
  rating = 4.3,
  reviews = 120,
  size = 16,
  showText = true,
  showReviews = true,
  color = "yellow"
}) {

  // 🎯 dynamic colors
  const colorMap = {
    yellow: "text-yellow-400 fill-yellow-400",
    orange: "text-orange-400 fill-orange-400",
    green: "text-green-400 fill-green-400"
  };

  const activeColor = colorMap[color] || colorMap.yellow;

  // ✅ clamp rating
  const safeRating = Math.max(0, Math.min(5, rating));

  // ✅ nearest 0.5
  const roundedRating = Math.round(safeRating * 2) / 2;

  const fullStars = Math.floor(roundedRating);
  const hasHalfStar = roundedRating % 1 !== 0;

  // ⭐ stars render
  const stars = useMemo(() => {
    return [...Array(5)].map((_, i) => {

      const starIndex = i + 1;

      if (starIndex <= fullStars) {
        return (
          <Star
            key={i}
            size={size}
            className={activeColor}
          />
        );
      }

      if (starIndex === fullStars + 1 && hasHalfStar) {
        return (
          <div key={i} className="relative" style={{ width: size, height: size }}>

            <Star size={size} className="text-gray-300 absolute" />

            <div
              className="absolute overflow-hidden"
              style={{ width: size / 2 }}
            >
              <Star size={size} className={activeColor} />
            </div>

          </div>
        );
      }

      return (
        <Star
          key={i}
          size={size}
          className="text-gray-300"
        />
      );

    });
  }, [fullStars, hasHalfStar, size, activeColor]);

  // 💬 reviews format
  const formatReviews = (num) => {
    if (num >= 1000) {
      const value = (num / 1000).toFixed(1);
      return value.endsWith(".0")
        ? `${parseInt(value)}k`
        : `${value}k`;
    }
    return num;
  };

  const reviewText = reviews === 1 ? "review" : "reviews";

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
      {showText && (
        <span className="font-medium text-gray-700">
          {safeRating.toFixed(1)}
        </span>
      )}

      {/* 💬 Reviews */}
      {showReviews && (
        <span className="text-gray-500">
          ({formatReviews(reviews)} {reviewText})
        </span>
      )}

    </div>

  );

}

export default React.memo(RatingStars);