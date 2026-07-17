"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/api/axios";
import { Heart, Zap, BatteryCharging, Cable, TimerReset, ArrowLeft, Sparkles } from "lucide-react";
import { useCartFav } from "@/context/CartFavContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Product {
  _id: string;
  name: string;
  price: number;
  category: "charging";
  sizes?: string[];
  imageUrl?: string;
}

const FEATURES = [
  { icon: Zap, label: "Fast Charging", desc: "Up to 100W rapid charging support" },
  { icon: BatteryCharging, label: "GaN Technology", desc: "Compact & efficient power delivery" },
  { icon: Cable, label: "Braided Cables", desc: "Durable nylon-braided design" },
  { icon: TimerReset, label: "Smart Protection", desc: "Overcharge & short-circuit safe" },
];

function SkeletonCard() {
  return (
    <div className="relative bg-white rounded-xl border border-amber-100 p-4 overflow-hidden shadow-sm">
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-amber-100/50 to-transparent" />
      <div className="h-48 sm:h-60 w-full bg-amber-100 rounded-lg mb-4" />
      <div className="h-4 bg-amber-100 rounded-full w-3/4 mx-auto mb-3" />
      <div className="h-8 bg-amber-100 rounded w-full mb-3" />
      <div className="h-4 bg-amber-100 rounded-full w-1/3 mx-auto mb-4" />
      <div className="h-9 bg-amber-100 rounded-md w-full" />
    </div>
  );
}

export default function ChargingPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [favourites, setFavourites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { bumpCart, bumpFav } = useCartFav();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("/api/admin/products?category=charging");
        setProducts(res.data.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const user = typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "null")
      : null;
    if (!user?._id) return;

    const fetchFavourites = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`/api/users/${user._id}/favourite`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setFavourites(res.data.favourites || []);
      } catch (error) {
        console.error("Failed to fetch favourites:", error);
      }
    };
    fetchFavourites();
  }, []);

  const toggleFavourite = async (productId: string) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user?._id) { toast.error("Please login first"); return; }
    try {
      await axios.post(`/api/users/${user._id}/favourite`, { productId });
      if (favourites.includes(productId)) {
        setFavourites(favourites.filter((id) => id !== productId));
        toast.success("Removed from favourites");
      } else {
        setFavourites([...favourites, productId]);
        toast.success("Added to favourites ❤️");
      }
      bumpFav();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!");
    }
  };

  const addToCart = async (productId: string) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user?._id) { toast.error("Please login first"); return; }
    try {
      await axios.post(`/api/users/${user._id}/cart`, { productId, quantity: 1 });
      toast.success("Added to cart 🛒");
      bumpCart();
    } catch (error) {
      console.error(error);
      toast.error("Failed to add to cart");
    }
  };

  const resolveImage = (product: Product) => {
    if (product.imageUrl) {
      if (product.imageUrl.startsWith("http")) return product.imageUrl;
      return `${process.env.NEXT_PUBLIC_API_URL}${product.imageUrl}`;
    }
    return null;
  };

  const heroImages = products.slice(0, 4).map(resolveImage);

  return (
    <section className="min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-purple-50/50">
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(245, 158, 11, 0.15); }
          50% { box-shadow: 0 0 40px rgba(245, 158, 11, 0.3); }
        }
        @keyframes lightning {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        .lightning-icon {
          animation: lightning 2s ease-in-out infinite;
        }
      `}</style>

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

      {/* ─── HERO SECTION ─── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-100/40 via-white to-purple-100/30" />
        <div className="absolute -top-32 -right-32 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-amber-200/30 to-amber-300/20 blur-[120px]" />
        <div className="absolute -bottom-32 -left-32 h-[350px] w-[350px] rounded-full bg-gradient-to-br from-purple-200/25 to-purple-300/15 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <button
            onClick={() => router.back()}
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-gray-600"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-100/80 border border-amber-200 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-600 mb-5">
                <Zap className="h-3.5 w-3.5 lightning-icon" />
                Power Up
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight">
                <span className="text-gray-900">Charging</span>
                <br />
                <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-purple-500 bg-clip-text text-transparent">
                  Accessories
                </span>
              </h1>
              <p className="mt-6 text-lg text-gray-400 max-w-lg leading-relaxed">
                Lightning-fast GaN chargers, durable braided cables, and wireless charging pads — power up your devices at blazing speed.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-4">
                {FEATURES.map((f) => (
                  <div key={f.label} className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                      <f.icon className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{f.label}</p>
                      <p className="text-xs text-gray-400">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute -inset-4 rounded-[32px] bg-gradient-to-br from-amber-200/40 to-purple-200/40 blur-xl" />
                <div className="relative grid grid-cols-2 gap-4">
                  <div className="space-y-4 pt-8">
                    <div className="h-36 w-36 overflow-hidden rounded-2xl shadow-lg border-2 border-amber-200/60 sm:h-44 sm:w-44">
                      {heroImages[0] ? (
                        <img src={heroImages[0]} alt={products[0]?.name || "Product"} className="h-full w-full object-cover transition duration-500 hover:scale-110" />
                      ) : (
                        <div className="h-full w-full bg-amber-100" />
                      )}
                    </div>
                    <div className="h-28 w-28 overflow-hidden rounded-2xl shadow-lg border-2 border-purple-200/60 sm:h-36 sm:w-36">
                      {heroImages[2] ? (
                        <img src={heroImages[2]} alt={products[2]?.name || "Product"} className="h-full w-full object-cover transition duration-500 hover:scale-110" />
                      ) : (
                        <div className="h-full w-full bg-purple-100" />
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-28 w-28 overflow-hidden rounded-2xl shadow-lg border-2 border-amber-200/60 sm:h-36 sm:w-36">
                      {heroImages[1] ? (
                        <img src={heroImages[1]} alt={products[1]?.name || "Product"} className="h-full w-full object-cover transition duration-500 hover:scale-110" />
                      ) : (
                        <div className="h-full w-full bg-amber-100" />
                      )}
                    </div>
                    <div className="h-36 w-36 overflow-hidden rounded-2xl shadow-lg border-2 border-purple-200/60 sm:h-44 sm:w-44">
                      {heroImages[3] ? (
                        <img src={heroImages[3]} alt={products[3]?.name || "Product"} className="h-full w-full object-cover transition duration-500 hover:scale-110" />
                      ) : (
                        <div className="h-full w-full bg-purple-100" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── PRODUCTS SECTION ─── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-100/80 border border-amber-200 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-600 mb-4">
              <Sparkles className="h-3 w-3" />
              Collection
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Power Gear</h2>
            <p className="text-gray-400 text-sm mt-1">Browse our charging accessories</p>
          </div>
          {!loading && products.length > 0 && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-sm text-amber-500 font-medium">
              <Zap className="h-3.5 w-3.5" />
              {products.length} product{products.length !== 1 ? "s" : ""} available
            </span>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 mb-2">
              <Zap className="w-10 h-10 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-gray-400">No charging products yet</p>
            <p className="text-gray-400 text-sm">Check back soon for new charging accessories.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {products.map((product, index) => {
              const imgSrc = resolveImage(product) || (products.length > 1 ? resolveImage(products[(index + 1) % products.length]) : null);
              const isFav = favourites.includes(product._id);

              return (
                <div
                  key={product._id}
                  className="relative group bg-white rounded-2xl border border-amber-100 p-4 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:shadow-amber-200/30"
                >
                  <button
                    onClick={() => toggleFavourite(product._id)}
                    className="absolute top-3 right-3 z-10 cursor-pointer"
                  >
                    <Heart className={`w-6 h-6 ${isFav ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-400"}`} />
                  </button>

                  <div className="relative mb-4">
                    <div className="h-48 sm:h-56 w-full overflow-hidden rounded-xl bg-amber-50">
                      {imgSrc ? (
                        <img
                          src={imgSrc}
                          alt={product.name}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full bg-amber-100 flex items-center justify-center">
                          <Zap className="w-8 h-8 text-amber-300" />
                        </div>
                      )}
                      <div className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-amber-500/90 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-lg backdrop-blur-sm">
                        <Zap className="h-3 w-3 fill-white" />
                        POWER
                      </div>
                    </div>
                  </div>

                  <p className="font-semibold text-center text-gray-900">{product.name}</p>
                  <p className="text-center mt-2 font-bold text-amber-600">Rs. {product.price}</p>

                  <button
                    onClick={() => addToCart(product._id)}
                    className="mt-4 w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-2.5 rounded-full text-sm font-semibold transition-all duration-200 shadow-lg shadow-amber-500/25 hover:shadow-amber-600/30 cursor-pointer"
                  >
                    Add to Cart
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
