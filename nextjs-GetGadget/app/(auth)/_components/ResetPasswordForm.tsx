"use client";

import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { handleResetPassword } from "@/lib/actions/auth-action";
import { AppToast } from "@/lib/toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

export const ResetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z
      .string()
      .min(6, "Confirm Password must be at least 6 characters long"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordDTO = z.infer<typeof ResetPasswordSchema>;

export default function ResetPasswordForm({ token }: { token: string }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordDTO>({
    resolver: zodResolver(ResetPasswordSchema),
  });

  const router = useRouter();

  const onSubmit = async (data: ResetPasswordDTO) => {
    try {
      await AppToast.promise(handleResetPassword(token, data.password), {
        loading: "Resetting your password...",
        success: "Password reset successfully",
        error: "Failed to reset password",
      });

      setTimeout(() => {
        router.replace("/login");
      }, 900);
    } catch (err: any) {
      AppToast.error(err.message || "An unexpected error occurred");
    }
  };  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="mb-6">
        <p className="text-2xl font-bold tracking-tight text-gray-900">
          Reset Password
        </p>
        <p className="mt-1 text-sm text-gray-400">
          Choose a new password for your account
        </p>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="text-sm font-medium text-gray-700"
        >
          New Password
        </label>
        <input
          type="password"
          id="password"
          {...register("password")}
          placeholder="••••••••"
          className="h-10 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-blue-300 focus:ring-2 focus:ring-blue-500/10"
        />
        {errors.password && (
          <p className="text-xs text-blue-500 mt-1">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="confirmPassword"
          className="text-sm font-medium text-gray-700"
        >
          Confirm New Password
        </label>
        <input
          type="password"
          id="confirmPassword"
          {...register("confirmPassword")}
          placeholder="••••••••"
          className="h-10 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-blue-300 focus:ring-2 focus:ring-blue-500/10"
        />
        {errors.confirmPassword && (
          <p className="text-xs text-blue-500 mt-1">{errors.confirmPassword.message}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        <Link href="/login" className="text-sm text-gray-400 transition-colors hover:text-blue-500">
          Back to Login
        </Link>
        <Link
          href="/request-password-reset"
          className="text-sm text-gray-400 transition-colors hover:text-blue-500"
        >
          Request another reset email
        </Link>
      </div>

      <button
        type="submit"
        className="h-11 w-full rounded-xl bg-blue-500 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-600 hover:shadow-blue-600/30 disabled:opacity-60"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Updating password..." : "Reset Password"}
      </button>
    </form>
  );
}
