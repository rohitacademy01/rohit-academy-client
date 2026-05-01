import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/* Route Guards */
import ProtectedRoute from "../components/layout/ProtectedRoute";
import AdminRoute from "../components/layout/AdminRoute";
import UserLayout from "../components/layout/UserLayout";

/* User Pages */
import Home from "../pages/Home";
import Classes from "../pages/Classes";
import Streams from "../pages/Streams";
import Batches from "../pages/Batches";
import BatchDetails from "../pages/BatchDetails";
import SubjectPDFs from "../pages/SubjectPDFs";
import MyDownloads from "../pages/MyDownloads";
import Account from "../pages/Account";
import Success from "../pages/Success";
import Terms from "../pages/Terms";
import Privacy from "../pages/Privacy";
import NotFound from "../pages/NotFound";

/* Auth */
import Login from "../pages/auth/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import AdminLogin from "../pages/AdminLogin";

/* Legacy Pages */
import Subjects from "../pages/Subjects";
import StudyMaterials from "../pages/StudyMaterials";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import ProductDetails from "../pages/ProductDetails";
import SetupUsername from "../pages/SetupUsername";

/* Admin */
import AdminLayout from "../admin/layout/AdminLayout";
import AdminDashboard from "../admin/dashboard/AdminDashboard";
import ManageAcademics from "../admin/academics/ManageAcademics";
import ManageClasses from "../admin/academics/ManageClasses";
import ManageSubjects from "../admin/academics/ManageSubjects";
import ManageStreams from "../admin/academics/ManageStreams";
import ManageBatches from "../admin/batches/ManageBatches";
import ManageMaterials from "../admin/materials/ManageMaterials";
import UploadMaterial from "../admin/materials/UploadMaterial";
import ManageUsers from "../admin/users/ManageUsers";
import OrdersAdmin from "../admin/orders/OrdersAdmin";
import Coupons from "../admin/finance/Coupons";
import SalesReport from "../admin/finance/SalesReport";
import ManagePDFs from "../admin/pdfs/ManagePDFs";

function AppRoutes() {
  const { user, loading } = useAuth();

  let admin = null;
  try {
    const raw = localStorage.getItem("admin");
    admin = raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem("admin");
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <Routes>

      {/* AUTH */}
      <Route path="/login" element={user ? <Navigate to="/account" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/account" replace /> : <Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/admin-login" element={admin?.token ? <Navigate to="/admin" replace /> : <AdminLogin />} />

      {/* SUCCESS */}
      <Route path="/success" element={<Success />} />

      {/* USER LAYOUT */}
      <Route element={<UserLayout />}>

        <Route index element={<Home />} />
        <Route path="/classes" element={<Classes />} />
        <Route path="/classes/:classId" element={<Classes />} />
        <Route path="/streams/:classId" element={<Streams />} />
        <Route path="/batches" element={<Batches />} />
        <Route path="/batches/:id" element={<BatchDetails />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />

        {/* Legacy routes */}
        <Route path="/subjects/:classId/:streamId" element={<Subjects />} />
        <Route path="/subjects/:classId" element={<Subjects />} />
        <Route path="/materials/:classId/:subjectId" element={<StudyMaterials />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />

        {/* Protected User */}
        <Route element={<ProtectedRoute />}>
          <Route path="/account" element={<Account />} />
          <Route path="/setup-username" element={<SetupUsername />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/downloads" element={<MyDownloads />} />
          {/* 🆕 Subject PDFs - requires login + batch purchase */}
          <Route path="/subject-pdfs/:subjectId" element={<SubjectPDFs />} />
        </Route>

      </Route>

      {/* ADMIN */}
      <Route path="/admin" element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="academics" element={<ManageAcademics />} />
          <Route path="academics/classes" element={<ManageClasses />} />
          <Route path="academics/streams" element={<ManageStreams />} />
          <Route path="academics/subjects" element={<ManageSubjects />} />
          <Route path="batches" element={<ManageBatches />} />
          <Route path="materials" element={<ManageMaterials />} />
          <Route path="materials/upload" element={<UploadMaterial />} />
          <Route path="pdfs" element={<ManagePDFs />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="orders" element={<OrdersAdmin />} />
          <Route path="coupons" element={<Coupons />} />
          <Route path="sales-report" element={<SalesReport />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />

    </Routes>
  );
}

export default AppRoutes;
