"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:5050";
import { useSearchParams } from "next/navigation";

// eSewa redirects back with: ?data=<base64 encoded JSON>
// Khalti redirects back with: ?pidx=...&status=Completed&transaction_id=...

export default function Page() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"processing" | "success" | "failed">("processing");

  useEffect(() => {
    const processPayment = async () => {
      try {
        const storedUser    = localStorage.getItem("user");
        const token         = localStorage.getItem("token");
        const paymentMethod = localStorage.getItem("paymentMethod") || "esewa";
        const paymentAmount = Number(localStorage.getItem("paymentAmount")) || 0;
        const productName   = localStorage.getItem("paymentProduct") || "";
        const pendingItems  = localStorage.getItem("pendingOrderItems");
        const pendingTotal  = Number(localStorage.getItem("pendingOrderTotal")) || paymentAmount;

        if (!storedUser) return;
        const parsed = JSON.parse(storedUser);

        let transactionId: string | null = null;
        let paymentVerified = false;

        if (paymentMethod === "khalti") {
          // Khalti appends ?pidx=...&status=Completed to return_url
          const pidx    = searchParams.get("pidx");
          const kStatus = searchParams.get("status");

          if (pidx && kStatus === "Completed") {
            const verifyRes = await fetch(`${API_URL}/api/payment/khalti/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ pidx }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.status === "Completed") {
              transactionId   = verifyData.transaction_id || pidx;
              paymentVerified = true;
            }
          }
        } else {
          // eSewa appends ?data=<base64 JSON> to success_url
          const esewaData = searchParams.get("data");
          if (esewaData) {
            const decoded = JSON.parse(atob(esewaData));
            if (decoded.status === "COMPLETE") {
              transactionId   = decoded.transaction_uuid;
              paymentVerified = true;
            }
          } else {
            // fallback if no query param
            transactionId   = Date.now().toString();
            paymentVerified = true;
          }
        }

        if (!paymentVerified) {
          setStatus("failed");
          return;
        }

        // 1. Save transaction
        const txRes = await fetch(`${API_URL}/api/transactions/payment/success`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token || "",
          },
          body: JSON.stringify({
            userId: parsed._id,
            amount: paymentAmount,
            paymentMethod,
            productName,
          }),
        });
        const txData = await txRes.json();

        // 2. Create order
        if (pendingItems) {
          const items = JSON.parse(pendingItems);
          const orderRes = await fetch(`${API_URL}/api/orders`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              userId: parsed._id,
              transactionId: txData?.transaction?.transactionId || transactionId || Date.now().toString(),
              items,
              totalAmount: pendingTotal,
            }),
          });

          if (!orderRes.ok) {
            const orderErr = await orderRes.json().catch(() => ({}));
            console.error("Order creation failed:", orderErr);
            // Keep localStorage so user can retry
            setStatus("failed");
            return;
          }
        }

        // 3. Cleanup localStorage
        ["paymentMethod","paymentAmount","paymentProduct","paymentUserId",
         "pendingOrderItems","pendingOrderTotal","esewaTransactionUUID"].forEach(k => localStorage.removeItem(k));

        setStatus("success");
        setTimeout(() => { window.location.href = "/auth/orders"; }, 3000);

      } catch (error) {
        console.error("Payment processing failed", error);
        setStatus("failed");
      }
    };

    processPayment();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 px-6">
      <div className="bg-white border border-gray-100 p-10 rounded-2xl shadow-sm max-w-md w-full text-center">

        {status === "processing" && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center">
                <svg className="animate-spin w-10 h-10 text-blue-400" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" strokeLinecap="round" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-blue-500 mb-3">Processing Payment...</h1>
            <p className="text-gray-500 text-sm">Please wait while we confirm your payment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
                <span className="text-4xl">✓</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-green-400 mb-4">Payment Successful!</h1>
            <p className="text-gray-500 mb-6">Your order has been placed successfully.</p>
            <div className="text-sm text-gray-400">Redirecting to your orders in 3 seconds...</div>
          </>
        )}

        {status === "failed" && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
                <span className="text-4xl">✕</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-red-400 mb-4">Payment Failed</h1>
            <p className="text-gray-500 mb-6">Something went wrong. Please try again.</p>
            <a href="/auth/Cart" className="inline-flex items-center gap-2 rounded-full bg-blue-500 hover:bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all">
              ← Back to Cart
            </a>
          </>
        )}

      </div>
    </div>
  );
}