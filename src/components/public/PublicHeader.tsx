"use client";

/**
 * Public Header Component
 * Professional, clean header for Pnina Real Estate
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
  { name: "מעוניינים למכור?", href: "/contact" },
  { name: "צור קשר", href: "/contact" },
];

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="bg-white border-b border-gray-200">
      <nav className="mx-auto max-w-7xl px-6 lg:px-8 h-[72px] flex items-center" dir="rtl">
        <div className="flex items-center justify-between w-full">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/images/pnina-logo.png"
              alt="פנינה נדל״ן"
              width={90}
              height={45}
              priority
              className="h-10 w-auto transition-opacity group-hover:opacity-80"
            />
            <div className="hidden sm:block border-r border-gray-300 pr-3 mr-3">
              <div className="text-[#18384C] font-semibold text-sm leading-tight">פנינה נדל״ן</div>
              <div className="text-[#135C87] text-xs">תיווך · שיווך · יזמות</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium transition-colors relative ${
                    isActive
                      ? "text-[#135C87]"
                      : "text-[#18384C] hover:text-[#135C87]"
                  }`}
                >
                  {item.name}
                  {isActive && (
                    <div className="absolute -bottom-[21px] right-0 left-0 h-[2px] bg-[#D9822B]" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* CTA + Mobile Menu */}
          <div className="flex items-center gap-4">
            <Link
              href="/contact"
              className="hidden lg:inline-flex items-center px-5 py-2 text-sm font-semibold text-white bg-[#D9822B] hover:bg-[#c4721f] transition-colors"
            >
              דברו איתי
            </Link>

            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden inline-flex items-center justify-center p-2 text-[#18384C] hover:text-[#135C87] transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="תפריט ניווט"
            >
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed top-[72px] right-0 left-0 bg-white border-t border-gray-200 shadow-xl z-50">
            <div className="flex flex-col px-6 py-4 max-h-[calc(100vh-72px)] overflow-y-auto">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`py-3 text-base font-medium transition-colors border-b border-gray-100 last:border-0 ${
                      isActive
                        ? "text-[#135C87]"
                        : "text-[#18384C]"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                );
              })}
              <Link
                href="/contact"
                className="mt-4 inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-[#D9822B] hover:bg-[#c4721f] transition-colors"
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
