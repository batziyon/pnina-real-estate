/**
 * About Section - Public Homepage
 * Split layout with asymmetric composition and warm tones
 */

import Link from "next/link";

export function AboutSection() {
  return (
    <section className="bg-gradient-to-br from-[#f9f7f4] to-[#f5f0e8] py-20 lg:py-28" dir="rtl">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Right - Content */}
          <div className="order-2 lg:order-1">
            <div className="max-w-xl">
              {/* Section Label */}
              <div className="text-sm font-bold text-[#D9822B] tracking-wider mb-4 uppercase">
                קצת עליי
              </div>

              {/* Heading */}
              <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-[#18384C] leading-tight mb-6">
                נעים להכיר,
                <span className="block mt-1">אני פנינה</span>
              </h2>

              {/* Content */}
              <div className="space-y-5 text-base lg:text-lg text-[#18384C]/70 leading-relaxed mb-8">
                <p>
                  מתמחה בתיווך, שיווק ויזמות נדל״ן בירושלים, עם עומק של הבנה בשכונות השונות, ממגמות השוק ועד לניואנסים של כל נכס.
                </p>
                <p>
                  אני מאמינה שכל עסקה צריכה להיות מבוצעת מתוך קצב מסודר, שמיעה אמיתית לצרכי הלקוח וראייה ארוכת טווח של הפוטנציאל.
                </p>
                <p>
                  הליווי שאני נותנת כולל תיאום, אסטרטגיית מכירה, שיווק ממוקד, ויחס אישי בכל שלב של התהליך.
                </p>
              </div>

              {/* CTA */}
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#135C87] hover:bg-[#123F5A] transition-colors"
              >
                <span>קראו עוד עליי</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Left - Visual */}
          <div className="order-1 lg:order-2">
            <div className="relative">
              {/* Main Image Area */}
              <div className="relative aspect-[3/4] bg-gradient-to-br from-[#e8dcc8] via-[#d9cdb8] to-[#c9bba8] overflow-hidden">
                {/* Placeholder - Replace with actual photo */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-[#8b7355] text-sm">תמונה של פנינה</div>
                </div>
                
                {/* TODO: Add actual image
                <Image
                  src="/images/pnina-about.jpg"
                  alt="פנינה - מתווכת נדל״ן"
                  fill
                  className="object-cover"
                />
                */}
              </div>

              {/* Accent Element */}
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[#D9822B] opacity-90" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
