/**
 * Contact Page
 * 
 * Central contact page with multiple inquiry types
 */

import { PublicHeader, PublicFooter, Container } from "@/components/public";
import { ContactFormsClient } from "@/components/public/ContactFormsClient";

export const metadata = {
  title: "צור קשר | פנינה נדל״ן",
  description: "צרו קשר עם פנינה נדל״ן - נשמח לעזור לכם למצוא את הנכס המושלם בירושלים",
};

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-[#135C87] text-white py-12">
          <Container>
            <div className="max-w-3xl">
              <div className="h-[2px] w-12 bg-[#D9822B] mb-6" />
              <h1 className="text-4xl font-bold mb-4">
                צור קשר
              </h1>
              <p className="text-xl text-white/90">
                נשמח לעמוד לרשותכם בכל שאלה או בקשה
              </p>
            </div>
          </Container>
        </section>

        {/* Contact Methods & Forms */}
        <section className="py-16 bg-gray-50">
          <Container>
            {/* Forms - Full Width */}
            <div className="max-w-4xl mx-auto">
              <ContactFormsClient />
            </div>
          </Container>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
