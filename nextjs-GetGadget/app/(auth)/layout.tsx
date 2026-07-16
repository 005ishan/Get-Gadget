"use client";

import { ReactNode } from "react";
import Link from "next/link";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Left — Brand panel */}
      <div className="relative hidden w-1/2 flex-col items-center justify-center overflow-hidden p-12 lg:flex">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50" />
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-blue-100/30 to-cyan-100/20 blur-[180px]" />
        <div className="absolute -bottom-40 -right-40 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-cyan-100/20 to-blue-100/20 blur-[160px]" />

        <div className="relative text-center">
          <Link href="/" className="inline-flex items-center gap-1.5">
            <span className="text-4xl font-extrabold tracking-tight text-gray-900">Get</span>
            <span className="text-4xl font-light tracking-tight text-blue-500">Gadget</span>
          </Link>
          <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-gray-400">
            Premium gadget accessories for your everyday tech. Crystal-clear audio, lightning-fast charging, and ultimate protection.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 text-left">
            {["Free Shipping", "2 Yr Warranty", "Fast Delivery", "Easy Returns"].map((feature) => (
              <div key={feature} className="flex items-center gap-2 rounded-lg bg-white/60 px-4 py-2.5 text-sm font-medium text-gray-700 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Auth form */}
      <div className="flex flex-1 items-center justify-center bg-white px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <Link href="/" className="inline-flex items-center gap-1.5">
              <span className="text-2xl font-extrabold tracking-tight text-gray-900">Get</span>
              <span className="text-2xl font-light tracking-tight text-blue-500">Gadget</span>
            </Link>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
