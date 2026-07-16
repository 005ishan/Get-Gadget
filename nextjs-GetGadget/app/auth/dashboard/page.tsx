"use client";

import Link from "next/link";

export default function Page() {
  return (
    <section className="bg-gray-50/50 text-gray-900">

      {/* HERO SECTION */}
      <div className="relative overflow-hidden bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100/60 px-3 py-1.5 text-xs font-semibold text-blue-500 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              New Season Collection
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight text-gray-900">
              Keep Calm <br />
              <span className="text-blue-500">And Love Tech.</span>
            </h1>
            <p className="mt-6 text-lg text-gray-400 max-w-md leading-relaxed">
              Discover premium gadget accessories — audio, charging, cases, and more for your everyday tech.
            </p>
            <div className="mt-8 flex gap-4 flex-wrap">
              <Link
                href="/auth/category/audio"
                className="px-8 py-3.5 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-semibold transition shadow-lg shadow-blue-500/25"
              >
                Shop Audio
              </Link>
              <Link
                href="/auth/category/accessories"
                className="px-8 py-3.5 border border-gray-200 hover:border-blue-300 text-gray-600 hover:text-blue-500 rounded-full font-semibold transition"
              >
                Shop Accessories
              </Link>
              <Link
                href="/auth/category/charging"
                className="px-8 py-3.5 border border-amber-200 hover:border-amber-400 text-amber-600 hover:text-amber-700 hover:bg-amber-50/50 rounded-full font-semibold transition"
              >
                Shop Charging
              </Link>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="relative rounded-[32px] border border-blue-100 bg-white/60 p-6 shadow-xl shadow-blue-200/20">
              <img
                src="/images/clienthome.png"
                alt="Featured Products"
                className="max-w-md w-full rounded-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* FEATURED CATEGORIES */}
      <div className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border-blue-200 bg-blue-100/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-blue-500 mb-4">
              Browse by Category
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-5xl">Explore Categories</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Link href="/auth/category/audio" className="group relative overflow-hidden rounded-3xl shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="aspect-[16/9] overflow-hidden">
                <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop" className="w-full h-full object-cover transition duration-500 group-hover:scale-105" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <p className="text-sm text-blue-200 font-medium mb-1">COLLECTION</p>
                <h3 className="text-3xl font-bold text-white">Audio</h3>
              </div>
            </Link>
            <Link href="/auth/category/charging" className="group relative overflow-hidden rounded-3xl shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="aspect-[16/9] overflow-hidden">
                <img src="https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=400&fit=crop" className="w-full h-full object-cover transition duration-500 group-hover:scale-105" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <p className="text-sm text-amber-200 font-medium mb-1">COLLECTION</p>
                <h3 className="text-3xl font-bold text-white">Charging</h3>
              </div>
            </Link>
            <Link href="/auth/category/accessories" className="group relative overflow-hidden rounded-3xl shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="aspect-[16/9] overflow-hidden">
                <img src="https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&h=400&fit=crop" className="w-full h-full object-cover transition duration-500 group-hover:scale-105" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <p className="text-sm text-cyan-200 font-medium mb-1">COLLECTION</p>
                <h3 className="text-3xl font-bold text-white">Accessories</h3>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* TRUST FEATURES */}
      <div className="border-y border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 divide-x divide-gray-100 md:grid-cols-3">
            {[
              { icon: "🛒", title: "Easy Shopping", desc: "Simple and fast gadget buying." },
              { icon: "🚀", title: "Fast Delivery", desc: "Get gadgets delivered quickly." },
              { icon: "⭐", title: "Premium Quality", desc: "Best quality accessories." },
            ].map((f) => (
              <div key={f.title} className="flex items-center gap-4 px-6 py-8">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100/60 text-xl">
                  {f.icon}
                </div>
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