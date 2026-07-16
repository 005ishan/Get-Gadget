"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "@/lib/api/axios";
import { Heart } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import { useCartFav } from "@/context/CartFavContext";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";

interface Product {
  _id: string;
  name: string;
  price: number;
  category: "audio" | "accessories" | "charging";
  sizes?: string[];
  imageUrl?: string;
}

const VALID_CATEGORIES = ["audio", "accessories", "charging"] as const;

const CATEGORY_META: Record<string, { title: string; description: string }> = {
  audio: { title: "Audio", description: "Premium headphones, earbuds, and speakers" },
  accessories: { title: "Accessories", description: "Cases, screen protectors, and more" },
  charging: { title: "Charging", description: "Fast chargers, cables, and power banks" },
};



function SkeletonCard() {
  return (
    <div className="relative bg-white rounded-xl border border-gray-100 p-4 overflow-hidden shadow-sm">
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-gray-100/50 to-transparent" />
      <div className="h-48 sm:h-60 w-full bg-gray-200 rounded-lg mb-4" />
      <div className="h-4 bg-gray-200 rounded-full w-3/4 mx-auto mb-3" />
      <div className="h-8 bg-gray-200 rounded w-full mb-3" />
      <div className="h-4 bg-gray-200 rounded-full w-1/3 mx-auto mb-4" />
      <div className="h-9 bg-gray-200 rounded-md w-full" />
    </div>
  );
}

export default function CategoryPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const isValid = VALID_CATEGORIES.includes(slug as any);
  const meta = CATEGORY_META[slug] || { title: slug?.charAt(0).toUpperCase() + slug?.slice(1), description: "Browse products" };

  const [products, setProducts] = useState<Product[]>([]);
  const [favourites, setFavourites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { bumpCart, bumpFav } = useCartFav();

  useEffect(() => {
    if (!slug || !isValid) {
      setLoading(false);
      return;
    }

    const fetchProducts = async () => {
      try {
        const res = await axios.get(`/api/admin/products?category=${slug}`);
        setProducts(res.data.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [slug, isValid]);

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

  // Handle invalid category slugs
  if (!isValid) {
    return (
      <section className="bg-gray-50/50 min-h-screen text-gray-900 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center py-32">
          <h1 className="text-4xl font-bold text-gray-400 mb-4">Category not found</h1>
          <p className="text-gray-400 mb-8">The category you&apos;re looking for doesn&apos;t exist.</p>
          <Link
            href="/auth/dashboard"
            className="rounded-full bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-600"
          >
            Back to Dashboard
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-50/50 min-h-screen text-gray-900 py-14">
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
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

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold">{meta.title}</h1>
            {loading && (
              <span className="flex items-center gap-2 text-sm text-blue-500 font-medium">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse inline-block" />
                Loading products...
              </span>
            )}
          </div>
          <p className="text-gray-400 mt-1">{meta.description}</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100/60 mb-2">
              <span className="text-3xl">📦</span>
            </div>
            <p className="text-2xl font-bold text-gray-400">No products found</p>
            <p className="text-gray-400 text-sm">Check back soon for new arrivals in {meta.title.toLowerCase()}.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {products.map((product, index) => {
              const imgSrc = product.imageUrl
                ? (product.imageUrl.startsWith("http")
                  ? product.imageUrl
                  : `${process.env.NEXT_PUBLIC_API_URL}${product.imageUrl}`)
                : null;

              const isFav = favourites.includes(product._id);

              return (
                <div
                  key={product._id}
                  className="relative bg-white rounded-xl border border-gray-100 p-4 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:shadow-blue-200/20"
                >
                  <button onClick={() => toggleFavourite(product._id)} className="absolute top-3 right-3 cursor-pointer">
                    <Heart className={`w-6 h-6 ${isFav ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-400"}`} />
                  </button>

                  {imgSrc ? (
                    <img src={imgSrc} alt={product.name} className="h-48 sm:h-60 w-full object-cover rounded-lg" />
                  ) : (
                    <div className="h-48 sm:h-60 w-full bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-3xl">📦</span>
                    </div>
                  )}

                  <p className="mt-4 font-semibold text-center text-gray-900">{product.name}</p>

                  <p className="text-center mt-3 font-bold text-blue-500">Rs. {product.price}</p>

                  <button
                    onClick={() => addToCart(product._id)}
                    className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-full text-sm font-semibold transition shadow-lg shadow-blue-500/20 cursor-pointer"
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
