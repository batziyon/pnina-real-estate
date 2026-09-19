/**
 * About Page
 * Professional, personal page with clean design
 */

import { PublicHeader, PublicFooter } from "@/components/public";
import Link from "next/link";

export const metadata = {
  title: "קצת עליי | פנינה נדל״ן",
  description: "פנינה נדל״ן - תיווך, שיווק ויזמות בירושלים",
};

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white" dir="rtl">
      <PublicHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-[#135C87] py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-16 h-[3px] bg-white" />
                <span className="text-white text-sm font-semibold tracking-wider uppercase">
                  אודות
                </span>
              </div>
              
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-5">
                קצת עליי
              </h1>
              
              <p className="text-xl text-white/90 leading-relaxed">
                פנינה נדל״ן — תיווך, שיווק ויזמות בירושלים, עם גישה מקצועית, אנושית ומדויקת.
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
              
              {/* Image */}
              <div className="order-2 lg:order-1">
                <div className="relative aspect-[3/4] bg-gradient-to-br from-[#e8dcc8] to-[#d4c4a8] overflow-hidden">
                  {/* Jerusalem professional real estate background */}
                  <div className="absolute inset-0 flex items-center justify-center text-[#8b7355] text-sm">
                    תיווך נדל״ן מקצועי בירושלים
                  </div>
                </div>

                {/* Accent */}
                <div className="mt-8 bg-[#F7F4EE] p-6">
                  <div className="text-sm font-bold text-[#135C87] tracking-wider mb-2 uppercase">
                    ירושלים
                  </div>
                  <div className="text-base text-[#18384C]/70">
                    עובדת בירושלים ומתמחה בשכונות המרכזיות והמבוקשות ביותר בעיר.
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="order-1 lg:order-2">
                <h2 className="text-3xl lg:text-4xl font-bold text-[#18384C] leading-tight mb-6">
                  נעים להכיר, אני פנינה
                </h2>

                <div className="space-y-5 text-base lg:text-lg text-[#18384C]/70 leading-relaxed mb-10">
                  <p>
                    מתמחה בתיווך, שיווק ויזמות נדל״ן בירושלים, ומלווה לקוחות בתהליך של קנייה, מכירה והשקעה עם תשומת לב מלאה לפרטים.
                  </p>
                  <p>
                    ההבנה של המרחב העירוני, השכונות, המגמות והפוטנציאל של כל נכס מאפשרת לי לייצר החלטות טובות יותר, מבוססות נתונים ואינטרסים אמיתיים.
                  </p>
                  <p>
                    הגישה שלי נבנית על אמון, מקצועיות, ריכוז ויכולת לתרגם חזון למימוש — גם כשהלקוח מחפש נכס לטווח ארוך, וגם כשהוא מחפש עסקה שמרגישה נכונה מיד.
                  </p>
                </div>

                {/* Services Grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-10">
                  <div className="bg-[#F7F4EE] p-6">
                    <h3 className="text-xl font-bold text-[#135C87] mb-3">תיווך</h3>
                    <p className="text-sm text-[#18384C]/70 leading-relaxed">
                      ליווי מקצועי בקנייה ומכירה של נכסים איכותיים
                    </p>
                  </div>
                  
                  <div className="bg-[#F7F4EE] p-6">
                    <h3 className="text-xl font-bold text-[#135C87] mb-3">שיווק</h3>
                    <p className="text-sm text-[#18384C]/70 leading-relaxed">
                      הצגה נכונה, קמפיינים ממוקדים והגעה לקהל מתאים
                    </p>
                  </div>
                  
                  <div className="bg-[#F7F4EE] p-6">
                    <h3 className="text-xl font-bold text-[#135C87] mb-3">יזמות</h3>
                    <p className="text-sm text-[#18384C]/70 leading-relaxed">
                      חשיבה על השקעה, פרויקטים ומרחבים עם פוטנציאל
                    </p>
                  </div>
                </div>

                {/* CTA */}
                <div className="bg-[#135C87] p-8 text-center">
                  <h3 className="text-2xl font-bold text-white mb-3">בואו נדבר</h3>
                  <p className="text-base text-white/90 mb-6 leading-relaxed">
                    מעוניינים במידע נוסף או בזיהוי נכס שיתאים לכם?
                  </p>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-[#D9822B] hover:bg-[#c4721f] transition-colors"
                  >
                    צרו קשר
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
