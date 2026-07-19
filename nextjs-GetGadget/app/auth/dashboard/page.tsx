"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Package, Star } from "lucide-react";
import axios from "@/lib/api/axios";

interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  imageUrl?: string;
  description?: string;
}

function getApiUrl() {
  return (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050").replace(/\/+$/, "");
}

function resolveImage(product: Product) {
  if (product.imageUrl) {
    if (product.imageUrl.startsWith("http")) return product.imageUrl;
    return `${getApiUrl()}${product.imageUrl}`;
  }
  return null;
}

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/admin/products")
      .then((res) => setProducts(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const featured = products.slice(0, 3);

  return (
    <section className="bg-gray-50/50 text-gray-900">
      {/* HERO */}
      <div className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 via-white to-cyan-100/30" />
        <div className="absolute -top-40 -left-32 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-blue-200/20 to-cyan-200/20 blur-[180px]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative">
          <div>
            <h1 className="mb-5 text-2xl font-extrabold uppercase tracking-wide text-blue-500 md:text-2xl lg:text-2xl">
              New Season Collection
            </h1>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight text-gray-900">
              Keep Calm <br />
              <span className="text-blue-500">And Love Tech.</span>
            </h1>
            <p className="mt-6 text-lg text-gray-400 max-w-md leading-relaxed">
              Discover premium gadget accessories — audio, charging, cases, and more for your
              everyday tech.
            </p>
            <div className="mt-8 flex gap-4 flex-wrap">
              <Link
                href="/auth/category/audio"
                className="px-8 py-3.5 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-semibold transition-all shadow-lg shadow-blue-500/25 hover:scale-105"
              >
                Shop Audio
              </Link>
              <Link
                href="/auth/category/accessories"
                className="px-8 py-3.5 border border-gray-200 hover:border-blue-300 text-gray-600 hover:text-blue-500 rounded-full font-semibold transition-all"
              >
                Shop Accessories
              </Link>
              <Link
                href="/auth/category/charging"
                className="px-8 py-3.5 border border-amber-200 hover:border-amber-400 text-amber-600 hover:text-amber-700 hover:bg-amber-50/50 rounded-full font-semibold transition-all"
              >
                Shop Charging
              </Link>
            </div>
          </div>

          <div className="flex justify-center">
            {loading ? (
              <div className="h-48 w-[300px] sm:w-[400px] rounded-[32px] bg-gray-100 animate-pulse" />
            ) : (
              <div className="relative rounded-[32px] border border-blue-100 bg-white/60 p-6 shadow-xl shadow-blue-200/20 backdrop-blur-xl">
                <div className="flex gap-4">
                  {featured.length > 0 ? (
                    featured.slice(0, 2).map((p) => {
                      const img = resolveImage(p);
                      return (
                        <Link
                          key={p._id}
                          href={`/auth/product/${p._id}`}
                          className="h-48 w-[140px] sm:w-[180px] overflow-hidden rounded-2xl shadow-md transition duration-500 hover:-translate-y-2"
                        >
                          {img ? (
                            <img src={img} alt={p.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-blue-100">
                              <Package className="h-8 w-8 text-blue-300" />
                            </div>
                          )}
                        </Link>
                      );
                    })
                  ) : (
                    <div className="flex h-48 w-[300px] items-center justify-center rounded-2xl bg-blue-50">
                      <p className="text-sm text-gray-400">Featured products appear here</p>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-gray-400">Click a product to view details</p>
                  <span className="flex items-center gap-1 text-xs font-medium text-blue-500">
                    {products.length} items <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FEATURED PRODUCTS */}
      <div className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="mb-5 text-2xl font-extrabold uppercase tracking-wider text-blue-500 md:text-2xl">
              Top Picks
            </h1>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-5xl">
              Featured Products
            </h2>
          </div>
          {loading ? (
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
                  <div className="mx-auto mb-5 h-48 w-48 rounded-2xl bg-gray-100 animate-pulse" />
                </div>
              ))}
            </div>
          ) : featured.length === 0 ? (
            <p className="text-center text-gray-400 py-16">No products yet. Check back soon!</p>
          ) : (
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((item) => {
                const img = resolveImage(item);
                return (
                  <Link
                    key={item._id}
                    href={`/auth/product/${item._id}`}
                    className="group relative overflow-hidden rounded-3xl shadow-sm transition-all hover:shadow-xl hover:-translate-y-2"
                  >
                    <div className="aspect-square overflow-hidden">
                      {img ? (
                        <img
                          src={img}
                          alt={item.name}
                          className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-blue-50">
                          <Package className="h-16 w-16 text-blue-300" />
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/80 px-3 py-1 text-xs font-semibold text-white mb-2">
                        <Star className="h-3 w-3 fill-white" />
                        Featured
                      </div>
                      <h3 className="text-2xl font-bold text-white">{item.name}</h3>
                      <p className="text-sm text-white/80 mt-1">Rs {item.price}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* FEATURED CATEGORIES */}
      <div className="py-20 px-6 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="mb-5 text-2xl font-extrabold uppercase tracking-wider text-blue-500 md:text-2xl">
              Browse by Category
            </h1>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-5xl">
              Explore Categories
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {["Audio", "Charging", "Accessories"].map((cat) => {
              const catProduct = products.find(
                (p) => p.category?.toLowerCase() === cat.toLowerCase(),
              );
              const img = catProduct ? resolveImage(catProduct) : null;
              const count = products.filter(
                (p) => p.category?.toLowerCase() === cat.toLowerCase(),
              ).length;
              const colorMap: Record<string, string> = {
                Audio: "from-blue-500/30",
                Charging: "from-amber-500/30",
                Accessories: "from-cyan-500/30",
              };
              return (
                <Link
                  key={cat}
                  href={`/auth/category/${cat.toLowerCase()}`}
                  className="group relative overflow-hidden rounded-3xl shadow-sm transition-all hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="aspect-[16/9] overflow-hidden">
                    {img ? (
                      <img
                        src={img}
                        alt={cat}
                        className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-blue-50">
                        <Package className="h-12 w-12 text-blue-300" />
                      </div>
                    )}
                  </div>
                  <div
                    className={`absolute inset-0 bg-gradient-to-t ${colorMap[cat]} via-black/20 to-transparent`}
                  />
                  <div className="absolute bottom-6 left-6">
                    <p className="text-xs text-white/70 font-medium mb-1 uppercase tracking-wider">
                      {count} items
                    </p>
                    <h3 className="text-3xl font-bold text-white">{cat}</h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* TRUST FEATURES */}
      <div className="border-y border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 divide-x divide-gray-100 md:grid-cols-3">
            {[
              { title: "Easy Shopping", desc: "Simple and fast gadget buying." },
              { title: "Fast Delivery", desc: "Get gadgets delivered quickly." },
              { title: "Premium Quality", desc: "Best quality accessories." },
            ].map((f) => (
              <div key={f.title} className="flex items-center gap-4 px-6 py-8">
                <div>
                  <p className="text-sm font-bold text-gray-900">{f.title}</p>
                  <p className="text-xs text-gray-400">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
