import React, { useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError("Email is required"); return; }
    try {
      setLoading(true);
      setError("");
      await API.post("/auth/forgot-password", { email });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-2xl border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-100 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl">🔑</div>
          <h1 className="text-2xl font-bold text-gray-900">Forgot Password?</h1>
          <p className="text-gray-500 text-sm mt-2">Enter your email and we'll send you a reset link</p>
        </div>

        {success ? (
          <div className="text-center">
            <div className="text-5xl mb-4">📬</div>
            <h3 className="font-semibold text-gray-900 mb-2">Check Your Email</h3>
            <p className="text-gray-500 text-sm mb-6">If your email is registered, you'll receive a password reset link shortly.</p>
            <Link to="/login" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition">Back to Login</Link>
          </div>
        ) : (
          <>
            {error && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-4 text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-2 border-gray-200 focus:border-blue-500 p-3 rounded-xl outline-none transition" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition">
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-4">
              <Link to="/login" className="text-blue-600 hover:text-blue-700">← Back to Login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
export default ForgotPassword;
