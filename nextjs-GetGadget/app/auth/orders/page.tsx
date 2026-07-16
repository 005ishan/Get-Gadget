"use client";

import { useEffect, useState } from "react";
import axios from "axios";

type OrderStatus = "pending" | "processing" | "shipped" | "delivered";

type Order = {
  _id: string;
  transactionId: string;
  items: {
    productName: string;
    size: string;
    quantity: number;
    price: number;
    imageUrl?: string;
  }[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
};

const STEPS: OrderStatus[] = ["pending", "processing", "shipped", "delivered"];

const STATUS_META: Record<
  OrderStatus,
  { label: string; color: string; description: string }
> = {
  pending: {
    label: "Pending",
    color: "#f59e0b",
    description: "Order placed, awaiting processing",
  },
  processing: {
    label: "Processing",
    color: "#3b82f6",
    description: "We're preparing your order",
  },
  shipped: {
    label: "Shipped",
    color: "#8b5cf6",
    description: "Your order is on the way!",
  },
  delivered: {
    label: "Delivered",
    color: "#10b981",
    description: "Delivered! Enjoy your gear 🎉",
  },
};

function SkeletonRow() {
  return (
    <div className="relative bg-white border border-gray-100 rounded-2xl p-6 overflow-hidden shadow-sm">
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-gray-100/50 to-transparent" />
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded-full w-1/4" />
        <div className="h-3 bg-gray-200 rounded-full w-1/2" />
        <div className="h-2 bg-gray-200 rounded-full w-full mt-4" />
      </div>
    </div>
  );
}

function StatusTracker({ status }: { status: OrderStatus }) {
  const currentIdx = STEPS.indexOf(status);
  return (
    <div className="flex items-center w-full mt-5">
      {STEPS.map((step, idx) => {
        const done = idx <= currentIdx;
        const active = idx === currentIdx;
        const meta = STATUS_META[step];

        return (
          <div key={step} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center shrink-0">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                style={{
                  background: done ? meta.color : "#1f2937",
                  color: done ? "#fff" : "#4b5563",
                  boxShadow: active ? `0 0 0 4px ${meta.color}30` : "none",
                }}
              >
                {idx < currentIdx ? "✓" : idx + 1}
              </div>
              <span
                className="text-xs mt-1 font-medium whitespace-nowrap"
                style={{ color: active ? meta.color : "#4b5563" }}
              >
                {meta.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className="flex-1 h-0.5 mx-1 rounded transition-all"
                style={{
                  background:
                    idx < currentIdx
                      ? STATUS_META[STEPS[idx]].color
                      : "#1f2937",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const user = localStorage.getItem("user");
        const token = localStorage.getItem("token");
        if (!user) return;
        const parsed = JSON.parse(user);
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:5050"}/api/orders/${parsed._id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setOrders(res.data || []);
      } catch (err: any) {
        console.error("Failed to fetch orders:", err?.message || err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="bg-gray-50/50 min-h-screen text-gray-900 py-14">
      <style>{`@keyframes shimmer { 100% { transform: translateX(100%); } }`}</style>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100/60 px-3 py-1 text-xs font-semibold text-blue-500 mb-3">
              📦 Order History
            </div>
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">My Orders</h1>
            {!loading && orders.length > 0 && (
              <p className="text-gray-400 text-sm mt-1">
                {orders.length} order{orders.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100/60 mb-2">
              <span className="text-3xl">📦</span>
            </div>
            <p className="text-2xl font-bold text-gray-400">No orders yet</p>
            <p className="text-gray-400 text-sm">
              Your orders will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => {
              const meta = STATUS_META[order.status];
              return (
                <div
                  key={order._id}
                  className="bg-white border border-gray-100 hover:border-blue-200 p-6 rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:shadow-blue-200/20"
                >
                  {/* Top row */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100/60 border border-blue-200 flex items-center justify-center text-xs text-blue-500 font-bold shrink-0">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-blue-500 uppercase tracking-wide">
                          {order.items.map((i) => i.productName).join(", ")}
                        </p>
                        <p className="text-gray-400 text-xs mt-0.5">
                          {order.items
                            .map((i) => `Size ${i.size} × ${i.quantity}`)
                            .join(" · ")}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <p className="text-gray-400 text-xs">
                            {new Date(order.createdAt).toLocaleString()}
                          </p>
                          <span className="text-gray-300 text-xs">•</span>
                          <p className="text-gray-400 text-xs font-mono">
                            #{order.transactionId?.slice(-8).toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <p className="text-xl font-bold text-blue-600">
                        Rs. {order.totalAmount}
                      </p>
                      <span
                        className="text-xs px-2.5 py-0.5 rounded-full font-semibold border"
                        style={{
                          background: `${meta.color}18`,
                          color: meta.color,
                          borderColor: `${meta.color}30`,
                        }}
                      >
                        {meta.label}
                      </span>
                    </div>
                  </div>

                  {/* Status description */}
                  <p className="text-xs mt-4 text-gray-400">
                    {meta.description}
                  </p>

                  {/* Progress tracker */}
                  <StatusTracker status={order.status} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
