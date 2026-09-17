"use client";

/**
 * Testimonials Section
 * 
 * Displays approved testimonials only
 */

import { useState, useEffect } from "react";
import { Container } from "./Container";
import { SectionHeading } from "./SectionHeading";

interface TestimonialDTO {
  id: string;
  displayName: string;
  content: string;
  createdAt: string;
}

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<TestimonialDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTestimonials() {
      setLoading(true);
      try {
        const response = await fetch("/api/testimonials");
        
        if (!response.ok) {
          throw new Error("Failed to fetch testimonials");
        }

        const data: TestimonialDTO[] = await response.json();
        // Show max 3 testimonials on homepage
        setTestimonials(data.slice(0, 3));
      } catch (error) {
        console.error("Error fetching testimonials:", error);
        setTestimonials([]);
      } finally {
        setLoading(false);
      }
    }

    fetchTestimonials();
  }, []);

  // Hide section if no testimonials
  if (!loading && testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-16 lg:py-20 bg-gray-50">
      <Container>
        <SectionHeading align="center" accentLine>
          המלצות
        </SectionHeading>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-[#135C87] border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-600">טוען המלצות...</p>
          </div>
        )}

        {/* Testimonials Grid */}
        {!loading && testimonials.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white p-8 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Quote Icon */}
                <svg
                  className="w-8 h-8 text-[#D9822B] mb-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>

                {/* Content */}
                <p className="text-gray-700 mb-6 leading-relaxed line-clamp-6">
                  {testimonial.content}
                </p>

                {/* Author */}
                <div className="border-t border-gray-100 pt-4">
                  <p className="font-semibold text-gray-900">
                    {testimonial.displayName}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
