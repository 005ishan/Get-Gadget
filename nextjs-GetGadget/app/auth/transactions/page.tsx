"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface Transaction {
  _id: string;
  userId: string;
  amount: number;
  paymentMethod: string;
  productName?: string;
  transactionId: string;
  createdAt: string;
}

function SkeletonRow() {
  return (
    <div className="relative bg-white border border-gray-100 rounded-2xl p-6 overflow-hidden flex justify-between items-center gap-4 shadow-sm">
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-gray-100/50 to-transparent" />
      <div className="space-y-3 flex-1">
        <div className="h-4 bg-gray-200 rounded-full w-1/4" />
        <div className="h-3 bg-gray-200 rounded-full w-1/2" />
        <div className="h-3 bg-gray-200 rounded-full w-1/3" />
      </div>
      <div className="h-6 bg-gray-200 rounded-full w-24" />
    </div>
  );
}

export default function Page() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const user = localStorage.getItem("user");
        const token = localStorage.getItem("token");
        if (!user) return;
        const parsed = JSON.parse(user);
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:5050"}/api/transactions/${parsed._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTransactions(res.data || []);
      } catch (error) {
        console.error("Failed to fetch transactions");
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const total = transactions.reduce((sum, tx) => sum + tx.amount, 0);

  const methodIcon = (method: string) => {
    if (method.toLowerCase() === "esewa")
      return <img src="/icons/esewa.png" alt="eSewa" className="h-5 w-auto" />;
    if (method.toLowerCase() === "khalti")
      return (
        <img src="/icons/khalti.png" alt="Khalti" className="h-5 w-auto" />
      );
    return <span>💳</span>;
  };

  return (
    <div className="bg-gray-50/50 min-h-screen text-gray-900 py-14">
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100/60 px-3 py-1 text-xs font-semibold text-blue-500 mb-3">
              🧾 Payment History
            </div>
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Transaction History</h1>
            {!loading && transactions.length > 0 && (
              <p className="text-gray-400 text-sm mt-1">
                {transactions.length} transaction
                {transactions.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* Total summary badge */}
          {!loading && transactions.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl px-6 py-4 text-left sm:text-right shadow-sm self-start sm:self-auto">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">
                Total Spent
              </p>
              <p className="text-2xl font-bold text-blue-600">Rs. {total}</p>
            </div>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100/60 mb-2">
              <span className="text-3xl">🧾</span>
            </div>
            <p className="text-2xl font-bold text-gray-400">
              No transactions yet
            </p>
            <p className="text-gray-400 text-sm">
              Your payment history will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx, index) => (
              <div
                key={tx._id}
                className="bg-white border border-gray-100 hover:border-blue-200 p-6 rounded-2xl flex justify-between items-center shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:shadow-blue-200/20"
              >
                {/* Left */}
                <div className="flex items-center gap-4">
                  {/* Index badge */}
                  <div className="w-9 h-9 rounded-full bg-blue-100/60 border border-blue-200 flex items-center justify-center text-xs text-blue-500 font-bold shrink-0">
                    {index + 1}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span>{methodIcon(tx.paymentMethod)}</span>
                      <p className="font-bold uppercase tracking-wide text-blue-500 text-sm">
                        {tx.paymentMethod}
                      </p>
                    </div>

                    {tx.productName && (
                      <p className="text-gray-500 text-sm mt-1">
                        {tx.productName}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-2">
                      <p className="text-gray-400 text-xs">
                        {new Date(tx.createdAt).toLocaleString()}
                      </p>
                      <span className="text-gray-300 text-xs">•</span>
                      <p className="text-gray-400 text-xs font-mono">
                        #{tx.transactionId?.slice(-8).toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <p className="text-xl font-bold text-blue-600">
                    Rs. {tx.amount}
                  </p>
                  <span className="text-xs bg-green-50 border border-green-200 text-green-600 px-2 py-0.5 rounded-full">
                    Paid
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
