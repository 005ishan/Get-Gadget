"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function SettingsPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const user = localStorage.getItem("user");

    if (user) {
      const parsed = JSON.parse(user);
      setEmail(parsed.email || "");
      setUserId(parsed._id);
    }
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password && password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:5050"}/api/users/${userId}`,
        {
          email,
          password: password || undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Settings updated successfully!");

    } catch (error) {
      console.error(error);
      toast.error("Update failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 text-gray-900 px-6 py-12">

      <div className="max-w-2xl mx-auto flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-10">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100/60 px-3 py-1 text-xs font-semibold text-blue-500 mb-3">
            ⚙️ Account
          </div>
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl tracking-wide">
            Account Settings
          </h1>
        </div>

        <Link
          href="/auth/transactions"
          className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition shadow-lg shadow-blue-500/20 self-start sm:self-auto"
        >
          View Transaction History
        </Link>
      </div>

      <div className="max-w-2xl mx-auto">
        <form
          onSubmit={handleSave}
          className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 space-y-6"
        >

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Email Address
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-gray-200 text-gray-900 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              New Password (optional)
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-gray-200 text-gray-900 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Confirm Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-white border border-gray-200 text-gray-900 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full font-semibold transition shadow-xl shadow-blue-500/25 cursor-pointer"
          >
            Update Settings
          </button>
        </form>
      </div>

      <ToastContainer position="top-right" />
    </div>
  );
}