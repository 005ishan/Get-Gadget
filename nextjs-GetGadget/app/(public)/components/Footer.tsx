import Link from "next/link";
import { Twitter, Github, Linkedin, Mail, MapPin } from "lucide-react";

const footerLinks = {
  shop: [
    { label: "Audio", href: "/auth/category/audio" },
    { label: "Charging", href: "/auth/category/charging" },
    { label: "Accessories", href: "/auth/category/accessories" },
    { label: "New Arrivals", href: "/auth/dashboard" },
  ],
  support: [
    { label: "Contact", href: "/contact" },
    { label: "FAQ", href: "/about" },
    { label: "Shipping", href: "/about" },
    { label: "Returns", href: "/about" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/about" },
    { label: "Careers", href: "/about" },
    { label: "Press", href: "/about" },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "https://x.com/Ishanboy05", label: "Twitter" },
  { icon: Github, href: "https://github.com/005ishan/nextjs-jerseypasal.git", label: "GitHub" },
  { icon: Linkedin, href: "https://www.linkedin.com/in/ishan-dhami-2799a9292/", label: "LinkedIn" },
  { icon: Mail, href: "mailto:contact@getgadget.com", label: "Email" },
];

export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main grid */}
        <div className="grid grid-cols-2 gap-10 py-16 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1 lg:col-span-2">
            <Link href="/" className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-gray-900">
                Get
              </span>
              <span className="text-xl font-light tracking-tight text-blue-500">
                Gadget
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-gray-500">
              Premium gadget accessories for your everyday tech. Crystal-clear
              audio, lightning-fast charging, and ultimate protection.
            </p>
            <div className="mt-6 flex items-center gap-1 text-sm text-gray-400">
              <MapPin className="h-3.5 w-3.5" />
              <span>Nepal</span>
            </div>
          </div>

          {/* Link columns */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
              Shop
            </h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 transition-colors hover:text-blue-500"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
              Support
            </h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 transition-colors hover:text-blue-500"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 transition-colors hover:text-blue-500"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter CTA */}
        <div className="mb-10 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 p-8">
          <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                Stay in the loop
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get early access to new drops, exclusive deals, and tech tips.
              </p>
            </div>
            <div className="flex w-full max-w-md gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-blue-300 focus:ring-2 focus:ring-blue-500/10"
              />
              <button className="rounded-full bg-blue-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-600 hover:shadow-blue-600/30">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center gap-4 border-t border-gray-200 py-8 sm:flex-row sm:justify-between">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} GetGadget. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition-all hover:border-blue-300 hover:text-blue-500 hover:shadow-lg hover:shadow-blue-500/10"
                aria-label={social.label}
              >
                <social.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
