"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { LoginData, loginSchema } from "../schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/AuthContext";
import { handleLogin, handleVerifyMfaOtp } from "@/lib/actions/auth-action";
import Link from "next/link";
import { AppToast } from "@/lib/toast";
import { getCaptchaToken } from "@/lib/captcha";


export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaUserId, setMfaUserId] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
  });

  const handleVerifyOtp = async () => {
    if (!mfaUserId || !otpCode || otpCode.length < 6) return;
    const result = await handleVerifyMfaOtp(mfaUserId, otpCode);
    if (result.success && result.data) {
      login(result.data);
      localStorage.setItem("token", result.data.token);
      localStorage.setItem("user", JSON.stringify(result.data));
      AppToast.success("Logged in successfully");
      const role = result.data.role || "user";
      router.push(role === "admin" ? "/admin" : "/auth/dashboard");
    } else {
      setServerError(result.message || "OTP verification failed");
    }
  };

    const onSubmit = async (values: LoginData) => {
    setServerError(null);

    startTransition(async () => {
      try {
        const captchaToken = await getCaptchaToken("login");
        const valuesWithCaptcha = { ...values, captchaToken };
        const response = await handleLogin(valuesWithCaptcha);

        if ((response as any).mfaRequired) {
          setMfaRequired(true);
          setMfaUserId((response as any).userId);
          AppToast.info("MFA code sent to your email");
          return;
        }

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
          className={`block text-right text-sm text-gray-400 transition-colors hover:text-blue-500 ${mfaRequired ? "hidden" : ""}`}
        >
          Forgot password?
        </Link>

        {mfaRequired ? (
          <>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                MFA Code
              </label>
              <p className="text-xs text-gray-400">
                A code was sent to your email. Enter it below.
              </p>
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleVerifyOtp(); } }}
                placeholder="Enter 6-digit code"
                maxLength={6}
                className="h-10 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-blue-300 focus:ring-2 focus:ring-blue-500/10 text-center text-lg tracking-[0.5em]"
              />
            </div>
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={!otpCode || otpCode.length < 6}
              className="h-11 w-full rounded-xl bg-blue-500 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-600 hover:shadow-blue-600/30 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
            >
              Verify & Login
            </button>
            <button
              type="button"
              onClick={() => { setMfaRequired(false); setMfaUserId(null); setOtpCode(""); }}
              className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              Back to login
            </button>
          </>
        ) : (
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
        )}

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
