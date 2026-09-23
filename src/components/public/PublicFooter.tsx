/**
 * Public Footer Component
 * Clean, professional footer for Pnina Real Estate
 */

import Link from "next/link";

const navigation = {
  main: [
    { name: "דף הבית", href: "/" },
    { name: "נכסים", href: "/properties" },
    { name: "פרויקטים", href: "/projects" },
    { name: "קצת עליי", href: "/about" },
    { name: "צור קשר", href: "/contact" },
  ],
};

export function PublicFooter() {
  return (
    <footer className="bg-[#18384C]" dir="rtl">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* Main Footer Content */}
        <div className="py-12 lg:py-16">
          <div className="grid gap-12 lg:grid-cols-3">
            
            {/* Brand Column */}
            <div className="lg:col-span-1">
              <div className="mb-4">
                <div className="text-2xl font-bold text-white mb-2">פנינה נדל״ן</div>
                <div className="text-sm text-white/70">תיווך · שיווק · יזמות</div>
              </div>
              <p className="text-sm text-white/70 leading-relaxed">
                תיווך, שיווק ויזמות נדל״ן בירושלים<br />
                ליווי אישי, מחויבות לתוצאה ומקצועיות בכל שלב
              </p>
            </div>

            {/* Navigation Column */}
            <div className="lg:col-span-1">
              <h3 className="text-sm font-semibold text-white mb-4">ניווט מהיר</h3>
              <ul className="space-y-2">
                {navigation.main.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-white/70 hover:text-white transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Column */}
            <div className="lg:col-span-1">
              <h3 className="text-sm font-semibold text-white mb-4">יצירת קשר</h3>
              <div className="space-y-3">
                <div className="text-sm text-white/70">
                  <div className="font-medium text-white mb-1">מיקום</div>
                  <div>ירושלים</div>
                </div>
                <Link 
                  href="/contact" 
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#D9822B] hover:text-[#c4721f] transition-colors"
                >
                  <span>צרו קשר →</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/60">
            <div>
              © {new Date().getFullYear()} פנינה נדל״ן. כל הזכויות שמורות.
            </div>
            <div>
              עוצב ונבנה בירושלים
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
