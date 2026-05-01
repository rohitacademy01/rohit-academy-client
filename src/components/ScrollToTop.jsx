import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToTop() {

  const { pathname, hash } = useLocation();

  useEffect(() => {

    /* 🔹 HASH PRESENT (anchor scroll) */
    if (hash) return;

    /* 🔹 NORMAL SCROLL */
    window.scrollTo(0, 0);

    // 👉 smooth chahiye to use karo:
    // window.scrollTo({ top: 0, behavior: "smooth" });

  }, [pathname, hash]);

  return null;
}

export default ScrollToTop;