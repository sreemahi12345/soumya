"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const navLinks = [
    { href: "#collection", label: "Catalog" },
    { href: "#about", label: "Our Story" },
    { href: "#contact", label: "Reach Us" },
  ];

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav
      className={`w-full px-4 sm:px-6 flex justify-between items-center sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-md shadow-teal-100/60 py-3"
          : "bg-white/85 backdrop-blur-sm shadow-sm py-4"
      }`}
    >
      <Link href="/" className="text-xl sm:text-2xl font-bold tracking-tight transition-colors duration-200 !no-underline">
        <span className="text-teal-800">Sree</span>{" "}
        <span className="text-teal-600 italic">Mahi</span>
      </Link>

      <button
        type="button"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((prev) => !prev)}
        className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-teal-200 text-teal-700 hover:bg-teal-50 transition-colors"
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      <ul className="hidden md:flex gap-1 items-center text-sm font-medium">
        {navLinks.map(({ href, label }) => (
          <li key={href}>
            <a
              href={href}
              className="relative px-4 py-2 rounded-full text-teal-800 hover:text-teal-600 hover:bg-teal-50 transition-all duration-200 group !no-underline"
            >
              {label}
              <span className="absolute bottom-0.5 left-4 right-4 h-0.5 bg-teal-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 rounded-full" />
            </a>
          </li>
        ))}
        <li>
          <Link
            href="/admin/login"
            className="ml-3 px-4 py-2 rounded-full border border-teal-200 text-teal-700 hover:bg-teal-600 hover:text-white hover:border-teal-600 transition-all duration-200 text-sm font-semibold !no-underline"
          >
            Admin
          </Link>
        </li>
      </ul>

      {menuOpen && (
        <div className="absolute inset-x-0 top-full md:hidden border-t border-teal-100 bg-white/95 backdrop-blur-md shadow-lg px-4 py-4">
          <ul className="flex flex-col gap-2 text-sm font-medium">
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <a
                  href={href}
                  onClick={closeMenu}
                  className="block rounded-xl px-4 py-3 text-teal-800 hover:bg-teal-50 !no-underline"
                >
                  {label}
                </a>
              </li>
            ))}
            <li>
              <Link
                href="/admin/login"
                onClick={closeMenu}
                className="block rounded-xl border border-teal-200 px-4 py-3 text-center font-semibold text-teal-700 hover:bg-teal-600 hover:text-white !no-underline"
              >
                Admin
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}