import React, { forwardRef } from "react";

const Button = forwardRef(({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  full = false,
  icon,
  className = ""
}, ref) => {

  const baseStyle =
    "rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-1";

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-400",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-300",
    danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-400",
    ghost: "bg-transparent text-blue-600 hover:bg-blue-50 focus:ring-blue-200"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  const isDisabled = loading || disabled;

  // ✅ fallback safety
  const safeVariant = variants[variant] || variants.primary;
  const safeSize = sizes[size] || sizes.md;

  // 🎯 spinner color fix
  const spinnerColor =
    variant === "secondary" || variant === "ghost"
      ? "border-gray-600"
      : "border-white";

  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={loading}
      aria-disabled={isDisabled}
      className={`
        ${baseStyle}
        ${safeVariant}
        ${safeSize}
        ${full ? "w-full" : ""}
        ${isDisabled
          ? "opacity-60 cursor-not-allowed"
          : "hover:scale-[1.02] active:scale-[0.98]"}
        ${className}
      `}
    >
      {loading ? (
        <div
          className={`w-5 h-5 border-2 ${spinnerColor} border-t-transparent rounded-full animate-spin`}
        />
      ) : (
        <>
          {icon && <span className="flex items-center">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
});

export default React.memo(Button);