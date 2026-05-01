import React from "react";
import { Link, useParams } from "react-router-dom";
import { BookOpen, Sparkles } from "lucide-react";

function SubjectCard({ subject, streamId, classId }) {

  /* 🔥 FALLBACK (VERY IMPORTANT) */
  const params = useParams();
  const safeClassId = classId || params.classId;

  /* ❌ Safety */
  if (!subject || !subject._id || !safeClassId) return null;

  /* 🎨 Theme */
  const streamTheme = {
    pcb: {
      icon: "text-green-600",
      border: "hover:border-green-500",
      bg: "hover:bg-green-50"
    },
    pcm: {
      icon: "text-blue-600",
      border: "hover:border-blue-500",
      bg: "hover:bg-blue-50"
    },
    arts: {
      icon: "text-pink-600",
      border: "hover:border-pink-500",
      bg: "hover:bg-pink-50"
    }
  };

  const defaultTheme = {
    icon: "text-indigo-600",
    border: "hover:border-indigo-400",
    bg: "hover:bg-indigo-50"
  };

  const theme = streamTheme[streamId] || defaultTheme;

  return (

    <Link
      to={`/materials/${safeClassId}/${subject._id}`} // ✅ FIXED
      aria-label={`Open ${subject.name} materials`}
      className={`
        group bg-white p-6 rounded-xl shadow-sm
        hover:shadow-lg transition-all duration-200
        flex flex-col items-center gap-3 text-center
        border-t-4 border-transparent
        ${theme.border} ${theme.bg}
      `}
    >

      {/* 📘 ICON */}
      <BookOpen
        size={28}
        className={`${theme.icon} transition-transform duration-200 group-hover:scale-110`}
      />

      {/* 📄 NAME */}
      <span className="font-semibold text-gray-800 line-clamp-2">
        {subject.name}
      </span>

      {/* ✨ TAG */}
      <span className="text-xs text-gray-500 flex items-center gap-1">
        <Sparkles size={12} /> Study Materials
      </span>

    </Link>

  );
}

export default React.memo(SubjectCard);