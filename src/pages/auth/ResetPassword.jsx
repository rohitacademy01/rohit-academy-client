import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.password) { setError("Password required"); return; }
    if (form.password !== form.confirmPassword) { setError("Passwords do not match"); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    try {
      setLoading(true);
      setError("");
      const res = await API.post(`/auth/reset-password/${token}`, { password: form.password });
      if (res.data?.token) {
        login(res.data);
        navigate("/account", { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed. Link may be expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-2xl border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl">🔐</div>
          <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
          <p className="text-gray-500 text-sm mt-1">Enter your new password</p>
        </div>
        {error && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input type="password" placeholder="Minimum 6 characters" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border-2 border-gray-200 focus:border-blue-500 p-3 rounded-xl outline-none transition" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input type="password" placeholder="Re-enter new password" value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              className="w-full border-2 border-gray-200 focus:border-blue-500 p-3 rounded-xl outline-none transition" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 transition">
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          <Link to="/login" className="text-blue-600 hover:text-blue-700">← Back to Login</Link>
        </p>
      </div>
    </div>
  );
}
export default ResetPassword;
