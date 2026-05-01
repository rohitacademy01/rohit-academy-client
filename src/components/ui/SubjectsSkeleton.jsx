import React from "react";

function SubjectsSkeleton({ count = 10 }) {

  return (

    <div
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
      aria-busy="true"
      aria-label="Loading subjects"
    >

      {Array.from({ length: count }).map((_, i) => (

        <div
          key={i}
          className="relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
        >

          {/* 🔥 Shimmer Layer */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="w-full h-full shimmer"></div>
          </div>

          {/* Icon */}
          <div className="w-12 h-12 rounded-xl bg-gray-200 mb-4"></div>

          {/* Title */}
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>

          {/* Subtitle */}
          <div className="h-3 bg-gray-100 rounded w-1/2"></div>

        </div>

      ))}

    </div>

  );

}

export default SubjectsSkeleton;