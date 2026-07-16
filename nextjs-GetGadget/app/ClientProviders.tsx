"use client";

import { AuthProvider } from "@/context/AuthContext";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      {children}

      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
        transition={Slide}
        toastClassName="rounded-xl shadow-lg"
        className="text-sm font-medium"
      />
    </AuthProvider>
  );
}
