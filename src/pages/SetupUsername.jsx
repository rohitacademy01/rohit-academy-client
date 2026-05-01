import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Navigate } from "react-router-dom";
import API from "../services/api";

function SetupUsername() {

  const { user, loading, setUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  /* 🔄 WAIT */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  /* 🔐 NOT LOGGED IN */
  if (!user) return <Navigate to="/login" replace />;

  /* 🚫 NOT GOOGLE USER */
  if (user.authProvider !== "google") {
    return <Navigate to="/account" replace />;
  }

  /* ✅ VALIDATE */
  const validate = () => {

    const cleaned = name.trim().toLowerCase();

    if (!cleaned) return "Username required";

    if (!/^[a-z0-9_]+$/.test(cleaned)) {
      return "Only lowercase letters, numbers & underscore allowed";
    }

    if (cleaned.length < 3 || cleaned.length > 20) {
      return "Username must be 3–20 characters";
    }

    return null;
  };

  /* 💾 SAVE USERNAME */
  const handleSave = async () => {

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {

      setSaving(true);
      setError("");

      const res = await API.put("/auth/set-username", {
        name: name.trim().toLowerCase()
      });

      const updatedUser = res.data?.data;

      /* 🔥 update context */
      setUser(updatedUser);

      navigate("/account", { replace: true });

    } catch (err) {

      const msg =
        err?.response?.data?.message ||
        "Failed to update username";

      setError(msg);

    } finally {
      setSaving(false);
    }
  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">

      <div className="bg-white p-8 rounded-2xl shadow max-w-md w-full">

        <h1 className="text-2xl font-bold mb-4 text-center">
          Set Your Username
        </h1>

        <p className="text-gray-600 text-sm mb-4 text-center">
          This will be your public identity
        </p>

        {/* INPUT */}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter username"
          className="w-full border px-4 py-3 rounded-lg mb-3"
        />

        {/* ERROR */}
        {error && (
          <p className="text-red-600 text-sm mb-3">
            {error}
          </p>
        )}

        {/* BUTTON */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
        >
          {saving ? "Saving..." : "Continue"}
        </button>

      </div>

    </div>

  );

}

export default SetupUsername;