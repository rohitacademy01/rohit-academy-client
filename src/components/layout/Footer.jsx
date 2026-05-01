import React from "react";
import { Link } from "react-router-dom";
import { GraduationCap, Mail, Youtube, Instagram } from "lucide-react";

const year = new Date().getFullYear();

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16 hidden md:block">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* Brand */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <GraduationCap size={18} className="text-white" />
            </div>
            <span className="text-xl font-extrabold text-white">Rohit <span className="text-blue-400">Academy</span></span>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
            Premium PDF study materials for Class 9–12. PCM, PCB, Arts streams. Expert-crafted notes for exam success.
          </p>
          <div className="flex gap-4 mt-6">
            <a href="#" className="text-gray-400 hover:text-white transition"><Instagram size={20} /></a>
            <a href="#" className="text-gray-400 hover:text-white transition"><Youtube size={20} /></a>
            <a href="mailto:support@rohitacademy.net" className="text-gray-400 hover:text-white transition"><Mail size={20} /></a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Quick Links</h3>
          <ul className="space-y-2">
            {[
              { to: "/batches", label: "Browse Batches" },
              { to: "/classes", label: "All Classes" },
              { to: "/streams/class11", label: "Class 11 Streams" },
              { to: "/streams/class12", label: "Class 12 Streams" },
            ].map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="text-sm text-gray-400 hover:text-white transition">{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Support</h3>
          <ul className="space-y-2">
            {[
              { to: "/login", label: "Login" },
              { to: "/register", label: "Register" },
              { to: "/downloads", label: "My Downloads" },
              { to: "/terms", label: "Terms of Service" },
              { to: "/privacy", label: "Privacy Policy" },
            ].map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="text-sm text-gray-400 hover:text-white transition">{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

      </div>

      <div className="border-t border-gray-800 py-5 text-center text-xs text-gray-500">
        © {year} Rohit Academy. All rights reserved. · Secure payments by Razorpay.
      </div>
    </footer>
  );
}

export default Footer;
