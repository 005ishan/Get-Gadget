"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { LoginData, loginSchema } from "../schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/AuthContext";
import { handleLogin } from "@/lib/actions/auth-action";
import Link from "next/link";
import { AppToast } from "@/lib/toast";
import { signIn } from "next-auth/react";
import Image from "next/image";

import "react-toastify/dist/ReactToastify.css";

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
  });

  const onSubmit = async (values: LoginData) => {
    setServerError(null);

    startTransition(async () => {
      try {
        const response = await handleLogin(values);

        if (response.success && response.data) {
          login(response.data);
          reset();
          AppToast.success("Logged in successfully");

          const { token, role } = response.data;

          localStorage.setItem("token", token);

          if (role === "admin") {
            router.push("/admin");
          } else {
            router.push("/auth/dashboard");
          }
        } else {
          setServerError(response.message ?? "Invalid email or password");
          AppToast.error(response.message ?? "Invalid email or password");
        }
      } catch (err: any) {
        setServerError(err.message ?? "Invalid email or password");
      }
    });
  };

  const loading = isSubmitting || pending;

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {serverError && <p className="text-sm text-red-500">{serverError}</p>}

        {/* EMAIL */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="yourmail@example.com"
            className="h-10 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-blue-300 focus:ring-2 focus:ring-blue-500/10"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* PASSWORD */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              className="h-10 w-full rounded-xl border border-gray-200 bg-white px-4 pr-12 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-blue-300 focus:ring-2 focus:ring-blue-500/10"
              {...register("password")}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-3 text-xs font-medium text-gray-400 hover:text-gray-700"
              onClick={() => setShowPassword((p) => !p)}
              tabIndex={-1}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        <Link
          href="/request-password-reset"
          className="block text-right text-sm text-gray-400 transition-colors hover:text-blue-500"
        >
          Forgot password?
        </Link>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-gray-400">OR CONTINUE WITH</span>
          </div>
        </div>

        {/* SOCIAL BUTTONS ROW */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/auth/dashboard" })}
            className="flex flex-1 h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 transition-colors hover:bg-gray-50 cursor-pointer"
          >
            <Image src="/icons/google.svg" alt="google" width={18} height={18} />
            <span className="text-sm font-medium text-gray-600">Google</span>
          </button>
          <button
            type="button"
            onClick={() => signIn("facebook", { callbackUrl: "/auth/dashboard" })}
            className="flex flex-1 h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 transition-colors hover:bg-gray-50 cursor-pointer"
          >
            <Image src="/icons/facebook.svg" alt="facebook" width={18} height={18} />
            <span className="text-sm font-medium text-gray-600">Facebook</span>
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="h-11 w-full rounded-xl bg-blue-500 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-600 hover:shadow-blue-600/30 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          )}
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center text-sm text-gray-400">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-semibold text-blue-500 transition-colors hover:text-blue-600">
            Register
          </Link>
        </p>
      </form>
    </>
  );
}
