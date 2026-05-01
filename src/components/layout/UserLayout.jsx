import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

function UserLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 pb-24 md:pb-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default UserLayout;
