/**
 * Contact Section
 * Simple, direct call to action
 */

import Link from "next/link";

export function ContactSection() {
  return (
    <section className="bg-white py-20 lg:py-24" dir="rtl">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="border-2 border-[#135C87] p-8 lg:p-12">
          <div className="max-w-3xl mx-auto text-center">
            
            <h2 className="text-3xl lg:text-4xl font-bold text-[#18384C] leading-tight mb-4">
              יש לכם שאלה? בואו נדבר
            </h2>

            <p className="text-lg text-[#18384C]/70 leading-relaxed mb-8 max-w-2xl mx-auto">
              נשמח לעמוד לרשותכם בכל שאלה, בקשה או תהליך רכישה, מכירה או השקעה. 
              אנחנו כאן כדי להקל על ההחלטה הבאה שלכם.
            </p>

            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-[#135C87] hover:bg-[#123F5A] transition-colors"
            >
              צרו קשר עכשיו
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
