"use client";

/**
 * Public Header Component
 * 
 * Premium, restrained header for public-facing website
 * Features: Logo, Navigation, Mobile Menu, CTA
 */

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "דף הבית", href: "/" },
  { name: "נכסים", href: "/properties" },
  { name: "פרויקטים", href: "/projects" },
  { name: "קצת עליי", href: "/about" },
  { name: "מעוניינים למכור?", href: "/valuation" },
  { name: "צור קשר", href: "/contact" },
];

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="bg-white border-b border-gray-200">
      <nav className="mx-auto max-w-7xl px-6 py-4 lg:px-8" dir="rtl" aria-label="ניווט ראשי">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/images/pnina-logo.png"
              alt="פנינה נדל״ן"
              width={120}
              height={60}
              priority
              className="h-14 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:gap-x-8">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-base font-medium transition-colors pb-1 ${
                    isActive
                      ? "text-[#135C87] border-b-2 border-[#135C87]"
                      : "text-gray-700 hover:text-[#135C87]"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* CTA + Mobile Menu Button */}
          <div className="flex items-center gap-x-4">
            <Link
              href="/contact"
              className="hidden sm:inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-[#D9822B] hover:bg-[#c4721f] transition-colors"
            >
              דברו איתי
            </Link>

            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden inline-flex items-center justify-center p-2 text-gray-700 hover:text-[#135C87] transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="תפריט ניווט"
            >
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-col gap-y-4">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`text-base font-medium transition-colors ${
                      isActive
                        ? "text-[#135C87] font-semibold"
                        : "text-gray-700 hover:text-[#135C87]"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                );
              })}
              <Link
                href="/contact"
                className="mt-2 inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white bg-[#D9822B] hover:bg-[#c4721f] transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                דברו איתי
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
