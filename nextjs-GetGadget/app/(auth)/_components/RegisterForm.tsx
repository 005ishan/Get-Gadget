  "use client";

  import { useRouter } from "next/navigation";
  import { useState, useTransition } from "react";
  import { useForm } from "react-hook-form";
  import { registerSchema, RegisterData } from "../schema";
  import { zodResolver } from "@hookform/resolvers/zod";
  import Link from "next/link";
  import { handleRegister } from "@/lib/actions/auth-action";
  import { AppToast } from "@/lib/toast";

  export default function RegisterForm() {
    const router = useRouter();
    const [pending, startTransition] = useTransition();
    const [serverError, setServerError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
      register,
      handleSubmit,
      reset,
      formState: { errors, isSubmitting },
    } = useForm<RegisterData>({
      resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (values: RegisterData) => {
      setServerError(null);

      try {
        const promise = handleRegister(values);

        const response = await AppToast.promise(promise, {
          loading: "Creating your account...",
          success: "Account created successfully",
          error: "Registration failed",
        });

        if (response.success) {
          reset();

          setTimeout(() => {
            router.push("/login");
          }, 900);
        } else {
          setServerError(response.message ?? "Something went wrong.");
        }
      } catch (err: any) {
        AppToast.error(err.message ?? "Something went wrong.");
      }
    };

    const loading = isSubmitting || pending;

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {serverError && <p className="text-sm text-red-500">{serverError}</p>}

        {/* EMAIL */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="yourmail@example.com"
            className="h-10 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-blue-300 focus:ring-2 focus:ring-blue-500/10"
            {...register("email")}
          />
          {errors.email?.message && (
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
              placeholder="••••••••••"
              className="h-10 w-full rounded-xl border border-gray-200 bg-white px-4 pr-12 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-blue-300 focus:ring-2 focus:ring-blue-500/10"
              {...register("password")}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-700"
              onClick={() => setShowPassword((p) => !p)}
              tabIndex={-1}
            >
              {showPassword ? (
                <img src="/icons/eyeclosed.svg" className="h-4 w-4" alt="Hide" />
              ) : (
                <img src="/icons/eye.svg" className="h-4 w-4" alt="Show" />
              )}
            </button>
          </div>
          {errors.password?.message && (
            <p className="text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        {/* CONFIRM PASSWORD */}
        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••••"
              className="h-10 w-full rounded-xl border border-gray-200 bg-white px-4 pr-12 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-blue-300 focus:ring-2 focus:ring-blue-500/10"
              {...register("confirmPassword")}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-700"
              onClick={() => setShowConfirmPassword((p) => !p)}
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <img src="/icons/eyeclosed.svg" className="h-4 w-4" alt="Hide" />
              ) : (
                <img src="/icons/eye.svg" className="h-4 w-4" alt="Show" />
              )}
            </button>
          </div>
          {errors.confirmPassword?.message && (
            <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* REGISTER BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="h-11 w-full rounded-xl bg-blue-500 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-600 hover:shadow-blue-600/30 disabled:opacity-60 mt-2 flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          )}
          {loading ? "Creating account..." : "Sign up"}
        </button>

        {/* LOGIN LINK */}
        <p className="text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-blue-500 transition-colors hover:text-blue-600">
            Login here
          </Link>
        </p>
      </form>
    );
  }
