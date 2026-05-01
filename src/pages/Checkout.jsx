import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, ArrowLeft, Tag, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import API from "../services/api";

function Checkout() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { cartItems = [], clearCart, total = 0, removeFromCart } = useCart();
  const [processing, setProcessing] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [error, setError] = useState("");

  const formatPrice = (price = 0) => `₹${Number(price).toLocaleString("en-IN")}`;

  /* Load Razorpay SDK */
  useEffect(() => {
    if (window.Razorpay) { setSdkLoaded(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => setSdkLoaded(true);
    script.onerror = () => setError("Payment SDK failed to load. Please refresh.");
    document.body.appendChild(script);
  }, []);

  /* Auth + cart guard */
  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/login", { state: { from: "/checkout" } }); return; }
    if (!cartItems.length) { navigate("/cart"); }
  }, [user, cartItems, loading, navigate]);

  const handlePayment = async () => {
    setError("");
    if (!sdkLoaded) { setError("Payment system is loading. Please wait."); return; }
    const key = import.meta.env.VITE_RAZORPAY_KEY;
    if (!key) { setError("Payment not configured. Contact support."); return; }

    try {
      setProcessing(true);

      const orderRes = await API.post("/payment/create-order", {
        materials: cartItems.map((i) => i._id),
      });

      const order = orderRes.data;

      const options = {
        key,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "Rohit Academy",
        description: "Study Materials",
        order_id: order.orderId,
        image: "/favicon-96x96.png",
        handler: async (response) => {
          try {
            await API.post("/payment/verify-payment", {
              ...response,
              materials: cartItems.map((i) => i._id),
            });
            clearCart();
            navigate("/success?payment=success");
          } catch {
            setError("Payment verification failed. Contact support if amount was deducted.");
            setProcessing(false);
          }
        },
        modal: { ondismiss: () => setProcessing(false) },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: { color: "#2563eb" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (res) => {
        setError(res.error?.description || "Payment failed. Please try again.");
        setProcessing(false);
      });
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create order. Please try again.");
      setProcessing(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!cartItems.length) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-500 mb-4">Your cart is empty</p>
        <Link to="/batches" className="text-blue-600 hover:underline font-medium">Browse Batches</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm transition">
          <ArrowLeft size={16} /> Back
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Order Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Order Summary ({cartItems.length} item{cartItems.length !== 1 ? "s" : ""})</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {cartItems.map((item) => (
              <div key={item._id} className="flex items-center gap-4 px-6 py-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Tag className="text-blue-600" size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{item.title}</p>
                  {item.type && <p className="text-xs text-gray-400 mt-0.5">{item.type}</p>}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="font-bold text-blue-600">{formatPrice(item.price)}</span>
                  {removeFromCart && (
                    <button onClick={() => removeFromCart(item._id)}
                      className="text-gray-300 hover:text-red-400 transition">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
            <span className="font-semibold text-gray-700">Total</span>
            <span className="text-2xl font-extrabold text-blue-600">{formatPrice(total)}</span>
          </div>
        </div>

        {/* User Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <h2 className="font-semibold text-gray-900 mb-3 text-sm">Billing Details</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-400 text-xs mb-1">Name</p>
              <p className="font-medium text-gray-900">{user?.name || "—"}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">Contact</p>
              <p className="font-medium text-gray-900">{user?.email || user?.phone || "—"}</p>
            </div>
          </div>
        </div>

        {/* Pay Button */}
        <button
          onClick={handlePayment}
          disabled={processing || !sdkLoaded}
          className="w-full py-4 rounded-2xl text-white font-bold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg transition mb-4"
        >
          {processing ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing Payment...
            </span>
          ) : !sdkLoaded ? (
            "Loading Payment..."
          ) : (
            `Pay Securely · ${formatPrice(total)}`
          )}
        </button>

        <div className="flex items-center justify-center gap-2 text-green-600 text-sm font-medium">
          <ShieldCheck size={16} />
          100% Secure Payment via Razorpay
        </div>

      </div>
    </div>
  );
}

export default Checkout;
