import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { CheckCircle, Download, Home, BookOpen } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

function Success() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Processing...");
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    let isMounted = true;

    const handleSuccess = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const token = params.get("token");
        const payment = params.get("payment");

        if (token) {
          setMessage("Logging you in...");
          login({ token });
          setTimeout(() => {
            if (!isMounted) return;
            const storedUser = localStorage.getItem("user");
            const u = storedUser ? JSON.parse(storedUser) : null;
            navigate(u ? "/account" : "/login", { replace: true });
          }, 400);
          return;
        }

        if (payment === "success") {
          setMessage("Unlocking your materials...");
          if (clearCart) clearCart();
          setTimeout(() => { if (isMounted) setLoading(false); }, 800);
          return;
        }

        navigate("/", { replace: true });
      } catch {
        navigate("/login", { replace: true });
      }
    };

    handleSuccess();
    return () => { isMounted = false; };
  }, []);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mb-4" />
      <p className="text-lg font-medium text-gray-700">{message}</p>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 px-4">
      <div className="max-w-lg w-full text-center bg-white p-10 rounded-3xl shadow-2xl border border-green-100">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-green-500" size={56} />
        </div>
        <h1 className="text-3xl font-extrabold text-green-700 mb-3">Payment Successful!</h1>
        <p className="text-gray-500 mb-8 text-lg">
          Your batch has been unlocked. Start downloading your study materials right away!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={() => navigate("/downloads")}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3.5 rounded-2xl font-bold hover:from-blue-700 hover:to-indigo-700 transition shadow-lg">
            <Download size={18} /> My Downloads
          </button>
          <button onClick={() => navigate("/account")}
            className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-8 py-3.5 rounded-2xl font-bold hover:bg-gray-200 transition">
            <BookOpen size={18} /> My Account
          </button>
        </div>
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 mt-6 transition">
          <Home size={14} /> Back to Home
        </Link>
      </div>
    </div>
  );
}

export default Success;
