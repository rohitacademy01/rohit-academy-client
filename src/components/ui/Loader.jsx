import React from "react";
import { GraduationCap } from "lucide-react";

function Loader({
  text = "Loading study materials...",
  fullScreen = false,
  size = "md" // sm | md | lg
}) {

  const sizeMap = {
    sm: "w-12 h-12",
    md: "w-20 h-20",
    lg: "w-28 h-28"
  };

  return (

    <div
      className={`flex items-center justify-center px-4 ${
        fullScreen ? "min-h-screen" : "min-h-[320px]"
      }`}
      role="status"
      aria-live="polite"
    >

      <div className="flex flex-col items-center gap-6">

        {/* 🔥 Spinner */}
        <div className={`relative flex items-center justify-center ${sizeMap[size]}`}>

          {/* Glow */}
          <div className={`absolute ${sizeMap[size]} bg-blue-200 rounded-full blur-2xl opacity-40 animate-pulse`}></div>

          {/* Rings */}
          <div className={`absolute ${sizeMap[size]} rounded-full border-[3px] border-blue-500 border-t-transparent animate-spin`}></div>

          <div className="absolute w-[80%] h-[80%] rounded-full border-[3px] border-blue-300 border-b-transparent animate-spin slow-spin"></div>

          <div className="absolute w-[60%] h-[60%] rounded-full border-[3px] border-blue-200 border-l-transparent animate-spin slower-spin"></div>

          {/* Center Icon */}
          <div className="relative flex items-center justify-center float">
            <GraduationCap size={28} className="text-blue-600" />
          </div>

        </div>

        {/* 📝 Text */}
        <div className="flex flex-col items-center gap-2">

          <p className="text-sm text-gray-600 font-medium tracking-wide">
            {text}
          </p>

          {/* Dots */}
          <div className="flex gap-2">
            <span className="dot"></span>
            <span className="dot delay-1"></span>
            <span className="dot delay-2"></span>
          </div>

        </div>

      </div>

    </div>

  );

}

export default Loader;