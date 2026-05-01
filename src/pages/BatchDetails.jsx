import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  BookOpen, Download, ShieldCheck, CheckCircle, ArrowLeft,
  Lock, FileText, ChevronRight
} from "lucide-react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

function BatchDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBatch = async () => {
      try {
        const res = await API.get(`/batches/${id}`);
        setBatch(res.data?.batch);
      } catch {
        setError("Batch not found");
      } finally {
        setLoading(false);
      }
    };
    fetchBatch();
  }, [id]);

  useEffect(() => {
    if (!user || !batch) return;
    const checkAccess = async () => {
      try {
        const res = await API.get(`/batches/${id}/access`);
        setHasAccess(res.data?.hasAccess);
        if (res.data?.hasAccess) {
          const mRes = await API.get(`/batches/${id}/materials`);
          setMaterials(mRes.data?.materials || []);
        }
      } catch {}
    };
    checkAccess();
  }, [user, batch, id]);

  useEffect(() => {
    if (window.Razorpay) { setSdkLoaded(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => setSdkLoaded(true);
    document.body.appendChild(script);
  }, []);

  const handleBuy = async () => {
    if (!user) { navigate("/login", { state: { from: `/batches/${id}` } }); return; }
    if (!sdkLoaded) { alert("Payment loading..."); return; }
    const key = import.meta.env.VITE_RAZORPAY_KEY;
    if (!key) { alert("Payment not configured"); return; }

    try {
      setProcessing(true);
      const res = await API.post("/payment/create-batch-order", { batchId: id });
      const { orderId, amount, currency } = res.data;

      const options = {
        key,
        amount,
        currency,
        name: "Rohit Academy",
        description: batch.name,
        order_id: orderId,
        image: "/favicon.ico",
        handler: async (response) => {
          try {
            await API.post("/payment/verify-batch-payment", {
              ...response,
              dbOrderId: res.data.dbOrderId,
            });
            setHasAccess(true);
            const mRes = await API.get(`/batches/${id}/materials`);
            setMaterials(mRes.data?.materials || []);
            navigate("/success?payment=success");
          } catch {
            alert("Payment verification failed. Contact support.");
          }
        },
        modal: { ondismiss: () => setProcessing(false) },
        prefill: { name: user.name || "", email: user.email || "", contact: user.phone || "" },
        theme: { color: "#2563eb" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => { alert("Payment failed. Please try again."); setProcessing(false); });
      rzp.open();
    } catch (err) {
      alert(err.response?.data?.message || "Order creation failed");
      setProcessing(false);
    }
  };

  const formatPrice = (p) => `₹${Number(p).toLocaleString("en-IN")}`;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error || !batch) return (
    <div className="text-center py-20">
      <p className="text-xl text-gray-500 mb-4">{error || "Batch not found"}</p>
      <Link to="/batches" className="text-blue-600 hover:underline">← Back to Batches</Link>
    </div>
  );

  const disc = batch.originalPrice && batch.originalPrice > batch.price
    ? Math.round(((batch.originalPrice - batch.price) / batch.originalPrice) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition">
        <ArrowLeft size={18} /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Thumbnail */}
          <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 h-64">
            {batch.thumbnail ? (
              <img src={batch.thumbnail} alt={batch.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="text-blue-400" size={64} />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex gap-2 mb-3 flex-wrap">
              {batch.classId && (
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  Class {batch.classId.classNumber || batch.classId.name}
                </span>
              )}
              {batch.streamId && (
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                  {batch.streamId.name}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">{batch.name}</h1>
            {batch.description && <p className="text-gray-600 leading-relaxed">{batch.description}</p>}
          </div>

          {/* Subjects */}
          {batch.subjects?.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">📚 Subjects Included</h2>

              {hasAccess ? (
                /* ---- PURCHASED: Clickable subject cards linking to SubjectPDFs ---- */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {batch.subjects.map((sub) => (
                    <Link
                      key={sub._id}
                      to={`/subject-pdfs/${sub._id}?batchId=${id}&subject=${encodeURIComponent(sub.name)}&batch=${encodeURIComponent(batch.name)}`}
                      className="flex items-center justify-between gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 hover:shadow-md hover:border-blue-300 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition">
                          <FileText size={16} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 capitalize text-sm">{sub.name}</p>
                          <p className="text-xs text-blue-500 mt-0.5">View Study Materials →</p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-gray-400 group-hover:text-blue-500 transition" />
                    </Link>
                  ))}
                </div>
              ) : (
                /* ---- NOT PURCHASED: Static list ---- */
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {batch.subjects.map((sub) => (
                    <div key={sub._id} className="flex items-center gap-2 bg-green-50 rounded-xl p-3">
                      <CheckCircle className="text-green-500 flex-shrink-0" size={16} />
                      <span className="text-sm font-medium text-gray-700 capitalize">{sub.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {hasAccess && (
                <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                  <CheckCircle size={12} className="text-green-500" />
                  Click any subject to view its Notes, PYQs, Sample Papers & Assignments
                </p>
              )}
            </div>
          )}

          {/* Materials (if purchased) - legacy download list */}
          {hasAccess && materials.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">📄 All Materials ({materials.length})</h2>
              <div className="space-y-3">
                {materials.map((mat) => (
                  <div key={mat._id}
                    className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{mat.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{mat.subjectId?.name} · {mat.type}</p>
                    </div>
                    <a href={mat.fileUrl} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
                      <Download size={14} /> Download
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Purchase Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sticky top-6">
            {hasAccess ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="text-green-500" size={32} />
                </div>
                <h3 className="text-xl font-bold text-green-700 mb-2">Batch Unlocked!</h3>
                <p className="text-gray-500 text-sm mb-4">
                  Click on any subject above to access its study materials.
                </p>
                <Link to="/downloads"
                  className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition">
                  <Download size={18} /> Go to Downloads
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-blue-600">{formatPrice(batch.price)}</span>
                    {disc > 0 && (
                      <span className="text-lg text-gray-400 line-through">{formatPrice(batch.originalPrice)}</span>
                    )}
                  </div>
                  {disc > 0 && (
                    <span className="inline-block mt-1 bg-red-100 text-red-600 text-sm px-2 py-0.5 rounded-full font-medium">
                      {disc}% savings
                    </span>
                  )}
                </div>

                <ul className="space-y-3 mb-6">
                  {[
                    `${batch.subjects?.length || 0} subjects included`,
                    "Notes, PYQs, Sample Papers & Assignments",
                    "Lifetime access",
                    "Instant download",
                    "Class " + (batch.classId?.classNumber || "") + (batch.streamId ? " · " + batch.streamId.name : ""),
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="text-green-500 flex-shrink-0" size={16} />
                      {item}
                    </li>
                  ))}
                </ul>

                <button onClick={handleBuy} disabled={processing}
                  className="w-full py-4 rounded-2xl text-white font-bold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 shadow-lg transition mb-3">
                  {processing ? "Processing..." : `Buy Now · ${formatPrice(batch.price)}`}
                </button>

                <div className="flex items-center justify-center gap-2 text-green-600 text-xs">
                  <ShieldCheck size={14} />
                  <span>100% Secure · Razorpay</span>
                </div>

                {!user && (
                  <p className="text-center text-xs text-gray-400 mt-3">
                    <Link to="/login" className="text-blue-600 hover:underline">Login</Link> to purchase
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BatchDetails;
