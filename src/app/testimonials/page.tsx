/**
 * Public Testimonials Page
 * 
 * Shows all approved testimonials + form to submit new testimonial
 */

import { PublicHeader, PublicFooter } from "@/components/public";
import { TestimonialsPageClient } from "@/components/public/TestimonialsPageClient";

export const metadata = {
  title: "המלצות לקוחות | פנינה נדל״ן",
  description: "קראו מה הלקוחות שלנו אומרים ושתפו את החוויה שלכם",
};

interface Testimonial {
  id: string;
  name: string;
  displayName: string | null;
  content: string;
}

export default async function TestimonialsPage() {
  // Fetch approved testimonials
  const apiUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/testimonials`;
  
  let testimonials: Testimonial[] = [];
  
  try {
    const response = await fetch(apiUrl, {
      next: { revalidate: 300 }, // ISR with 5 min revalidation
    });
    
    if (response.ok) {
      testimonials = await response.json();
    }
  } catch (error) {
    console.error("Failed to fetch testimonials:", error);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      
      <main className="flex-1">
        <TestimonialsPageClient testimonials={testimonials} />
      </main>

      <PublicFooter />
    </div>
  );
}
