"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/api/axios";
import { useParams, useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import { useCartFav } from "@/context/CartFavContext";
import "react-toastify/dist/ReactToastify.css";
import {
  ShoppingCart,
  Heart,
  ChevronLeft,
  Minus,
  Plus,
  Star,
  Shield,
  Truck,
  Zap,
  Package,
} from "lucide-react";

interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  imageUrl?: string;
  description?: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isFavourite, setIsFavourite] = useState(false);
  const { bumpCart, bumpFav } = useCartFav();

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/admin/products/${productId}`);
        setProduct(res.data.data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // Fetch initial favourite state
  useEffect(() => {
    if (!product?._id) return;
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;
    const user = JSON.parse(storedUser);
    axios.get(`/api/users/${user._id}/favourite`)
      .then(res => {
        const favs = res.data.favourites || res.data.data || [];
        if (favs.some((f: any) => (f._id || f.product?._id || f) === product._id)) {
          setIsFavourite(true);
        }
      })
      .catch(() => {});
  }, [product?._id]);

  const addToCart = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        toast.error("Please login first");
        return;
      }

      const user = JSON.parse(storedUser);
      if (!product?._id) {
        toast.error("Product not loaded");
        return;
      }

      const token = localStorage.getItem("token");
      setAddingToCart(true);

      await axios.post(
        `/api/users/${user._id}/cart`,
        { productId: product._id, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Added ${quantity} item${quantity > 1 ? "s" : ""} to cart 🛒`);
      bumpCart();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Add to cart failed");
    } finally {
      setAddingToCart(false);
    }
  };

  const toggleFavourite = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        toast.error("Please login first");
        return;
      }

      const user = JSON.parse(storedUser);
      if (!product?._id) return;

      const token = localStorage.getItem("token");
      await axios.post(
        `/api/users/${user._id}/favourite`,
        { productId: product._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIsFavourite(!isFavourite);
      toast.success(isFavourite ? "Removed from favourites" : "Added to favourites ❤️");
      bumpFav();
    } catch {
      toast.error("Something went wrong");
    }
  };

  const getImageUrl = (imageUrl?: string) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith("http")) return imageUrl;
    const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
    return `${base}${imageUrl}`;
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="aspect-square w-full rounded-2xl bg-gray-200 animate-pulse" />
            <div className="space-y-6">
              <div className="h-8 w-3/4 rounded-full bg-gray-200 animate-pulse" />
              <div className="h-6 w-1/4 rounded-full bg-gray-200 animate-pulse" />
              <div className="h-4 w-full rounded-full bg-gray-200 animate-pulse" />
              <div className="h-4 w-5/6 rounded-full bg-gray-200 animate-pulse" />
              <div className="h-4 w-2/3 rounded-full bg-gray-200 animate-pulse" />
              <div className="h-12 w-full rounded-xl bg-gray-200 animate-pulse mt-8" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto h-16 w-16 text-gray-300" />
          <h2 className="mt-4 text-xl font-bold text-gray-900">Product not found</h2>
          <p className="mt-2 text-sm text-gray-500">The product you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <button
            onClick={() => router.back()}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-600"
          >
            <ChevronLeft className="h-4 w-4" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  const imageUrl = getImageUrl(product.imageUrl);
  const totalPrice = product.price * quantity;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
        toastStyle={{
          borderRadius: "12px",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
        }}
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <button
          onClick={() => router.back()}
          className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-blue-500 transition"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Image */}
          <div className="relative">
            <div className="sticky top-24">
              <div className="group relative overflow-hidden rounded-3xl bg-white shadow-xl shadow-blue-500/5 transition-shadow hover:shadow-2xl hover:shadow-blue-500/10">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover"
                    style={{ maxHeight: "500px" }}
                  />
                ) : (
                  <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                    <Package className="h-20 w-20 text-gray-300" />
                  </div>
                )}
                {imageUrl && (
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-semibold text-gray-700 shadow-sm">
                      Featured
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-gray-200/50" />
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col gap-6">
            <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-blue-100/60 px-3 py-1.5 text-xs font-semibold text-blue-500">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              {product.category}
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              {product.name}
            </h1>

            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-sm text-gray-400">(24 reviews)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-600 font-medium border border-green-100">Verified</span>
            </div>

            <div className="flex items-baseline gap-3 bg-blue-50/50 p-4 rounded-2xl">
              <span className="text-4xl font-bold text-gray-900">Rs {product.price}</span>
              <span className="text-sm text-gray-400 line-through">Rs {Math.round(product.price * 1.25)}</span>
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">20% OFF</span>
            </div>

            <div className="border-t border-gray-100" />

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                Description
              </h3>
              <p className="mt-3 leading-relaxed text-gray-600">
                {product.description || "Premium quality gadget accessory designed to enhance your tech experience. Crafted with precision and built to last."}
              </p>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
                Quantity
              </h3>
              <div className="flex w-fit items-center gap-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="flex h-10 w-10 items-center justify-center text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-500 disabled:opacity-30"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="flex h-10 w-14 items-center justify-center border-x border-gray-200 text-sm font-semibold text-gray-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  disabled={quantity >= 10}
                  className="flex h-10 w-10 items-center justify-center text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-500 disabled:opacity-30"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Total</span>
                <span className="text-2xl font-bold text-blue-500">Rs {totalPrice}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={addToCart}
                disabled={addingToCart}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-blue-500 hover:bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition disabled:opacity-60"
              >
                {addingToCart ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Adding...
                  </span>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart — Rs {totalPrice}
                  </>
                )}
              </button>
              <button
                onClick={toggleFavourite}
                className={`flex h-12 w-12 items-center justify-center rounded-lg border-2 transition-all shadow-sm cursor-pointer ${
                  isFavourite 
                    ? "border-red-200 bg-red-50 text-red-500" 
                    : "border-gray-200 bg-white text-gray-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                }`}
              >
                <Heart className={`h-5 w-5 ${isFavourite ? "fill-red-500" : ""}`} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              {[
                { icon: Truck, label: "Free Shipping", sub: "Orders over Rs 1,000" },
                { icon: Shield, label: "2 Year Warranty", sub: "On all items" },
                { icon: Zap, label: "Fast Delivery", sub: "2-3 business days" },
              ].map((f) => (
                <div key={f.label} className="text-center group">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100/60">
                    <f.icon className="h-4 w-4 text-blue-500" />
                  </div>
                  <p className="text-xs font-semibold text-gray-900">{f.label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{f.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-20">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">You May Also Like</h2>
            <p className="mt-1 text-sm text-gray-400">Discover more premium gadget accessories</p>
          </div>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {[
              { name: "Bluetooth Earbuds Pro", price: "Rs 2,499", key: "earbuds" },
              { name: "Fast Charging USB-C Cable", price: "Rs 499", key: "cable" },
              { name: "100W GaN Charger", price: "Rs 2,999", key: "charger" },
              { name: "Wireless Charging Pad", price: "Rs 1,299", key: "pad" },
            ].map((item) => (
              <div
                key={item.key}
                className="group cursor-pointer rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:shadow-blue-200/20"
              >
                <div className="mb-3 h-32 w-full overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 sm:h-40 flex items-center justify-center">
                  <Package className="h-12 w-12 text-gray-200 group-hover:scale-110 group-hover:text-blue-300 transition-all duration-300" />
                </div>
                <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                <p className="mt-1 text-sm font-bold text-blue-500">{item.price}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}