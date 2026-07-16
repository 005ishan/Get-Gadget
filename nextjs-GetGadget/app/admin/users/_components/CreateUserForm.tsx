"use client";

import axios from "@/lib/api/axios";
import { AUTH } from "@/lib/api/endpoints";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

export default function CreateUserForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("confirmPassword", confirmPassword);
    formData.append("role", role);

    try {
      setLoading(true);
      await axios.post(AUTH.CREATE_USER, formData);

      toast.success("User Created Successfully");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);

      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setRole("user");
    } catch (error: any) {
      console.error("Axios error:", error.response?.data);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="rounded-3xl shadow-xl border overflow-hidden">

          {/* Top accent bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-300" />

          <CardHeader className="pt-8 pb-2 px-8">
            <div className="flex flex-col items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl">
                👤
              </div>
              <CardTitle className="text-2xl font-bold text-center">
                Create New User
              </CardTitle>
              <p className="text-sm text-muted-foreground text-center">
                Fill in the details below to add a new user to the platform.
              </p>
            </div>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            <form onSubmit={submit} className="space-y-5">

              {/* Email */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Email Address</Label>
                <Input
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-xl h-11 px-4 text-sm focus-visible:ring-primary"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Password</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="rounded-xl h-11 px-4 text-sm focus-visible:ring-primary"
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Confirm Password</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={`rounded-xl h-11 px-4 text-sm focus-visible:ring-primary ${
                    confirmPassword && confirmPassword !== password
                      ? "border-red-400 focus-visible:ring-red-400"
                      : confirmPassword && confirmPassword === password
                      ? "border-green-400 focus-visible:ring-green-400"
                      : ""
                  }`}
                />
                {confirmPassword && confirmPassword !== password && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
                {confirmPassword && confirmPassword === password && (
                  <p className="text-xs text-green-500 mt-1">✓ Passwords match</p>
                )}
              </div>

              {/* Role */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Role</Label>
                <div className="flex gap-3">
                  {["user", "admin"].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition capitalize ${
                        role === r
                          ? r === "admin"
                            ? "bg-blue-500 text-white border-blue-500"
                            : "bg-primary text-white border-primary"
                          : "bg-background text-muted-foreground border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {r === "admin" ? "🛡️" : "👤"} {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading || success}
                className={`w-full h-11 rounded-xl font-semibold text-sm transition-all ${
                  success ? "bg-green-500 hover:bg-green-500" : ""
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Creating user...
                  </span>
                ) : success ? (
                  <span className="flex items-center justify-center gap-2">
                    ✓ User Created!
                  </span>
                ) : (
                  "Create User"
                )}
              </Button>

            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}