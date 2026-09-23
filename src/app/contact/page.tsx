/**
 * Contact Page
 */

import { PublicHeader, PublicFooter, Container } from "@/components/public";
import { ContactFormsClient } from "@/components/public/ContactFormsClient";

export const metadata = {
  title: "צור קשר | פנינה נדל״ן",
  description: "צרו קשר עם פנינה נדל״ן - נשמח לעזור לכם למצוא את הנכס המושלם בירושלים",
};

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <PublicHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[#135C87] to-[#0f4a6e] py-12 lg:py-16">
          <Container>
            <div className="max-w-3xl">
              <div className="mb-5 h-1 w-16 bg-[#D9822B]" />
              <h1 className="mb-4 text-4xl font-bold leading-tight text-white lg:text-5xl">
                בואו נדבר
              </h1>
              <p className="text-lg leading-relaxed text-white/90 lg:text-xl">
                יש לכם שאלה? מחפשים נכס? רוצים לדעת כמה שווה הנכס שלכם?
                <br className="hidden sm:block" />
                נשמח לעמוד לרשותכם ולסייע בכל תהליך נדל״ן.
              </p>
            </div>
          </Container>
        </section>

        {/* Contact Forms Section */}
        <section className="py-12 lg:py-16">
          <Container>
            <div className="mx-auto max-w-4xl">
              <ContactFormsClient />
            </div>
          </Container>
        </section>

        {/* Contact Info Section */}
        <section className="border-t border-gray-100 bg-gray-50 py-12 lg:py-16">
          <Container>
            <div className="mx-auto max-w-4xl">
              <div className="text-center">
                <h2 className="mb-3 text-2xl font-bold text-[#18384C] lg:text-3xl">
                  נשמח לשמוע מכם
                </h2>
                <p className="mb-8 text-base text-gray-600 lg:text-lg">
                  זמינים עבורכם בכל דרך שנוחה לכם
                </p>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Location */}
                  <div className="rounded-lg bg-white p-6 text-center shadow-sm">
                    <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#135C87]/10">
                      <svg className="h-6 w-6 text-[#135C87]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="mb-1 font-semibold text-[#18384C]">מיקום</h3>
                    <p className="text-sm text-gray-600">ירושלים</p>
                  </div>

                  {/* Availability */}
                  <div className="rounded-lg bg-white p-6 text-center shadow-sm">
                    <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#135C87]/10">
                      <svg className="h-6 w-6 text-[#135C87]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="mb-1 font-semibold text-[#18384C]">זמינות</h3>
                    <p className="text-sm text-gray-600">ימים א׳-ה׳, 9:00-18:00</p>
                  </div>

                  {/* Response Time */}
                  <div className="rounded-lg bg-white p-6 text-center shadow-sm sm:col-span-2 lg:col-span-1">
                    <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#135C87]/10">
                      <svg className="h-6 w-6 text-[#135C87]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="mb-1 font-semibold text-[#18384C]">זמן תגובה</h3>
                    <p className="text-sm text-gray-600">תוך 24 שעות</p>
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
