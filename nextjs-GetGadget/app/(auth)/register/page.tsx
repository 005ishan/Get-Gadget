"use client";

import RegisterForm from "../_components/RegisterForm";

export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-2xl font-bold tracking-tight text-gray-900">
          Create an account
        </p>
        <p className="mt-1 text-sm text-gray-400">
          Join GetGadget and start shopping
        </p>
      </div>

      <RegisterForm />
    </div>
  );
}
