/**
 * Properties List Page
 * 
 * Public property browsing with filtering
 */

import { PublicHeader, PublicFooter, Container } from "@/components/public";
import { PropertiesListClient } from "@/components/public/PropertiesListClient";

export const metadata = {
  title: "נכסים למכירה ולהשכרה בירושלים | פנינה נדל״ן",
  description: "דירות ובתים למכירה ולהשכרה בירושלים. נכסים נבחרים עם ליווי מקצועי.",
};

export default function PropertiesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      
      <main className="flex-1 bg-gray-50">
        <Container className="py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#135C87] mb-2">
              נכסים בירושלים
            </h1>
            <p className="text-lg text-gray-600">
              דירות ובתים למכירה ולהשכרה
            </p>
          </div>
          
          <PropertiesListClient />
        </Container>
      </main>

      <PublicFooter />
    </div>
  );
}
