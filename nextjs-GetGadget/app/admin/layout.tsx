"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Sidebar from "./_components/Sidebar";
import Header from "./_components/Header";
import { useEffect } from "react";

export default function AdminLayout({ children }: any) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Right Side */}
      <div className="md:ml-64 flex flex-col min-h-screen">
        <Header />

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}