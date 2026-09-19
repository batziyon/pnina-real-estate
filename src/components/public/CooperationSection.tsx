/**
 * Cooperation Section
 * Professional B2B call-to-action
 */

import Link from "next/link";

export function CooperationSection() {
  return (
    <section className="bg-[#135C87] py-16 lg:py-20" dir="rtl">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-[2px] bg-[#D9822B]" />
            <span className="text-white/70 text-sm font-semibold tracking-wider uppercase">
              שיתוף פעולה
            </span>
            <div className="w-8 h-[2px] bg-[#D9822B]" />
          </div>

          <h2 className="text-3xl lg:text-4xl font-bold text-white leading-tight mb-4">
            מעוניינים בשיתוף פעולה מקצועי?
          </h2>

          <p className="text-lg text-white/80 leading-relaxed mb-8 max-w-2xl mx-auto">
            שיתופי פעולה עם משרדי תיווך, יזמים ומשקיעים — דרך ליווי מדויק, 
            תיאום ציפיות וחשיפה נכונה של נכסים.
          </p>

          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-[#D9822B] hover:bg-[#c4721f] transition-colors"
          >
            בואו נדבר
          </Link>
        </div>
      </div>
    </section>
  );
}
