/**
 * Valuation CTA Section
 * Bold, asymmetric call-to-action for property valuation
 */

import Link from "next/link";

export function ValuationCTA() {
  return (
    <section className="bg-[#123F5A] py-20 lg:py-28" dir="rtl">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-12 items-center">
          
          {/* Content */}
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-16 h-[3px] bg-[#D9822B]" />
              <span className="text-white/70 text-sm font-semibold tracking-wider uppercase">
                הערכת שווי
              </span>
            </div>

            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
              חושבים למכור?
              <span className="block mt-2 text-white/90">בואו נתחיל בהערכה מקצועית</span>
            </h2>

            <p className="text-lg text-white/70 leading-relaxed mb-8 max-w-xl">
              קבלו הערכת שווי מדויקת ומקצועית לנכס שלכם, מבוססת על ניתוח שוק עדכני, מגמות מקומיות ופוטנציאל אמיתי.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-[#D9822B] hover:bg-[#c4721f] transition-colors"
              >
                לקבלת הערכת שווי
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white border-2 border-white/30 hover:border-white hover:bg-white/10 transition-all"
              >
                יש לכם שאלות?
              </Link>
            </div>
          </div>

          {/* Visual Element */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative w-full max-w-sm">
              {/* Geometric decoration */}
              <div className="aspect-square bg-[#135C87] relative">
                <div className="absolute inset-0 border-2 border-white/10" />
                <div className="absolute top-8 right-8 bottom-8 left-8 border-2 border-white/10" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-white mb-2">100%</div>
                    <div className="text-white/70 text-sm tracking-wider">התאמה אישית</div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#D9822B]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
