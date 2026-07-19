"use client";

import { useEffect, useState } from "react";
import { X, ArrowRight, Star, Shield, Zap, Truck, Package } from "lucide-react";
import axios from "@/lib/api/axios";

interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  imageUrl?: string;
  description?: string;
}

const trustFeatures = [
  { icon: Truck, label: "Free Shipping", desc: "On orders over Rs 1,000" },
  { icon: Shield, label: "2 Year Warranty", desc: "On all premium products" },
  { icon: Zap, label: "Fast Delivery", desc: "2-3 business days" },
  { icon: Star, label: "Premium Quality", desc: "100% satisfaction guaranteed" },
];

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

function countByCategory(products: Product[], cat: string) {
  return products.filter((p) => p.category?.toLowerCase() === cat.toLowerCase()).length;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<string | null>(null);
  const [selected, setSelected] = useState<Product | null>(null);

  useEffect(() => {
    axios
      .get("/api/admin/products")
      .then((res) => setProducts(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const open = (p: Product) => {
    setSelected(p);
    setModal("product");
  };
  const close = () => setModal(null);

  const firstTwo = products.slice(0, 2);
  const featured = products.slice(0, 3);
  const allItems = products.slice(0, 7);

  return (
    <main className="w-full min-h-screen overflow-hidden bg-white">
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 via-white to-cyan-100/30" />
        <div className="absolute -top-40 -left-32 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-blue-200/20 to-cyan-200/20 blur-[180px]" />
        <div className="absolute -bottom-40 right-0 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-blue-200/15 to-cyan-200/15 blur-[160px]" />

        <div className="relative mx-auto max-w-7xl px-5 py-20 lg:grid lg:grid-cols-2 lg:gap-14 lg:items-center">
          <div className="space-y-7 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border-blue-200 bg-blue-100/60 px-4 py-2 text-xs font-bold uppercase tracking-widest text-blue-500">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-blue-500" />
              New Season Collection
            </div>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-gray-900 md:text-6xl">
              Level Up Your
              <br />
              <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                Tech Game.
              </span>
            </h1>
            <p className="mx-auto max-w-xl text-lg leading-relaxed text-gray-400 lg:mx-0">
              Premium gadget accessories — from crystal-clear audio to lightning-fast charging.
              Everything you need to elevate your everyday tech experience.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-2 lg:justify-start">
              <button
                onClick={() => setModal("collection")}
                className="rounded-full bg-blue-500 px-8 py-3.5 font-semibold text-white shadow-xl shadow-blue-500/25 transition-all hover:bg-blue-600 hover:shadow-blue-600/30 hover:scale-105"
              >
                Shop Collection
              </button>
              <button
                onClick={() => setModal("featured")}
                className="rounded-full border border-gray-200 px-8 py-3.5 font-semibold text-gray-500 transition-all hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/50"
              >
                Explore Gear
              </button>
            </div>
          </div>

          <div className="relative mt-14 flex justify-center lg:mt-0">
            {loading ? (
              <div className="flex h-48 w-[300px] items-center justify-center rounded-[32px] bg-gray-100 animate-pulse sm:w-[400px]" />
            ) : (
              <div className="relative rounded-[32px] border border-blue-100 bg-white/60 p-6 shadow-xl shadow-blue-200/20 backdrop-blur-xl">
                <div className="flex gap-6">
                  {firstTwo.map((p) => {
                    const img = resolveImage(p);
                    return (
                      <div
                        key={p._id}
                        onClick={() => open(p)}
                        className="h-48 w-[140px] cursor-pointer overflow-hidden rounded-2xl shadow-md transition duration-500 hover:-translate-y-2 sm:w-[180px] md:w-[220px]"
                      >
                        {img ? (
                          <img src={img} alt={p.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-blue-100">
                            <Package className="h-8 w-8 text-blue-300" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs text-gray-400">Click a product to view details</p>
                  <span className="flex items-center gap-1 text-xs font-medium text-blue-500">
                    {products.length} items <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── TRUST BAR ─── */}
      <section className="border-y border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 divide-x divide-gray-100 md:grid-cols-4">
            {trustFeatures.map((f) => (
              <div key={f.label} className="flex items-center gap-4 px-6 py-8">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100/60">
                  <f.icon className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{f.label}</p>
                  <p className="text-xs text-gray-400">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES ─── */}
      <section className="bg-gray-50/50 py-20">
        <div className="mx-auto max-w-7xl px-5">
          <div className="mb-12 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border-blue-200 bg-blue-100/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-blue-500">
              Browse by
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-5xl">
              Shop by Category
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {["Audio", "Charging", "Accessories"].map((cat) => {
              const count = countByCategory(products, cat);
              const catProduct = products.find((p) => p.category?.toLowerCase() === cat.toLowerCase());
              const img = catProduct ? resolveImage(catProduct) : null;
              return (
                <div
                  key={cat}
                  className="group rounded-3xl bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-blue-200/20"
                >
                  <div className="mx-auto mb-5 h-28 w-28 overflow-hidden rounded-2xl shadow-md transition duration-300 group-hover:scale-105">
                    {img ? (
                      <img src={img} alt={cat} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-blue-100">
                        <Package className="h-8 w-8 text-blue-300" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-center text-xl font-bold text-gray-900">{cat}</h3>
                  <p className="mt-2 text-center text-sm text-gray-400">
                    {cat === "Audio" && "Headphones, earbuds & speakers for every vibe."}
                    {cat === "Charging" && "Fast chargers, cables & power banks for all devices."}
                    {cat === "Accessories" && "Cases, screen protectors & stands to level up."}
                  </p>
                  <p className="mt-1 text-center text-xs font-medium text-blue-500">{count} items</p>
                  <div className="mt-5 text-center">
                    <a
                      href={`/auth/category/${cat.toLowerCase()}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-blue-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-600"
                    >
                      Browse {cat} <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── FEATURED ─── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-5">
          <div className="mb-12 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border-blue-200 bg-blue-100/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-blue-500">
              Top Picks
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-5xl">
              Featured Gear
            </h2>
          </div>
          {loading ? (
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
                  <div className="mx-auto mb-5 h-48 w-48 rounded-2xl bg-gray-100 animate-pulse" />
                  <div className="mx-auto h-4 w-1/2 rounded-full bg-gray-100 animate-pulse" />
                  <div className="mx-auto mt-3 h-3 w-3/4 rounded-full bg-gray-100 animate-pulse" />
                  <div className="mx-auto mt-6 h-10 w-32 rounded-full bg-gray-100 animate-pulse" />
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
                  <div
                    key={item._id}
                    className="group relative rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-blue-200/20"
                  >
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="relative mb-5 flex justify-center">
                      <div className="h-48 w-48 overflow-hidden rounded-2xl shadow-md transition duration-300 group-hover:scale-105">
                        {img ? (
                          <img src={img} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-blue-50">
                            <Package className="h-12 w-12 text-blue-300" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="relative space-y-3 text-center">
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100/60 px-3 py-1 text-xs font-semibold text-blue-500">
                        <Star className="h-3 w-3 fill-blue-500 text-blue-500" />
                        Featured
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                      <p className="text-sm leading-relaxed text-gray-400 line-clamp-2">
                        {item.description || "Premium quality gadget accessory designed to enhance your tech experience."}
                      </p>
                      <p className="text-2xl font-bold text-blue-500">Rs {item.price}</p>
                      <button
                        onClick={() => open(item)}
                        className="mt-4 rounded-full bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-500"
                      >
                        Quick View
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ─── ALL PRODUCTS ─── */}
      <section className="bg-gray-50/50 py-20">
        <div className="mx-auto max-w-7xl px-5">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border-blue-200 bg-blue-100/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-blue-500">
                Collection
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-5xl">
                All Products
              </h2>
            </div>
            <button
              onClick={() => setModal("collection")}
              className="hidden items-center gap-1.5 rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-500 transition-all hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/50 sm:inline-flex"
            >
              View All <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="mb-4 h-36 w-full rounded-xl bg-gray-100 animate-pulse sm:h-44" />
                  <div className="h-3 w-1/3 rounded-full bg-gray-100 animate-pulse" />
                  <div className="mt-2 h-4 w-3/4 rounded-full bg-gray-100 animate-pulse" />
                  <div className="mt-3 h-5 w-1/4 rounded-full bg-gray-100 animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {allItems.map((item) => {
                const img = resolveImage(item);
                return (
                  <div
                    key={item._id}
                    onClick={() => open(item)}
                    className="group cursor-pointer rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:shadow-blue-200/20"
                  >
                    <div className="relative mb-4">
                      <div className="h-36 w-full overflow-hidden rounded-xl sm:h-44">
                        {img ? (
                          <img src={img} alt={item.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-blue-50">
                            <Package className="h-10 w-10 text-blue-300" />
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                      {item.category}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-gray-900 line-clamp-2">{item.name}</p>
                    <p className="mt-1.5 text-base font-bold text-blue-500">Rs {item.price}</p>
                  </div>
                );
              })}
            </div>
          )}
          <div className="mt-8 text-center sm:hidden">
            <button
              onClick={() => setModal("collection")}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-500 transition-all hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/50"
            >
              View All Products <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="relative py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-400 to-cyan-500" />
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20 blur-[120px]" />
        <div className="relative mx-auto max-w-2xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Level Up Your Setup?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-white/80">
            Join thousands of happy customers who trust GetGadget for premium tech accessories.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <a
              href="/register"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-blue-500 shadow-xl transition-all hover:bg-blue-50 hover:shadow-2xl"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="/about"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:border-white/60 hover:bg-white/10"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* ─── MODAL ─── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={close} />
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-3xl border-b border-gray-100 bg-white px-8 py-5">
              <h2 className="text-xl font-bold text-gray-900">
                {modal === "collection" && "Our Collection"}
                {modal === "featured" && "Featured Gear"}
                {modal === "product" && selected?.name}
              </h2>
              <button
                onClick={close}
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-8 py-6">
              {modal === "collection" && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {allItems.map((item) => {
                    const img = resolveImage(item);
                    return (
                      <div
                        key={item._id}
                        onClick={() => open(item)}
                        className="group cursor-pointer rounded-2xl border border-gray-100 bg-white p-4 text-center transition-all hover:shadow-lg hover:-translate-y-1"
                      >
                        <div className="mx-auto my-3 h-20 w-20 overflow-hidden rounded-xl shadow-md">
                          {img ? (
                            <img src={img} alt={item.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-blue-50">
                              <Package className="h-6 w-6 text-blue-300" />
                            </div>
                          )}
                        </div>
                        <p className="mt-2 text-sm font-semibold text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-400">{item.category}</p>
                        <p className="mt-1 text-sm font-bold text-blue-500">Rs {item.price}</p>
                      </div>
                    );
                  })}
                </div>
              )}
              {modal === "featured" && (
                <div className="space-y-4">
                  {featured.map((item) => {
                    const img = resolveImage(item);
                    return (
                      <div
                        key={item._id}
                        onClick={() => open(item)}
                        className="flex cursor-pointer items-center gap-5 rounded-2xl border border-gray-100 bg-white p-4 transition-all hover:shadow-md"
                      >
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl shadow-md">
                          {img ? (
                            <img src={img} alt={item.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-blue-50">
                              <Package className="h-6 w-6 text-blue-300" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-400 line-clamp-1">{item.description}</p>
                          <p className="mt-1 text-sm font-bold text-blue-500">Rs {item.price}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {modal === "product" && selected && (
                <div className="flex flex-col items-center gap-8 sm:flex-row">
                  <div className="h-56 w-56 shrink-0 overflow-hidden rounded-2xl shadow-xl sm:h-64 sm:w-64">
                    {(() => {
                      const img = resolveImage(selected);
                      return img ? (
                        <img src={img} alt={selected.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-blue-50">
                          <Package className="h-16 w-16 text-blue-300" />
                        </div>
                      );
                    })()}
                  </div>
                  <div className="flex-1 space-y-4">
                    <p className="text-3xl font-bold text-blue-500">Rs {selected.price}</p>
                    <p className="text-gray-500">
                      {selected.description || "Premium quality gadget accessory designed to enhance your tech experience."}
                    </p>
                    <button
                      onClick={() => {
                        close();
                        window.location.href = "/login";
                      }}
                      className="w-full rounded-full bg-blue-500 py-3 font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-600 cursor-pointer"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
