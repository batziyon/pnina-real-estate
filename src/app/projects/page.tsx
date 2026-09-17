/**
 * Projects List Page
 * 
 * Public projects browsing
 */

import { PublicHeader, PublicFooter, Container } from "@/components/public";
import { ProjectsListClient } from "@/components/public/ProjectsListClient";

export const metadata = {
  title: "פרויקטים בירושלים | פנינה נדל״ן",
  description: "פרויקטי נדל״ן בירושלים. יזמות ושיווק נכסים.",
};

export default function ProjectsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      
      <main className="flex-1 bg-gray-50">
        <Container className="py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#135C87] mb-2">
              פרויקטים בירושלים
            </h1>
            <p className="text-lg text-gray-600">
              פרויקטי נדל״ן ויזמות
            </p>
          </div>
          
          <ProjectsListClient />
        </Container>
      </main>

      <PublicFooter />
    </div>
  );
}
