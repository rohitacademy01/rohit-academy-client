import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Navigate, Link } from "react-router-dom";
import {
  User, Download, LogOut, ShieldCheck, ShoppingBag,
  BookOpen, ChevronRight, Edit3, Phone, Mail, CheckCircle, Package
} from "lucide-react";
import API from "../services/api";

function Account() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [myBatches, setMyBatches] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [batchesLoading, setBatchesLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("batches");
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    if (user) {
      setEditForm({ name: user.name || "", phone: user.phone || "" });
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const fetchBatches = async () => {
      try {
        const res = await API.get("/batches/user/my-batches");
        setMyBatches(res.data?.batches || []);
      } catch { setMyBatches([]); }
      finally { setBatchesLoading(false); }
    };
    const fetchOrders = async () => {
      try {
        const res = await API.get("/admin/orders");
        // get user orders from my-materials
        const res2 = await API.get("/orders/my-materials");
        setMyOrders(res2.data?.orders || res2.data?.data || []);
      } catch { setMyOrders([]); }
      finally { setOrdersLoading(false); }
    };
    fetchBatches();
    fetchOrders();
  }, [user]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  const handleLogout = () => {
    if (!window.confirm("Are you sure you want to logout?")) return;
    logout();
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      await API.put("/auth/profile", editForm);
      setSaveMsg("Profile updated!");
      setEditMode(false);
      setTimeout(() => setSaveMsg(""), 3000);
    } catch (err) {
      setSaveMsg(err.response?.data?.message || "Update failed");
    } finally { setSaving(false); }
  };

  const displayName = user?.name || user?.email?.split("@")[0] || "Student";
  const formatPrice = (p) => `₹${Number(p).toLocaleString("en-IN")}`;

  const tabs = [
    { id: "batches", label: "My Batches", icon: <BookOpen size={16} /> },
    { id: "downloads", label: "Downloads", icon: <Download size={16} /> },
    { id: "orders", label: "Orders", icon: <ShoppingBag size={16} /> },
    { id: "profile", label: "Profile", icon: <User size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Profile Card */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center overflow-hidden flex-shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-white">{displayName[0]?.toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold truncate">{displayName}</h2>
              <p className="text-blue-100 text-sm truncate">{user?.email || user?.phone}</p>
              <div className="flex items-center gap-1 text-green-300 text-xs mt-1">
                <ShieldCheck size={12} /> Verified Account
              </div>
            </div>
            <div className="flex flex-col gap-2 flex-shrink-0">
              <button onClick={() => { setActiveTab("profile"); setEditMode(true); }}
                className="flex items-center gap-1 text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl transition">
                <Edit3 size={12} /> Edit
              </button>
              <button onClick={handleLogout}
                className="flex items-center gap-1 text-xs bg-red-500/80 hover:bg-red-500 px-3 py-1.5 rounded-xl transition">
                <LogOut size={12} /> Logout
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap transition border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600 bg-blue-50/50"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* MY BATCHES */}
            {activeTab === "batches" && (
              <div>
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen size={18} className="text-blue-600" /> My Purchased Batches
                </h3>
                {batchesLoading ? (
                  <div className="space-y-3">
                    {[1,2].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
                  </div>
                ) : myBatches.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-3">📚</div>
                    <p className="text-gray-500 font-medium mb-4">No batches purchased yet</p>
                    <Link to="/batches"
                      className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition">
                      Browse Batches <ChevronRight size={16} />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myBatches.map((batch) => (
                      <Link key={batch._id} to={`/batches/${batch._id}`}
                        className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:shadow-md transition group">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <BookOpen className="text-white" size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{batch.name}</p>
                          <div className="flex gap-2 mt-1">
                            {batch.classId && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                Class {batch.classId.classNumber}
                              </span>
                            )}
                            {batch.streamId && (
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                                {batch.streamId.name}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-lg font-medium flex items-center gap-1">
                            <CheckCircle size={10} /> Active
                          </span>
                          <ChevronRight size={16} className="text-gray-400 group-hover:text-blue-600 transition" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* DOWNLOADS */}
            {activeTab === "downloads" && (
              <div>
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Download size={18} className="text-blue-600" /> My Downloads
                </h3>
                <div className="text-center py-12">
                  <div className="text-5xl mb-3">⬇️</div>
                  <p className="text-gray-500 mb-4">Access downloads from your purchased batches</p>
                  <Link to="/downloads"
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition">
                    View All Downloads <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            )}

            {/* ORDERS */}
            {activeTab === "orders" && (
              <div>
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ShoppingBag size={18} className="text-blue-600" /> Order History
                </h3>
                {ordersLoading ? (
                  <div className="space-y-3">
                    {[1,2].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
                  </div>
                ) : myBatches.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-3">🧾</div>
                    <p className="text-gray-500">No orders yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myBatches.map((batch) => (
                      <div key={batch._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <Package className="text-gray-400 flex-shrink-0" size={20} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate text-sm">{batch.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {batch.purchasedAt ? new Date(batch.purchasedAt).toLocaleDateString("en-IN") : "—"}
                          </p>
                        </div>
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-lg font-bold flex-shrink-0">
                          PAID · {formatPrice(batch.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PROFILE */}
            {activeTab === "profile" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <User size={18} className="text-blue-600" /> Profile Information
                  </h3>
                  {!editMode && (
                    <button onClick={() => setEditMode(true)}
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
                      <Edit3 size={14} /> Edit Profile
                    </button>
                  )}
                </div>

                {saveMsg && (
                  <div className={`p-3 rounded-xl mb-4 text-sm ${saveMsg.includes("updated") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                    {saveMsg}
                  </div>
                )}

                {editMode ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full border-2 border-gray-200 focus:border-blue-500 p-3 rounded-xl outline-none transition"
                        placeholder="Your name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="w-full border-2 border-gray-200 focus:border-blue-500 p-3 rounded-xl outline-none transition"
                        placeholder="10-digit number" />
                    </div>
                    <div className="flex gap-3">
                      <button onClick={handleSaveProfile} disabled={saving}
                        className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition">
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                      <button onClick={() => setEditMode(false)}
                        className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[
                      { icon: <User size={16} />, label: "Name", value: user?.name || "Not set" },
                      { icon: <Mail size={16} />, label: "Email", value: user?.email || "Not set" },
                      { icon: <Phone size={16} />, label: "Phone", value: user?.phone || "Not set" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                        <span className="text-gray-400">{item.icon}</span>
                        <div>
                          <p className="text-xs text-gray-400">{item.label}</p>
                          <p className="font-medium text-gray-900 text-sm">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-4">
          <Link to="/batches"
            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition flex items-center gap-3 group">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <BookOpen className="text-blue-600" size={18} />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Browse Batches</p>
              <p className="text-xs text-gray-400">Explore all</p>
            </div>
          </Link>
          <Link to="/downloads"
            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition flex items-center gap-3 group">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Download className="text-green-600" size={18} />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">My Downloads</p>
              <p className="text-xs text-gray-400">PDF files</p>
            </div>
          </Link>
        </div>

      </div>
    </div>
  );
}

export default Account;
