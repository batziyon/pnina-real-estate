/**
 * Public Footer Component
 * Professional footer with strong contrast and readability
 */

import Link from "next/link";

const navigation = {
  main: [
    { name: "דף הבית", href: "/" },
    { name: "נכסים", href: "/properties" },
    { name: "פרויקטים", href: "/projects" },
    { name: "קצת עליי", href: "/about" },
    { name: "הערכת שווי", href: "/contact" },
    { name: "צור קשר", href: "/contact" },
  ],
};

export function PublicFooter() {
  return (
    <footer className="bg-[#18384C] text-white" dir="rtl">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12 lg:py-16">
        
        {/* Main Footer Content */}
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr] mb-12">
          
          {/* Brand Column */}
          <div>
            <div className="mb-6">
              <div className="text-2xl font-bold text-white mb-2">פנינה נדל״ן</div>
              <div className="text-base text-white flex items-center gap-2">
                <span>תיווך</span>
                <span className="text-[#D9822B]">·</span>
                <span>שיווק</span>
                <span className="text-[#D9822B]">·</span>
                <span>יזמות</span>
              </div>
            </div>

            <p className="text-base text-white/80 leading-relaxed max-w-md">
              תיווך, שיווק ויזמות נדל״ן בירושלים — ליווי אישי, מחויבות לתוצאה ומקצועיות בכל שלב.
            </p>
          </div>

          {/* Navigation Column */}
          <div>
            <h3 className="text-sm font-bold text-white mb-4 tracking-wider uppercase">
              ניווט מהיר
            </h3>
            <ul className="space-y-2.5">
              {navigation.main.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-base text-white/80 hover:text-white transition-colors inline-block"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="text-sm font-bold text-white mb-4 tracking-wider uppercase">
              יצירת קשר
            </h3>
            <div className="space-y-3 text-base text-white/80">
              <div>
                <div className="font-semibold text-white mb-1">מיקום</div>
                <div>ירושלים</div>
              </div>
              <div>
                <Link 
                  href="/contact" 
                  className="inline-flex items-center gap-2 text-white font-semibold hover:text-[#D9822B] transition-colors"
                >
                  <span>צרו קשר</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/20">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-white/70">
            <div>
              &copy; {new Date().getFullYear()} פנינה נדל״ן. כל הזכויות שמורות.
            </div>
            <div className="flex items-center gap-1">
              <span>עוצב ונבנה בירושלים</span>
              <span className="text-[#D9822B]">♦</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
