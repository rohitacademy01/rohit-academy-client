import React from "react";
import { Navigate, Outlet } from "react-router-dom";

function AdminRoute() {
  let admin = null;
  try {
    const raw = localStorage.getItem("admin");
    admin = raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem("admin");
  }

  if (!admin?.token) {
    return <Navigate to="/admin-login" replace />;
  }

  return <Outlet />;
}

export default AdminRoute;
