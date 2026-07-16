"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, ShoppingBag } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-1.5">
          <div className="flex items-center">
            <span className="text-xl font-extrabold tracking-tight text-gray-900">
              Get
            </span>
            <span className="text-xl font-light tracking-tight text-blue-500">
              Gadget
            </span>
          </div>
          <span className="ml-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-500 transition group-hover:bg-blue-100">
            Store
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "text-blue-500"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {link.label}
              {isActive(link.href) && (
                <span className="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-blue-500" />
              )}
            </Link>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          <button className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-cyan-50 hover:text-cyan-600">
            <ShoppingBag className="h-4 w-4" />
          </button>
          <Link
            href="/login"
            className="rounded-full bg-blue-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-600 hover:shadow-blue-600/30"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-full border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 transition-all hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/50"
          >
            Sign up
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-700 md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-72 border-l border-gray-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <span className="text-lg font-bold text-gray-900">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="text-gray-400 hover:text-gray-900">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "bg-blue-50 text-blue-500"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="mt-8 flex flex-col gap-3 border-t border-gray-200 pt-8">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="rounded-full bg-blue-500 py-3 text-center text-sm font-semibold text-white shadow-lg transition-all hover:bg-blue-600"
              >
                Log in
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="rounded-full border border-gray-300 py-3 text-center text-sm font-semibold text-gray-700 transition-all hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/50"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
