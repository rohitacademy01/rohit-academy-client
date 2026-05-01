import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  CheckCircle,
  Eye,
  EyeOff,
  Loader2
} from "lucide-react";
import API from "../services/api";

function AdminLogin() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  /* =====================================
     🔐 AUTO REDIRECT (SAFE + CLEAN)
  ===================================== */
  useEffect(() => {
    try {
      const raw = localStorage.getItem("admin");

      if (!raw) return;

      const admin = JSON.parse(raw);

      if (admin?.token && admin?.role === "admin") {
        navigate("/admin", { replace: true });
      }

    } catch {
      localStorage.removeItem("admin");
    }
  }, [navigate]);

  /* =====================================
     ✍️ INPUT CHANGE
  ===================================== */
  const handleChange = (e) => {
    setError("");

    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value.trimStart()
    }));
  };

  /* =====================================
     🔐 LOGIN (FINAL HARDENED)
  ===================================== */
  const handleLogin = async (e) => {

    e.preventDefault();

    if (loading || success) return;

    if (!form.email.trim() || !form.password.trim()) {
      setError("⚠️ Please fill all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {

      const res = await API.post("/admin/login", {
        email: form.email.trim().toLowerCase(),
        password: form.password
      });

      const data = res.data;

      /* ❌ INVALID RESPONSE */
      if (!data?.token) {
        throw new Error("Invalid admin response");
      }

      /* 🔥 CLEAN ONLY ADMIN (NOT USER DATA) */
      localStorage.removeItem("admin");

      /* 🔥 SAVE ADMIN (NO TOKEN CONFLICT) */
      localStorage.setItem("admin", JSON.stringify({
        token: data.token,
        role: "admin"
      }));


      setSuccess(true);

      setTimeout(() => {
        navigate("/admin", { replace: true });
      }, 700);

    } catch (err) {


      const msg =
        err.response?.data?.message ||
        err.message ||
        "❌ Invalid email or password";

      setError(msg);

      setShake(true);
      setTimeout(() => setShake(false), 400);

    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="relative min-h-screen flex items-center justify-center overflow-hidden
    bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">

      {/* BACKGROUND */}
      <div className="absolute w-72 h-72 bg-blue-200 rounded-full blur-3xl opacity-30 top-[-50px] left-[-50px]" />
      <div className="absolute w-72 h-72 bg-purple-200 rounded-full blur-3xl opacity-30 bottom-[-50px] right-[-50px]" />

      {/* CARD */}
      <div
        className={`relative z-10 max-w-md w-full bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl transition-all duration-300
        ${shake ? "animate-[shake_.4s]" : ""}
        ${success ? "border-2 border-green-500" : ""}`}
      >

        {/* HEADER */}
        <div className="flex flex-col items-center mb-6">

          {success ? (
            <CheckCircle size={42} className="text-green-600 mb-2" />
          ) : (
            <ShieldCheck size={42} className="text-blue-600 mb-2" />
          )}

          <h1 className="text-3xl font-bold">Admin Login</h1>

          <p className="text-sm text-gray-500 mt-1">
            Authorized access only
          </p>

        </div>

        <form onSubmit={handleLogin} className="space-y-4">

          {/* EMAIL */}
          <input
            name="email"
            type="email"
            placeholder="Admin Email"
            required
            disabled={success}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
          />

          {/* PASSWORD */}
          <div className="relative">

            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              required
              disabled={success}
              onChange={handleChange}
              className="w-full border p-3 pr-10 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>

          </div>

          {/* ERROR */}
          {error && (
            <p className="text-red-500 text-sm text-center">
              {error}
            </p>
          )}

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading || success}
            className={`w-full py-3 rounded-lg text-white font-semibold transition flex items-center justify-center gap-2 ${
              loading
                ? "bg-gray-400"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >

            {success ? (
              <>
                <CheckCircle size={18} /> Success
              </>
            ) : loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Logging in...
              </>
            ) : (
              "Login as Admin"
            )}

          </button>

        </form>

      </div>

      {/* SHAKE ANIMATION */}
      <style>{`
        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          50% { transform: translateX(6px); }
          75% { transform: translateX(-6px); }
          100% { transform: translateX(0); }
        }
      `}</style>

    </div>
  );
}

export default AdminLogin;