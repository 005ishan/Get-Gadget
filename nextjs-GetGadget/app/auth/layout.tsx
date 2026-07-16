"use client";

import Header from "./components/Header";
import { CartFavProvider } from "@/context/CartFavContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartFavProvider>
      <div className="min-h-screen bg-gray-50/50">
        <Header />

        <main>
          {children}
          </main>
      </div>
    </CartFavProvider>
  );
}
