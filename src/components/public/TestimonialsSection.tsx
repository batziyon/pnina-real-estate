"use client";

import { useState, useEffect } from "react";

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

  if (!loading && testimonials.length === 0) {
    return null;
  }

  return (
    <section className="bg-gradient-to-b from-white to-[#f8f9fa] py-20 lg:py-28" dir="rtl">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-12 lg:mb-16 text-center">
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-[#18384C] leading-tight mb-4">
            מה אומרים עלינו
          </h2>
          <p className="text-lg text-[#18384C]/70 max-w-2xl mx-auto">
            לקוחות שסמכו עלינו בתהליכים הכי חשובים שלהם
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 text-center">
            <div className="inline-block h-10 w-10 animate-spin border-4 border-[#135C87] border-t-transparent" />
            <p className="mt-4 text-[#18384C]/70">טוען המלצות...</p>
          </div>
        )}

        {/* Testimonials Grid */}
        {!loading && testimonials.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className={`p-8 relative bg-gradient-to-br ${
                  index === 0 ? 'from-[#fef9f5] to-[#fef5ed]' :
                  index === 1 ? 'from-[#f9fafb] to-[#f3f6f9]' :
                  'from-[#fefbf8] to-[#fdf8f3]'
                } border border-gray-100`}
              >
                {/* Quote Icon */}
                <svg 
                  className={`w-10 h-10 mb-6 ${
                    index === 0 ? 'text-[#D9822B]' :
                    index === 1 ? 'text-[#135C87]' :
                    'text-[#D9822B]/80'
                  }`}
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>

                {/* Content */}
                <p className="text-base text-[#18384C]/80 leading-relaxed mb-6 line-clamp-6">
                  {testimonial.content}
                </p>

                {/* Author */}
                <div className="pt-4 border-t-2 border-[#135C87]">
                  <p className="font-bold text-[#135C87]">{testimonial.displayName}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
