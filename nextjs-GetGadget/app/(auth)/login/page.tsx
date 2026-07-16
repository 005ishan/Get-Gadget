"use client";

import LoginForm from "../_components/LoginForm";

export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-2xl font-bold tracking-tight text-gray-900">
          Welcome back
        </p>
        <p className="mt-1 text-sm text-gray-400">
          Log in to your GetGadget account
        </p>
      </div>

      <LoginForm />
    </div>
  );
}
