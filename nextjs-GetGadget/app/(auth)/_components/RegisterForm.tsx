  "use client";

  import { useRouter } from "next/navigation";
  import { useState, useTransition } from "react";
  import { useForm } from "react-hook-form";
  import { registerSchema, RegisterData } from "../schema";
  import { zodResolver } from "@hookform/resolvers/zod";
  import Link from "next/link";
  import { handleRegister } from "@/lib/actions/auth-action";
  import { AppToast } from "@/lib/toast";
  import { getCaptchaToken } from "@/lib/captcha";

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
      watch,
      formState: { errors, isSubmitting },
    } = useForm<RegisterData>({
      resolver: zodResolver(registerSchema),
    });

    const watchPassword = watch("password", "");

    const onSubmit = async (values: RegisterData) => {
      setServerError(null);

      try {
        const captchaToken = await getCaptchaToken("register");
        const valuesWithCaptcha = { ...values, captchaToken };
        const promise = handleRegister(valuesWithCaptcha);

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

    // Password strength visual indicator (6 criteria: length, uppercase, lowercase, number, special, 12+ chars)
    const getPasswordStrength = (pwd: string): { score: number; label: string; color: string } => {
      if (!pwd) return { score: 0, label: "", color: "bg-gray-200" };
      let score = 0;
      if (pwd.length >= 8) score++;
      if (/[A-Z]/.test(pwd)) score++;
      if (/[a-z]/.test(pwd)) score++;
      if (/[0-9]/.test(pwd)) score++;
      if (/[^A-Za-z0-9]/.test(pwd)) score++;
      if (pwd.length >= 12) score++;
      const labels = ["", "Weak", "Fair", "Good", "Strong", "Very Strong", "Excellent"];
      const colors = ["bg-gray-200", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-lime-400", "bg-green-400", "bg-emerald-500"];
      return { score, label: labels[score], color: colors[score] };
    };

    const strength = getPasswordStrength(watchPassword);

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
          {/* Password Strength Bar */}
          {watchPassword && (
            <div className="space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5, 6].map((level) => (
                  <div
                    key={level}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      level <= strength.score ? strength.color : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
              {strength.label && (
                <p className="text-xs text-gray-500">
                  Strength: <span className="font-medium">{strength.label}</span>
                </p>
              )}
            </div>
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
