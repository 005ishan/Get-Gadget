"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

function LogoutModal({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Background */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white border border-gray-200 text-gray-900 rounded-xl p-6 w-80 shadow-2xl z-10">
        <h3 className="text-lg font-semibold mb-3">Confirm Logout</h3>
        <p className="text-sm text-gray-500 mb-6">
          Are you sure you want to logout?
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white transition cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function Header() {
  const { logout, user } = useAuth();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    try {
      logout(); // Call your auth context logout
      toast.success("Logged out successfully");
      router.push("/login"); // Redirect to login page
    } catch (err) {
      toast.error("Failed to logout");
    } finally {
      setIsLogoutOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-white border-b border-gray-200">
      <nav
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-label="Global"
      >
        <div className="flex h-16 items-center justify-between">
          {/* Left: Logo & Title */}
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2 group">
              <span className="text-base font-semibold tracking-tight text-gray-900 group-hover:opacity-80 transition-opacity">
                Admin Panel
              </span>
            </Link>
          </div>

          {/* Right: User info & Logout */}
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-gray-500">
              {user?.email || "Admin"}
            </div>
            <button
              onClick={() => setIsLogoutOpen(true)}
              className="rounded-full bg-blue-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-600 hover:shadow-blue-600/30 cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Logout Modal */}
      <LogoutModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={handleLogout}
      />
    </header>
  );
}
