/**
 * Hero Section
 * 
 * Premium hero for Pnina Real Estate homepage
 * Clean, professional composition with strong typography and real photography
 */

import Link from "next/link";
import Image from "next/image";

export function Hero() {
  return (
    <section className="relative bg-[#135C87] text-white overflow-hidden" dir="rtl">
      <div className="mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[70vh] lg:min-h-[80vh]">
          
          {/* Right: Text Content (RTL - appears on right) */}
          <div className="px-6 lg:px-8 py-16 lg:py-20 order-2 lg:order-1 text-center lg:text-right">
            {/* Brand line - WHITE */}
            <p className="text-sm md:text-base font-medium text-white tracking-wide mb-8">
              תיווך · שיווק · יזמות
            </p>

            {/* Main Headline - WHITE and BOLD */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-6 leading-[1.15] text-white">
              הבית הבא שלכם
              <br />
              מתחיל בירושלים.
            </h1>

            {/* Supporting Text - WHITE */}
            <p className="text-lg sm:text-xl text-white mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              נכסים ופרויקטים נבחרים בירושלים, עם ליווי אישי ומקצועי לאורך כל הדרך.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-end">
              <Link
                href="/properties"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-[#D9822B] hover:bg-[#c4721f] transition-all shadow-lg hover:shadow-xl"
              >
                לנכסים למכירה
              </Link>
              <Link
                href="/properties?type=rent"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all border border-white/30"
              >
                לנכסים להשכרה
              </Link>
            </div>
          </div>

          {/* Left: Visual Area (RTL - appears on left) */}
          <div className="relative order-1 lg:order-2 px-6 lg:px-0 lg:pr-8 py-8 lg:py-16">
            {/* Main visual container - Real Jerusalem architecture photography */}
            <div className="relative aspect-[4/5] lg:aspect-[3/4] rounded-lg overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1601563557211-2c73f3bec71e?q=80&w=1200&auto=format&fit=crop"
                alt="אדריכלות יוקרתית בירושלים"
                fill
                className="object-cover"
                priority
                unoptimized
              />
            </div>
          </div>

        </div>
      </div>

      {/* Subtle bottom transition */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/20 to-transparent pointer-events-none" />
    </section>
  );
}
