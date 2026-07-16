"use client";

import { Shield, Star, Zap, ArrowRight } from "lucide-react";

const values = [
  {
    icon: Star,
    title: "Premium Quality",
    desc: "We only stock products that meet our rigorous quality standards. Every item is tested and verified before it reaches your hands.",
  },
  {
    icon: Zap,
    title: "Innovation First",
    desc: "We stay ahead of the curve by sourcing the latest and most innovative gadget accessories from around the world.",
  },
  {
    icon: Shield,
    title: "Customer Trust",
    desc: "Your satisfaction is our priority. We offer hassle-free returns and dedicated support to ensure you love your purchase.",
  },
];

const timeline = [
  { year: "2020", event: "GetGadget founded with a vision to make premium tech accessories accessible to everyone." },
  { year: "2021", event: "Launched our first collection of audio accessories — sold out in 48 hours." },
  { year: "2022", event: "Expanded to charging solutions and protection gear. Reached 10,000 happy customers." },
  { year: "2023", event: "Opened our first physical experience store in Kathmandu." },
  { year: "2024", event: "Launched nationwide delivery with 2-day shipping guarantee." },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50" />
        <div className="absolute -top-40 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-gradient-to-br from-blue-100/20 to-cyan-100/20 blur-[180px]" />
        <div className="relative mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:py-32">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-blue-600">
            About Us
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Our Story
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-400">
            We believe great tech should look good too. GetGadget was born from
            a simple idea — premium gadget accessories that don&apos;t compromise on
            style or performance.
          </p>
        </div>
      </section>

      {/* ─── MISSION ─── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Designed for the Modern Tech Life
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-gray-600">
              From crystal-clear audio to lightning-fast charging and
              military-grade protection, every product in our collection is
              carefully curated to elevate your everyday tech experience.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-gray-600">
              We partner directly with top manufacturers to bring you the best
              quality at honest prices — no middlemen, no markup.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((v) => (
              <div
                key={v.title}
                className="group rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 transition-colors group-hover:bg-blue-100">
                  <v.icon className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{v.title}</h3>
                <p className="mt-3 leading-relaxed text-gray-500">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TIMELINE ─── */}
      <section className="bg-[#FAFAFA] py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Our Journey
            </h2>
            <p className="mt-3 text-gray-500">
              From a small startup to Nepal&apos;s trusted gadget accessory brand.
            </p>
          </div>
          <div className="relative space-y-0">
            {/* Vertical line */}
            <div className="absolute left-[19px] top-0 h-full w-px bg-gradient-to-b from-blue-300 via-blue-200 to-transparent" />

            {timeline.map((item, i) => (
              <div key={item.year} className="relative flex gap-6 pb-12 last:pb-0">
                <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-blue-100 bg-white shadow-sm">
                  <span className="text-xs font-bold text-blue-500">{i + 1}</span>
                </div>
                <div className="pt-1.5">
                  <span className="inline-block rounded-full bg-blue-50 px-3 py-0.5 text-xs font-semibold text-blue-500">
                    {item.year}
                  </span>
                  <p className="mt-2 text-gray-500">{item.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-400 to-cyan-500" />
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20 blur-[120px]" />
        <div className="relative mx-auto max-w-2xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Experience the Difference?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-white/80">
            Join thousands of satisfied customers who trust GetGadget for their
            premium tech accessories.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <a
              href="/register"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-blue-500 shadow-xl transition-all hover:bg-blue-50"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:border-white/60 hover:bg-white/10"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
