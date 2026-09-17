/**
 * About Page
 * 
 * About Pnina Real Estate
 */

import { PublicHeader, PublicFooter, Container } from "@/components/public";

export const metadata = {
  title: "קצת עליי | פנינה נדל״ן",
  description: "פנינה נדל״ן - תיווך, שיווק ויזמות בירושלים",
};

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-[#135C87] text-white py-16">
          <Container>
            <div className="max-w-3xl">
              <div className="h-[2px] w-12 bg-[#D9822B] mb-6" />
              <h1 className="text-4xl font-bold mb-4">
                קצת עליי
              </h1>
              <p className="text-xl text-white/90">
                פנינה נדל״ן - תיווך, שיווק ויזמות בירושלים
              </p>
            </div>
          </Container>
        </section>

        {/* Content Section */}
        <section className="py-16 lg:py-20 bg-white">
          <Container>
            <div className="max-w-4xl mx-auto">
              {/* Main Content */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    נעים להכיר, אני פנינה.
                  </h2>
                  
                  <div className="prose prose-lg max-w-none">
                    <p className="text-lg text-gray-700 leading-relaxed mb-4">
                      מתמחה בתיווך, שיווק ויזמות נדל״ן בירושלים.
                    </p>
                    <p className="text-lg text-gray-700 leading-relaxed mb-4">
                      הכרות מעמיקה עם השכונות, השוק המקומי והמאפיינים הייחודיים של כל נכס.
                    </p>
                    <p className="text-lg text-gray-700 leading-relaxed mb-4">
                      ליווי אישי מקצועי לאורך כל תהליך הרכישה או המכירה.
                    </p>
                    <p className="text-lg text-gray-700 leading-relaxed">
                      גישה מקצועית המשלבת ניסיון, מומחיות והכרות עמוקה עם שוק הנדל״ן בירושלים.
                    </p>
                  </div>
                </div>

                {/* Services */}
                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    השירותים שלי
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                      <h4 className="text-lg font-semibold text-[#135C87] mb-3">תיווך</h4>
                      <p className="text-base text-gray-600 leading-relaxed">
                        ליווי מקצועי בקנייה ומכירה של נכסים בירושלים
                      </p>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-[#135C87] mb-3">שיווק</h4>
                      <p className="text-base text-gray-600 leading-relaxed">
                        שיווק נכסים באמצעים מתקדמים וחשיפה מקסימלית
                      </p>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-[#135C87] mb-3">יזמות</h4>
                      <p className="text-base text-gray-600 leading-relaxed">
                        פרויקטי יזמות ושותפויות עסקיות בנדל״ן
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact CTA */}
                <div className="border-t border-gray-200 pt-8">
                  <div className="bg-gray-50 p-8 text-center">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      בואו נדבר
                    </h3>
                    <p className="text-base text-gray-600 mb-6">
                      מעוניינים במידע נוסף או בליווי מקצועי?
                    </p>
                    <a
                      href="/contact"
                      className="inline-block px-8 py-3 text-base font-medium text-white bg-[#135C87] hover:bg-[#0f4a6d] transition-colors"
                    >
                      צרו קשר
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
