import React from "react";
import { Link } from "react-router-dom";
import { FileText, Star, Download } from "lucide-react";

function ProductCard({
  _id,
  title = "Untitled Material",
  type = "Notes",
  pages = 0,
  price = 0,
  rating = 4.5,
  thumbnail
}) {

  /* ❌ Safety */
  if (!_id) return null;

  /* 💰 Price format */
  const formatPrice = (num) =>
    `₹${Number(num).toLocaleString("en-IN")}`;

  /* ⭐ Safe rating */
  const safeRating = Math.max(0, Math.min(5, rating));

  return (

    <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col hover:-translate-y-1">

      {/* 🖼 THUMBNAIL */}
      {thumbnail ? (
        <img
          src={thumbnail}
          alt={title}
          loading="lazy"
          className="w-full h-40 object-cover group-hover:scale-105 transition duration-300"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/400x250?text=PDF";
          }}
        />
      ) : (
        <div className="w-full h-40 flex items-center justify-center bg-gray-100">
          <FileText className="text-blue-500" size={40} />
        </div>
      )}

      {/* 📦 CONTENT */}
      <div className="p-5 flex flex-col justify-between flex-1">

        {/* 🔼 TOP */}
        <div>

          <div className="flex items-center justify-between mb-2">

            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded font-medium">
              {type}
            </span>

            <div className="flex items-center gap-1 text-yellow-500 text-sm font-semibold">
              <Star size={14} fill="currentColor" />
              {safeRating.toFixed(1)}
            </div>

          </div>

          <h2 className="font-semibold text-lg leading-tight line-clamp-2 text-gray-800">
            {title}
          </h2>

          <div className="text-sm text-gray-600 mt-2 space-y-1">

            <p>
              📄 Pages: <span className="font-medium">{pages}</span>
            </p>

            <p className="text-green-600 font-medium">
              ⚡ Instant Download
            </p>

          </div>

        </div>

        {/* 🔽 BOTTOM */}
        <div className="mt-5">

          <p className="text-2xl font-bold text-blue-600 mb-3">
            {formatPrice(price)}
          </p>

          <Link
            to={`/product/${_id}`}
            aria-label={`View details of ${title}`}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition font-medium active:scale-95"
          >
            <Download size={16} />
            View Details
          </Link>

        </div>

      </div>

    </div>

  );

}

export default React.memo(ProductCard);