import React from "react";
import { Link } from "react-router-dom";
import { GraduationCap, Lock } from "lucide-react";

function ClassCard({ id, name, route }) {

  if (!id || !name) return null;

  /* 🔤 normalize */
  const normalized = name.toLowerCase().trim();

  /* 🎯 detect class number */
  const classNumber = normalized.replace("class ", "");

  const isStreamClass = ["11", "12"].includes(classNumber);

  const isComingSoon = ["ba", "bsc", "bcom"].includes(classNumber);

  const safeRoute = route || "/classes";

  return (

    <div className="relative">

      <Link
        to={isComingSoon ? "#" : safeRoute}
        onClick={(e) => isComingSoon && e.preventDefault()}
        aria-disabled={isComingSoon}
        aria-label={`Open ${name}`}
        className={`
          relative bg-white p-6 rounded-xl shadow-sm
          transition-all duration-300
          flex flex-col items-center gap-3 text-center group
          border border-gray-100

          ${
            isComingSoon
              ? "opacity-60 cursor-not-allowed"
              : "hover:shadow-xl hover:-translate-y-1"
          }
        `}
      >

        {/* 🎓 ICON */}
        <GraduationCap
          size={30}
          className={`
            transition-transform duration-300
            ${isComingSoon ? "text-gray-400" : "text-blue-600"}
            ${!isComingSoon && "group-hover:scale-110"}
          `}
        />

        {/* 📚 NAME */}
        <span
          className={`
            font-semibold text-lg
            ${isComingSoon ? "text-gray-500" : "text-gray-800"}
          `}
        >
          {name}
        </span>

        {/* 📊 STREAM */}
        {isStreamClass && !isComingSoon && (
          <span className="text-xs text-blue-500 font-medium">
            Choose Stream
          </span>
        )}

        {/* 🔒 BADGE */}
        {isComingSoon && (
          <span className="absolute top-2 right-2 bg-yellow-400 text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1">
            <Lock size={12} /> Soon
          </span>
        )}

      </Link>

    </div>

  );

}

export default React.memo(ClassCard);