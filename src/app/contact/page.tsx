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
    <div className="flex min-h-screen flex-col bg-[#ffffff]">
      <PublicHeader />

      <main className="flex-1">
        <section className="bg-[#123F5A] py-10 text-white lg:py-14">
          <Container>
            <div className="max-w-4xl">
              <div className="mb-4 h-1 w-14 bg-[#D9822B]" />
              <h1 className="mb-3 text-4xl font-black leading-[0.96] tracking-[-0.06em] text-white sm:text-5xl">
                צור קשר
              </h1>
              <p className="max-w-2xl text-base leading-7 text-white/90 sm:text-lg">
                נשמח לעמוד לרשותכם בכל שאלה, בקשה או תהליך נדל&quot;ן אישי.
              </p>
            </div>
          </Container>
        </section>

        <section className="py-10 lg:py-12">
          <Container>
            <div className="mx-auto max-w-5xl border border-[#dfeaf1] bg-white p-3 sm:p-5 lg:p-7">
              <ContactFormsClient />
            </div>
          </Container>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
