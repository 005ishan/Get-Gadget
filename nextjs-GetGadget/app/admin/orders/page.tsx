"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Package,
  User,
  DollarSign,
  Calendar,
  Hash,
  RefreshCw,
  Download,
  ShoppingBag,
} from "lucide-react";

type OrderStatus = "pending" | "processing" | "shipped" | "delivered";

type Order = {
  _id: string;
  userId: { email: string } | string;
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

const STATUS_FLOW: OrderStatus[] = ["pending", "processing", "shipped", "delivered"];

const STATUS_STYLES: Record<OrderStatus, { badge: string; label: string; dot: string }> = {
  pending:    { badge: "bg-amber-100 text-amber-700 border-amber-200",   dot: "bg-amber-400",  label: "Pending"    },
  processing: { badge: "bg-blue-100 text-blue-700 border-blue-200",      dot: "bg-blue-500",   label: "Processing" },
  shipped:    { badge: "bg-violet-100 text-violet-700 border-violet-200",dot: "bg-violet-500", label: "Shipped"    },
  delivered:  { badge: "bg-green-100 text-green-700 border-green-200",   dot: "bg-green-500",  label: "Delivered"  },
};

const STATUS_COUNT_BG: Record<OrderStatus, string> = {
  pending:    "bg-amber-100",
  processing: "bg-blue-100",
  shipped:    "bg-violet-100",
  delivered:  "bg-green-100",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchOrders(); }, []);

  async function fetchOrders(showRefresh = false) {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:5050"}/api/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch orders");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function updateStatus(orderId: string, newStatus: OrderStatus) {
    setUpdating(orderId);
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:5050"}/api/admin/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error("Failed to update status");
    } finally {
      setUpdating(null);
    }
  }

  function downloadCSV() {
    const headers = ["#", "Transaction ID", "Customer", "Items", "Amount (Rs)", "Status", "Date"];
    const rows = orders.map((order, i) => {
      const email = typeof order.userId === "object" ? order.userId.email : order.userId;
      const items = order.items.map((it) => `${it.productName} (${it.size}) x${it.quantity}`).join(" | ");
      return [
        i + 1,
        order.transactionId?.slice(-8).toUpperCase() || order._id.slice(-8),
        email,
        `"${items}"`,
        order.totalAmount,
        order.status,
        new Date(order.createdAt).toLocaleString(),
      ].join(",");
    });
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const counts = STATUS_FLOW.reduce((acc, s) => {
    acc[s] = orders.filter((o) => o.status === s).length;
    return acc;
  }, {} as Record<OrderStatus, number>);

  const totalAmount = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const formatDate = (d: string) =>
    new Intl.DateTimeFormat("en-US", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    }).format(new Date(d));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Orders</h1>
              <p className="text-xs text-gray-500">Manage and update order statuses</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchOrders(true)}
              title="Refresh"
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={downloadCSV}
              title="Download CSV"
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-5 gap-4">
        {STATUS_FLOW.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(filter === s ? "all" : s)}
            className={`bg-white rounded-xl p-4 shadow-sm border text-left transition-all cursor-pointer ${
              filter === s ? "border-blue-500 ring-2 ring-blue-100" : "border-gray-100 hover:border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">{STATUS_STYLES[s].label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{counts[s]}</p>
              </div>
              <div className={`p-3 rounded-lg ${STATUS_COUNT_BG[s]}`}>
                <span className={`w-3 h-3 rounded-full block ${STATUS_STYLES[s].dot}`} />
              </div>
            </div>
          </button>
        ))}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Total Value</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">Rs. {totalAmount.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="px-6 pb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {["S.N.", "Transaction ID", "Customer", "Items", "Amount", "Status", "Date", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-gray-100 rounded-full w-3/4" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Package className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-gray-500 text-sm">No orders found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((order, index) => {
                    const style = STATUS_STYLES[order.status];
                    const currentIdx = STATUS_FLOW.indexOf(order.status);
                    const nextStatus = STATUS_FLOW[currentIdx + 1] ?? null;
                    const isUpdating = updating === order._id;
                    const email = typeof order.userId === "object" ? order.userId.email : order.userId;

                    return (
                      <tr key={order._id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Hash className="w-3 h-3 text-gray-400" />
                            <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {order.transactionId?.slice(-8).toUpperCase() || order._id.slice(-8)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-xs text-gray-600">{email}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-gray-400 shrink-0" />
                            <span className="text-xs text-gray-700 max-w-[180px] truncate">
                              {order.items.map((i) => `${i.productName} (${i.size}) x${i.quantity}`).join(", ")}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-semibold text-green-600">
                            Rs. {order.totalAmount.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border ${style.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                            {style.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-xs text-gray-600">{formatDate(order.createdAt)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {nextStatus && (
                              <button
                                disabled={isUpdating}
                                onClick={() => updateStatus(order._id, nextStatus)}
                                className="text-xs px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-50 transition font-semibold text-white cursor-pointer whitespace-nowrap"
                              >
                                {isUpdating ? "..." : `→ ${STATUS_STYLES[nextStatus].label}`}
                              </button>
                            )}
                            <select
                              value={order.status}
                              disabled={isUpdating}
                              onChange={(e) => updateStatus(order._id, e.target.value as OrderStatus)}
                              className="text-xs bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 disabled:opacity-50 cursor-pointer"
                            >
                              {STATUS_FLOW.map((s) => (
                                <option key={s} value={s}>{STATUS_STYLES[s].label}</option>
                              ))}
                            </select>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}