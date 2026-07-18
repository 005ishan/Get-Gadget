"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/api/axios";import { toast, ToastContainer } from "react-toastify";


import { EsewaGateway, KhaltiGateway } from "../gateaway/payment-gateway";
import { ShoppingCart, Trash2, ChevronLeft, Minus, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Product {
  _id: string;
  name: string;
  price: number;
  imageUrl?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
  addedAt: string;
}

export default function Page() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [token, setToken] = useState<string>("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUserId(parsed._id);
    }
    const storedToken = localStorage.getItem("token");
    if (storedToken) setToken(storedToken);
  }, []);

  useEffect(() => {
    if (!userId) return;
    const fetchCart = async () => {
      try {
        const res = await axios.get(`/api/users/${userId}/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCart(res.data);
      } catch (error) {
        console.error("Failed to fetch cart", error);
        toast.error("Failed to load cart");
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [userId, token]);

  const updateQuantity = async (productId: string, newQty: number) => {
    if (!userId || newQty < 1 || newQty > 10) return;
    setUpdatingId(productId);
    try {
      await axios.put(`/api/users/${userId}/cart`,
        { productId, quantity: newQty },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(cart.map(item =>
        item.product._id === productId ? { ...item, quantity: newQty } : item
      ));
    } catch (error) {
      console.error("Failed to update quantity", error);
      toast.error("Failed to update quantity");
    } finally {
      setUpdatingId(null);
    }
  };

  const removeItem = async (productId: string) => {
    if (!userId) return;
    try {
      await axios.delete(`/api/users/${userId}/cart`, {
        data: { productId },
      });
      setCart(cart.filter((item) => item.product._id !== productId));
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Failed to remove item", error);
      toast.error("Failed to remove item");
    }
  };

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const productNames = cart.map((item) => item.product.name).join(", ");
  const shipping = total >= 1000 ? 0 : 149;
  const grandTotal = total + shipping;

  const saveCartForOrder = () => {
    const cartSnapshot = cart.map((item) => ({
      productId: item.product._id,
      productName: item.product.name,
      size: "One Size",
      quantity: item.quantity,
      price: item.product.price,
      imageUrl: item.product.imageUrl || "",
    }));
    localStorage.setItem("pendingOrderItems", JSON.stringify(cartSnapshot));
    localStorage.setItem("pendingOrderTotal", String(grandTotal));
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:5050";

  const getImageUrl = (imageUrl?: string) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith("http")) return imageUrl;
    return `${API_URL}${imageUrl}`;
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
        toastStyle={{ borderRadius: "12px", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100/60 px-3 py-1 text-xs font-semibold text-blue-500 mb-3">
              <ShoppingCart className="h-3.5 w-3.5" />
              Shopping Cart
            </div>
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Your Cart</h1>
          </div>
          {!loading && cart.length > 0 && (
            <span className="text-sm text-gray-400 bg-white px-4 py-2 rounded-full border border-gray-100">
              {cart.length} item{cart.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 animate-pulse">
                <div className="w-24 h-24 bg-gray-200 rounded-xl shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-200 rounded-full w-1/2" />
                  <div className="h-3 bg-gray-200 rounded-full w-1/4" />
                </div>
                <div className="flex flex-col items-end gap-3">
                  <div className="h-5 bg-gray-200 rounded-full w-20" />
                  <div className="h-8 bg-gray-200 rounded-lg w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-blue-100/60">
              <ShoppingCart className="h-10 w-10 text-blue-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
            <p className="mt-2 text-sm text-gray-400">Looks like you haven&apos;t added anything yet.</p>
            <Link
              href="/auth/dashboard"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-blue-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-600"
            >
              Browse Products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Cart Items - 2 cols */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => {
                const imageUrl = getImageUrl(item.product.imageUrl);
                const isUpdating = updatingId === item.product._id;

                return (
                  <div
                    key={item.product._id}
                    className="group relative flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:shadow-blue-200/20 sm:flex-row sm:items-center"
                  >
                    {/* Image */}
                    <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl bg-gray-50 sm:w-24">
                      {imageUrl ? (
                        <img src={imageUrl} alt={item.product.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <ShoppingCart className="h-6 w-6 text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900">{item.product.name}</h3>
                      <p className="mt-0.5 text-sm font-medium text-blue-500">Rs. {item.product.price}</p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
                      <button
                        onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || isUpdating}
                        className="flex h-8 w-8 items-center justify-center text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-30"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="flex h-8 w-10 items-center justify-center border-x border-gray-200 text-xs font-semibold text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                        disabled={item.quantity >= 10 || isUpdating}
                        className="flex h-8 w-8 items-center justify-center text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-30"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Total & remove */}
                    <div className="flex items-center justify-between sm:flex-col sm:items-end sm:gap-2">
                      <p className="text-base font-bold text-gray-900">Rs. {item.product.price * item.quantity}</p>
                      <button
                        onClick={() => removeItem(item.product._id)}
                        className="flex items-center gap-1 text-xs font-medium text-red-400 transition-colors hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary - 1 col */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="mb-6 text-lg font-bold text-gray-900">Order Summary</h2>

                <div className="space-y-3 text-sm">
                  {cart.map((item) => (
                    <div key={item.product._id} className="flex justify-between">
                      <span className="text-gray-500 truncate max-w-[180px]">
                        {item.product.name} <span className="text-gray-300">×{item.quantity}</span>
                      </span>
                      <span className="font-medium text-gray-700">Rs. {item.product.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 space-y-2 border-t border-gray-100 pt-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-medium text-gray-700">Rs. {total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Shipping</span>
                    <span className={`font-medium ${shipping === 0 ? "text-green-600" : "text-gray-700"}`}>
                      {shipping === 0 ? "FREE" : `Rs. ${shipping}`}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-blue-500">
                      Add Rs. {1000 - total} more for free shipping!
                    </p>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                  <span className="text-base font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-blue-600">Rs. {grandTotal}</span>
                </div>

                {/* Payment Buttons */}
                <div className="mt-6 flex flex-col gap-3">
                  <EsewaGateway
                    amount={grandTotal}
                    products={productNames}
                    userId={userId ?? ""}
                    token={token}
                    onSuccess={() => {
                      saveCartForOrder();
                      window.location.href = "/auth/payment-success";
                    }}
                  />
                  <KhaltiGateway
                    amount={grandTotal}
                    products={productNames}
                    userId={userId ?? ""}
                    token={token}
                    onSuccess={() => {
                      saveCartForOrder();
                      window.location.href = "/auth/payment-success";
                    }}
                  />
                </div>

                <p className="mt-4 text-center text-xs text-gray-400">
                  Secure checkout powered by eSewa &amp; Khalti
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}