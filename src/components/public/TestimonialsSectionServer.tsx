/**
 * Testimonials Section — Server Component Wrapper
 *
 * Fetches APPROVED testimonials from API and renders client carousel.
 */

import TestimonialsSection from "./TestimonialsSection";

interface Testimonial {
  id: string;
  name: string;
  displayName: string | null;
  content: string;
}

export async function TestimonialsSectionServer() {
  // Fetch approved testimonials from public API
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
    // Gracefully return empty on error
  }

  // Don't render if no testimonials
  if (testimonials.length === 0) {
    return null;
  }

  return <TestimonialsSection testimonials={testimonials} />;
}
