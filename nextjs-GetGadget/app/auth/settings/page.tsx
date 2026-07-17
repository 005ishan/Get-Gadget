"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function SettingsPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsed = JSON.parse(user);
      setEmail(parsed.email || "");
      setName(parsed.name || "");
      setPhone(parsed.phone || "");
      setAddress(parsed.address || "");
      setUserId(parsed._id);
    }
    checkMfaStatus();
  }, []);

  const checkMfaStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      if (!user) return;
      const parsed = JSON.parse(user);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:5050"}/api/auth/profile`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMfaEnabled(res.data.data?.otpVerified || false);
    } catch {}
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:5050"}/api/users/${userId}`,
        { email, name, phone, address, password: password || undefined },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const user = localStorage.getItem("user");
      if (user) {
        const parsed = JSON.parse(user);
        parsed.email = email;
        parsed.name = name;
        parsed.phone = phone;
        parsed.address = address;
        localStorage.setItem("user", JSON.stringify(parsed));
      }
      toast.success("Settings updated successfully!");
    } catch {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:5050"}/api/auth/export-data`,
        { headers: { Authorization: `Bearer ${token}` }, responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "getgadget-my-data.json");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Your data has been downloaded!");
    } catch {
      toast.error("Failed to export data");
    }
  };

  const handleToggleMfa = async () => {
    try {
      const token = localStorage.getItem("token");
      const endpoint = mfaEnabled ? "mfa/disable" : "mfa/enable";
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:5050"}/api/auth/${endpoint}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMfaEnabled(!mfaEnabled);
      toast.success(mfaEnabled ? "MFA disabled" : "MFA enabled");
    } catch {
      toast.error("Failed to toggle MFA");
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

      <div className="max-w-2xl mx-auto space-y-6">
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
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-gray-200 text-gray-900 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-white border border-gray-200 text-gray-900 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Delivery Address
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              className="w-full bg-white border border-gray-200 text-gray-900 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <hr className="border-gray-100" />

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
            disabled={saving}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full font-semibold transition shadow-xl shadow-blue-500/25 cursor-pointer"
          >
            {saving ? "Saving..." : "Update Settings"}
          </button>
        </form>

        {/* MFA Section */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-500 mt-1">
                {mfaEnabled ? "MFA is enabled. Email OTP required on login." : "Add extra security with email OTP codes."}
              </p>
            </div>
            <button
              onClick={handleToggleMfa}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition cursor-pointer ${
                mfaEnabled
                  ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                  : "bg-green-50 text-green-600 border border-green-200 hover:bg-green-100"
              }`}
            >
              {mfaEnabled ? "Disable MFA" : "Enable MFA"}
            </button>
          </div>
        </div>

        {/* Data Export */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Download Your Data</h3>
              <p className="text-sm text-gray-500 mt-1">
                Export your profile info, orders, and transactions as JSON.
              </p>
            </div>
            <button
              onClick={handleExportData}
              className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition shadow-lg shadow-blue-500/20 cursor-pointer"
            >
              Download My Data
            </button>
          </div>
        </div>

        {/* Data Import */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Import Your Data</h3>
              <p className="text-sm text-gray-500 mt-1">
                Upload a JSON file to restore your profile info.
              </p>
            </div>
            <label className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition shadow-lg shadow-blue-500/20 cursor-pointer inline-block">
              Import Data
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const text = await file.text();
                    const data = JSON.parse(text);
                    const token = localStorage.getItem("token");
                    const res = await axios.post(
                      `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:5050"}/api/auth/import-data`,
                      data,
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    if (res.data.success) {
                      toast.success("Data imported successfully!");
                      if (res.data.data) {
                        const user = localStorage.getItem("user");
                        if (user) {
                          const parsed = JSON.parse(user);
                          parsed.name = res.data.data.name || parsed.name;
                          parsed.phone = res.data.data.phone || parsed.phone;
                          parsed.address = res.data.data.address || parsed.address;
                          parsed.email = res.data.data.email || parsed.email;
                          localStorage.setItem("user", JSON.stringify(parsed));
                          setName(parsed.name || "");
                          setPhone(parsed.phone || "");
                          setAddress(parsed.address || "");
                          setEmail(parsed.email || "");
                        }
                      }
                    }
                  } catch {
                    toast.error("Failed to import data. Check file format.");
                  }
                  e.target.value = "";
                }}
              />
            </label>
          </div>
        </div>
      </div>

      <ToastContainer position="top-right" />
    </div>
  );
}