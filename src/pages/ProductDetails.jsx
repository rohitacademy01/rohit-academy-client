import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingCart, ArrowLeft, ShieldCheck } from "lucide-react";
import Loader from "../components/ui/Loader";
import ProductPreview from "../components/product/ProductPreview";
import RatingStars from "../components/product/RatingStars";
import { useCart } from "../context/CartContext";
import API from "../services/api";

function ProductDetails() {

  const { id } = useParams();
  const navigate = useNavigate();

  const { addToCart, cartItems = [] } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  /* =====================================
     📦 FETCH PRODUCT
  ===================================== */
  useEffect(() => {

    let isMounted = true;

    const fetchProduct = async () => {
      try {

        setLoading(true);
        setError("");

        const res = await API.get(`/materials/${id}`);

        if (!isMounted) return;

        const data = res.data?.data || null;

        setProduct(data);

      } catch (err) {

        if (!isMounted) return;

        console.error("Product fetch error:", err);
        setError("Failed to load product");
        setProduct(null);

      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (id) fetchProduct();

    return () => {
      isMounted = false;
    };

  }, [id]);

  /* =====================================
     🛒 CHECK IN CART (SAFE)
  ===================================== */
  const isInCart = useMemo(() => {
    return cartItems.some(item => item?._id === product?._id);
  }, [cartItems, product]);

  /* =====================================
     🛒 ADD TO CART
  ===================================== */
  const handleAddToCart = async () => {

    if (!product) return;

    /* 👉 already in cart → direct go */
    if (isInCart) {
      navigate("/cart");
      return;
    }

    if (adding) return;

    try {

      setAdding(true);

      addToCart({
        _id: product._id,
        title: product.title,
        price: product.price || 0,
        thumbnail: product.thumbnail || "",
        previewImages: product.previewImages || [],
        type: product.type || ""
      });

      /* 👉 smooth redirect */
      setTimeout(() => {
        navigate("/cart");
      }, 300);

    } catch (err) {
      console.error("Cart error:", err);
    } finally {
      setAdding(false);
    }
  };

  /* =====================================
     ⏳ LOADING
  ===================================== */
  if (loading) return <Loader />;

  /* =====================================
     ❌ ERROR
  ===================================== */
  if (error) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-red-600 mb-3">
          {error}
        </h2>

        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  /* =====================================
     ❌ NOT FOUND
  ===================================== */
  if (!product) {
    return (
      <div className="text-center py-20">

        <h2 className="text-2xl font-bold mb-4">
          Product not found
        </h2>

        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <ArrowLeft size={16} /> Go Back
        </button>

      </div>
    );
  }

  /* =====================================
     💰 FORMAT PRICE
  ===================================== */
  const formatPrice = (price = 0) =>
    `₹${Number(price).toLocaleString("en-IN")}`;

  return (

    <div className="grid md:grid-cols-2 gap-10 items-start">

      {/* LEFT */}
      <div className="bg-white p-6 rounded-xl shadow">

        <ProductPreview
          previews={product.previewImages || []}
          title={product.title}
        />

      </div>

      {/* RIGHT */}
      <div className="bg-white p-8 rounded-xl shadow">

        <h1 className="text-3xl font-bold mb-1">
          {product.title}
        </h1>

        <RatingStars
          rating={product.rating || 4.5}
          reviews={product.reviewsCount || 0}
        />

        <p className="text-gray-600 my-4 leading-relaxed">
          {product.description || "No description available"}
        </p>

        {/* DETAILS */}
        <div className="space-y-2 text-sm text-gray-600 mb-6">

          <p>📄 Pages: <strong>{product.pages || 0}</strong></p>

          <p>
            📘 Type:{" "}
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">
              {product.type}
            </span>
          </p>

          <p className="flex items-center gap-2 text-green-600 font-medium">
            <ShieldCheck size={16} /> Instant & Secure Download
          </p>

        </div>

        {/* PRICE */}
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-6">
          <p className="text-sm text-gray-500">Price</p>
          <p className="text-3xl font-bold text-blue-600">
            {formatPrice(product.price)}
          </p>
        </div>

        {/* BUTTON */}
        <button
          onClick={handleAddToCart}
          disabled={adding}
          className="w-full bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition disabled:opacity-60 font-semibold"
        >
          <ShoppingCart size={18} />

          {adding
            ? "Adding..."
            : isInCart
            ? "Go to Cart"
            : "Add to Cart"}
        </button>

      </div>

    </div>

  );

}

export default ProductDetails;