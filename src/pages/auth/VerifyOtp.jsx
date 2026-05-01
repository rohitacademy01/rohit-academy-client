import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../../config/firebase";
import API from "../../services/api";

function VerifyOtp() {

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const otpRef = useRef(null);

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(60);

  const phone = location.state?.phone;
  const redirectPath = location.state?.from || "/account";

  /* ===============================
     ❌ NO PHONE
  ============================== */
  useEffect(() => {
    if (!phone) {
      navigate("/login");
    }
  }, [phone, navigate]);

  /* ===============================
     ⏱ TIMER
  ============================== */
  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  /* ===============================
     🔥 VERIFY OTP (FINAL)
  ============================== */
  const handleVerifyOtp = async (e) => {

    e.preventDefault();

    if (loading) return;

    if (otp.length !== 6) {
      setError("Enter valid 6 digit OTP");
      return;
    }

    try {

      setLoading(true);
      setError("");

      if (!window.confirmationResult) {
        throw new Error("OTP expired. Please try again.");
      }

      /* 🔥 FIREBASE VERIFY */
      const result = await window.confirmationResult.confirm(otp);
      const firebaseUser = result.user;

      /* 🔥 GET TOKEN */
      const idToken = await firebaseUser.getIdToken(true);

      /* 🔥 BACKEND LOGIN */
      const res = await API.post("/auth/firebase-login", {
        token: idToken
      });

      const data = res.data;

      if (!data?.token || !data?.user) {
        throw new Error("Login failed");
      }

      /* 🔥 SAVE LOGIN */
      login(data);

      /* 🔥 CLEAN GLOBAL */
      window.confirmationResult = null;

      navigate(redirectPath, { replace: true });

    } catch (err) {

      console.error("OTP VERIFY ERROR:", err);

      setError(
        err.response?.data?.message ||
        err.message ||
        "Invalid OTP"
      );

    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     🔁 RESEND OTP
  ============================== */
  const handleResend = async () => {

    if (timer > 0 || loading) return;

    try {

      setError("");
      setTimer(60);

      if (!window.recaptchaVerifier) {
        throw new Error("Session expired. Please go back.");
      }

      const confirmation = await signInWithPhoneNumber(
        auth,
        phone,
        window.recaptchaVerifier
      );

      window.confirmationResult = confirmation;

    } catch (err) {

      console.error("RESEND ERROR:", err);

      setError(
        err.message ||
        "Failed to resend OTP"
      );
    }
  };

  /* ===============================
     UI
  ============================== */
  return (

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-200 px-4">

      <div className="bg-white w-full max-w-md p-6 sm:p-8 rounded-2xl shadow-xl">

        <h2 className="text-xl font-semibold text-center mb-4">
          Verify OTP
        </h2>

        <p className="text-center text-gray-600 mb-6">
          OTP sent to <strong>{phone}</strong>
        </p>

        {error && (
          <div className="bg-red-100 text-red-600 p-2 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleVerifyOtp} className="space-y-5">

          <input
            ref={otpRef}
            autoFocus
            type="tel"
            value={otp}
            onChange={(e) =>
              setOtp(
                e.target.value.replace(/\D/g, "").slice(0, 6)
              )
            }
            placeholder="Enter OTP"
            className="w-full border p-4 rounded-xl text-center text-xl tracking-widest"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-xl"
          >
            {loading ? "Verifying..." : "Verify & Login"}
          </button>

          <div className="flex justify-between text-sm">

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-gray-500"
            >
              Change Number
            </button>

            <button
              type="button"
              disabled={timer > 0}
              onClick={handleResend}
              className={
                timer > 0
                  ? "text-gray-400"
                  : "text-blue-600"
              }
            >
              {timer > 0
                ? `Resend in ${timer}s`
                : "Resend OTP"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default VerifyOtp;