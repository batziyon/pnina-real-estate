/**
 * Public Footer Component
 * 
 * Simple, premium footer for public website
 */

import Link from "next/link";
import Image from "next/image";

const navigation = {
  main: [
    { name: "נכסים", href: "/properties" },
    { name: "פרויקטים", href: "/projects" },
    { name: "קצת עליי", href: "/about" },
    { name: "המלצות", href: "/testimonials" },
    { name: "צור קשר", href: "/contact" },
  ],
};

export function PublicFooter() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {/* Logo and Brand */}
        <div className="mb-8">
          <Link href="/" className="inline-block">
            <Image
              src="/images/pnina-logo.jpg"
              alt="פנינה נדל״ן"
              width={120}
              height={60}
              className="h-12 w-auto"
            />
          </Link>
          <p className="mt-3 text-base text-gray-600">
            תיווך · שיווק · יזמות
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="mb-8" aria-label="ניווט תחתון">
          <ul className="flex flex-wrap gap-x-8 gap-y-3">
            {navigation.main.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className="text-sm text-gray-600 hover:text-[#135C87] transition-colors"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Copyright */}
        <div className="border-t border-gray-200 pt-8">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} פנינה נדל״ן. כל הזכויות שמורות.
          </p>
        </div>
      </div>
    </footer>
  );
}
