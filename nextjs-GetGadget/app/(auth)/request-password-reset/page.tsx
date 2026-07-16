"use client";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { requestPasswordReset } from "@/lib/api/auth";
import { toast } from "react-toastify";
export const RequestPasswordResetSchema = z.object({
  email: z.email(),
});

export type RequestPasswordResetDTO = z.infer<
  typeof RequestPasswordResetSchema
>;
export default function Page() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RequestPasswordResetDTO>({
    resolver: zodResolver(RequestPasswordResetSchema),
  });
  const onSubmit = async (data: RequestPasswordResetDTO) => {
    try {
      const response = await requestPasswordReset(data.email);
      if (response.success) {
        toast.success("Password reset link sent to your email.");
      } else {
        toast.error(response.message || "Failed to request password reset.");
      }
    } catch (error) {
      toast.error(
        (error as Error).message || "Failed to request password reset.",
      );
    }
  };
  return (
    <div className="space-y-4">
      <div className="mb-6">
        <p className="text-2xl font-bold tracking-tight text-gray-900">
          Reset your password
        </p>
        <p className="mt-1 text-sm text-gray-400">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            {...register("email")}
            placeholder="yourmail@example.com"
            className="h-10 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-blue-300 focus:ring-2 focus:ring-blue-500/10"
          />
          {errors.email && (
            <p className="text-xs text-blue-500 mt-1">{errors.email.message}</p>
          )}
        </div>
        <button
          type="submit"
          className="h-11 w-full rounded-xl bg-blue-500 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-600 hover:shadow-blue-600/30 disabled:opacity-60"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
}
