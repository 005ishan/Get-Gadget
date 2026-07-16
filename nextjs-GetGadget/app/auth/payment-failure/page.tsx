"use client";

import { useRouter } from "next/navigation";

export default function PaymentFailurePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 px-6">
      <div className="bg-white border border-gray-100 p-10 rounded-2xl shadow-sm max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
            <span className="text-4xl">✕</span>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-red-400 mb-4">Payment Failed</h1>
        <p className="text-gray-500 mb-8">
          Your payment was cancelled or failed. No charges were made.
        </p>
        <button
          onClick={() => router.push("/auth/Cart")}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-full transition cursor-pointer shadow-lg shadow-blue-500/25"
        >
          ← Back to Cart
        </button>
      </div>
    </div>
  );
}