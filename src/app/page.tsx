/**
 * Homepage - Pnina Real Estate
 * 
 * Complete public-facing homepage
 */

import {
  PublicHeader,
  PublicFooter,
  Hero,
  FeaturedProperties,
  AboutSection,
  FeaturedProjects,
  ValuationCTA,
  TestimonialsSection,
  CooperationSection,
  ContactSection,
} from "@/components/public";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      
      <main className="flex-1">
        <Hero />
        <FeaturedProperties />
        <AboutSection />
        <FeaturedProjects />
        <ValuationCTA />
        <TestimonialsSection />
        <CooperationSection />
        <ContactSection />
      </main>

      <PublicFooter />
    </div>
  );
}

