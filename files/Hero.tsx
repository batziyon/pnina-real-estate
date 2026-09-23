/**
 * Hero Section
 * Modern, bold hero with strong typography and clean geometry
 */

import Link from "next/link";

export function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-[#135C87] to-[#0f4a6e] overflow-hidden" dir="rtl">
      {/* Main Container */}
      <div className="mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 min-h-[85vh] lg:min-h-[75vh]">
          
          {/* Left Side - Content */}
          <div className="flex flex-col justify-center px-6 lg:px-12 py-16 lg:py-20">
            <div className="max-w-xl">
              {/* Brand Identifier */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-[2px] bg-[#D9822B]" />
                <span className="text-white/90 text-sm font-medium tracking-wider">
                  פנינה נדל״ן
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1] mb-6">
                נדל״ן בירושלים
                <span className="block mt-2 text-white/90">שמדבר בשבילכם</span>
              </h1>

              {/* Supporting Text */}
              <p className="text-lg lg:text-xl text-white/80 leading-relaxed mb-10 max-w-lg">
                תיווך מקצועי, שיווק חכם ויזמות אמיתית. 
                אנחנו כאן כדי למצוא לכם את הנכס המושלם בלב ירושלים.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/properties"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-[#D9822B] hover:bg-[#c4721f] transition-all shadow-lg shadow-[#D9822B]/20"
                >
                  חפשו נכס
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white border-2 border-white/30 hover:border-white hover:bg-white/10 transition-all"
                >
                  רוצים למכור?
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="mt-16 pt-8 border-t border-white/20">
                <div className="text-3xl font-bold text-white">10+</div>
                <div className="text-sm text-white/70 mt-1">שנות ניסיון</div>
              </div>
            </div>
          </div>

          {/* Right Side - Visual Element */}
          {/* TODO: This is a placeholder treatment. Replace with a real photo the moment one is
              available — a Jerusalem streetscape, a hero property, or a portrait of Pnina.
              Swap the motif <div> below for:
              <Image src="/images/jerusalem-hero.jpg" alt="ירושלים" fill priority className="object-cover" /> */}
          <div className="relative bg-[#123F5A] hidden lg:block overflow-hidden">
            {/* Architectural arch motif — evokes Jerusalem stone windows, not a tech grid */}
            <svg
              className="absolute inset-0 h-full w-full opacity-[0.07]"
              viewBox="0 0 400 500"
              preserveAspectRatio="xMidYMid slice"
              fill="none"
            >
              <defs>
                <pattern id="jlm-arches" width="140" height="180" patternUnits="userSpaceOnUse">
                  <path
                    d="M20 180V90a50 50 0 0 1 100 0v90"
                    stroke="#F7F4EE"
                    strokeWidth="3"
                  />
                </pattern>
              </defs>
              <rect width="400" height="500" fill="url(#jlm-arches)" />
            </svg>

            {/* Warm stone-toned corner accent instead of a glowing gradient block */}
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#D9822B]" />
            <div className="absolute bottom-0 left-0 w-40 h-40 border-t border-r border-[#123F5A]/40" />
          </div>
        </div>
      </div>

      {/* Bottom Accent Line */}
      <div className="absolute bottom-0 right-0 left-0 h-1 bg-[#D9822B]" />
    </section>
  );
}
