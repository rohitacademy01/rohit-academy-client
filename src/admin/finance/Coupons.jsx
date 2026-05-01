import React, { useState } from "react";
import { PlusCircle, Ticket, Calendar, Trash2 } from "lucide-react";

function Coupons() {

  const [coupons, setCoupons] = useState([
    {
      code: "WELCOME10",
      discount: 10,
      expiry: "2026-03-30"
    },
    {
      code: "EXAM50",
      discount: 50,
      expiry: "2026-02-10"
    }
  ]);

  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discount: "",
    expiry: ""
  });

  const [error, setError] = useState("");

  /* =========================
     🧠 FORMAT DATE
  ========================= */
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  /* =========================
     ⏳ CHECK EXPIRED
  ========================= */
  const isExpired = (date) => {
    return new Date(date) < new Date();
  };

  /* =========================
     ✏️ HANDLE INPUT
  ========================= */
  const handleChange = (e) => {

    let { name, value } = e.target;

    if (name === "code") {
      value = value.toUpperCase().replace(/\s/g, "");
    }

    setNewCoupon((prev) => ({
      ...prev,
      [name]: value
    }));

    setError("");
  };

  /* =========================
     ➕ ADD COUPON
  ========================= */
  const addCoupon = (e) => {
    e.preventDefault();

    const { code, discount, expiry } = newCoupon;

    // 🔒 validation
    if (!code || !discount || !expiry) {
      setError("All fields required");
      return;
    }

    if (discount <= 0 || discount > 90) {
      setError("Discount must be between 1% - 90%");
      return;
    }

    if (new Date(expiry) < new Date()) {
      setError("Expiry must be future date");
      return;
    }

    const exists = coupons.find((c) => c.code === code);

    if (exists) {
      setError("Coupon already exists");
      return;
    }

    setCoupons((prev) => [
      ...prev,
      { code, discount: Number(discount), expiry }
    ]);

    setNewCoupon({ code: "", discount: "", expiry: "" });
  };

  /* =========================
     ❌ DELETE
  ========================= */
  const deleteCoupon = (code) => {
    setCoupons((prev) => prev.filter((c) => c.code !== code));
  };

  return (

    <div className="p-4 md:p-6">

      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        Coupon Management
      </h1>

      {/* ================= FORM ================= */}
      <div className="bg-white p-5 rounded-xl shadow mb-8">

        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <PlusCircle size={20} /> Create New Coupon
        </h2>

        {error && (
          <p className="text-red-500 text-sm mb-3">
            {error}
          </p>
        )}

        <form onSubmit={addCoupon} className="grid md:grid-cols-4 gap-4">

          <input
            type="text"
            name="code"
            placeholder="Coupon Code"
            value={newCoupon.code}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          />

          <input
            type="number"
            name="discount"
            placeholder="Discount %"
            value={newCoupon.discount}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          />

          <input
            type="date"
            name="expiry"
            value={newCoupon.expiry}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          />

          <button className="bg-blue-600 text-white rounded-lg p-3 hover:bg-blue-700 transition">
            Add Coupon
          </button>

        </form>

      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white rounded-xl shadow overflow-hidden">

        {coupons.length === 0 ? (
          <p className="text-center py-6 text-gray-500">
            No coupons created yet
          </p>
        ) : (

          <table className="w-full text-left">

            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="p-3">Code</th>
                <th className="p-3">Discount</th>
                <th className="p-3">Expiry</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {coupons.map((coupon) => {

                const expired = isExpired(coupon.expiry);

                return (
                  <tr
                    key={coupon.code}
                    className="border-b hover:bg-gray-50"
                  >

                    <td className="p-3 flex items-center gap-2">
                      <Ticket size={18} className="text-purple-600" />
                      {coupon.code}
                    </td>

                    <td className="p-3 font-semibold text-green-600">
                      {coupon.discount}% OFF
                    </td>

                    <td className="p-3 flex items-center gap-2 text-gray-600">
                      <Calendar size={16} />
                      {formatDate(coupon.expiry)}
                    </td>

                    <td className="p-3">
                      {expired ? (
                        <span className="text-red-500 font-semibold">
                          Expired
                        </span>
                      ) : (
                        <span className="text-green-600 font-semibold">
                          Active
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() => deleteCoupon(coupon.code)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>

                  </tr>
                );

              })}
            </tbody>

          </table>

        )}

      </div>

    </div>

  );
}

export default Coupons;