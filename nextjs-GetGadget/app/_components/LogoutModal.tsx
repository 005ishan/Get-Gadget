"use client";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

function LogoutModal({ isOpen, onClose, onConfirm }: { isOpen: boolean; onClose: () => void; onConfirm: () => void; }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blurred background */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg p-6 w-80 shadow-xl z-10">
        <h3 className="text-xl font-semibold mb-4 cursor-pointer">Logout</h3>
        <p className="mb-6">Are you sure you want to logout?</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function Header() {
  const { logout, user } = useAuth();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    try {
      logout();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch {
      toast.error("Failed to logout");
    } finally {
      setIsLogoutOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-gray-900 border-b border-gray-800">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-orange-500 text-white font-semibold">A</span>
            <span className="text-base font-semibold tracking-tight text-white">Admin Panel</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-gray-300">{user?.email || "Admin"}</div>
            <button
              onClick={() => setIsLogoutOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-gray-800 hover:bg-orange-500 hover:text-white text-gray-200 transition-colors text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Logout Modal Portal */}
      <LogoutModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={handleLogout}
      />
    </header>
  );
}
