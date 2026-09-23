/**
 * Properties List Page
 */

import { PublicHeader, PublicFooter, Container } from "@/components/public";
import { PropertiesListClient } from "@/components/public/PropertiesListClient";

export const metadata = {
  title: "נכסים למכירה ולהשכרה בירושלים | פנינה נדל״ן",
  description: "דירות ובתים למכירה ולהשכרה בירושלים. נכסים נבחרים עם ליווי מקצועי.",
};

export default function PropertiesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#ffffff]">
      <PublicHeader />

      <main className="flex-1">
        <section className="bg-[#123F5A] py-10 text-white lg:py-14">
          <Container>
            <div className="max-w-4xl">
              <div className="mb-4 h-1 w-14 bg-[#D9822B]" />
              <h1 className="mb-3 text-4xl font-black leading-[0.96] tracking-[-0.06em] text-white sm:text-5xl">
                נכסים בירושלים
              </h1>
              <p className="max-w-2xl text-base leading-7 text-white/90 sm:text-lg">
                דירות, בתים ופרויקטים שנבחרו בקפידה עבור מי שמחפש איכות, מיקום וטווח השקעה נכון.
              </p>
            </div>
          </Container>
        </section>

        <Container className="py-10 lg:py-12">
          <div className="border border-[#dfeaf1] bg-white p-4 sm:p-6 rounded-lg shadow-sm">
            <PropertiesListClient />
          </div>
        </Container>
      </main>

      <PublicFooter />
    </div>
  );
}
