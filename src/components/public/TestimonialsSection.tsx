"use client";

/**
 * Public Testimonials Section — Auto-rotating Carousel
 *
 * Features:
 * - Automatically advances every 5 seconds
 * - Manual navigation with arrow buttons
 * - Pauses on user interaction
 * - Shows only APPROVED testimonials
 * - Responsive design matching Pnina brand
 * - Accessible (keyboard navigation, ARIA labels)
 */

import { useState, useEffect, useCallback } from "react";

interface Testimonial {
  id: string;
  name: string;
  displayName: string | null;
  content: string;
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export default function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // If empty or only 1 testimonial, show static (no carousel)
  const showCarousel = testimonials.length > 1;

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  const goToIndex = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Auto-advance every 5 seconds (only if carousel enabled and not paused)
  useEffect(() => {
    if (!showCarousel || isPaused) return;

    const interval = setInterval(goToNext, 5000);
    return () => clearInterval(interval);
  }, [showCarousel, isPaused, goToNext]);

  // Keyboard navigation
  useEffect(() => {
    if (!showCarousel) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        setIsPaused(true);
        if (e.key === "ArrowRight") goToNext();
        if (e.key === "ArrowLeft") goToPrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showCarousel, goToNext, goToPrev]);

  if (testimonials.length === 0) {
    return null; // Don't render section if no testimonials
  }

  const current = testimonials[currentIndex];

  return (
    <section className="py-20 bg-gray-50" dir="rtl">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            מה הלקוחות שלנו אומרים
          </h2>
          <div className="w-20 h-1 bg-[#D9822B] mx-auto"></div>
        </div>

        {/* Testimonial Card */}
        <div
          className="relative bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-12 max-w-4xl mx-auto"
          onMouseEnter={() => showCarousel && setIsPaused(true)}
          onMouseLeave={() => showCarousel && setIsPaused(false)}
          onFocus={() => showCarousel && setIsPaused(true)}
          onBlur={() => showCarousel && setIsPaused(false)}
        >
          {/* Quote Icon */}
          <div className="text-[#135C87] text-5xl leading-none mb-4 opacity-20">&ldquo;</div>

          {/* Content */}
          <blockquote className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
            {current.content}
          </blockquote>

          {/* Client Name */}
          <cite className="not-italic">
            <div className="font-semibold text-gray-900 text-lg">
              {current.displayName || current.name}
            </div>
          </cite>

          {/* Navigation Arrows (only if more than 1 testimonial) */}
          {showCarousel && (
            <>
              {/* Previous Button */}
              <button
                onClick={() => {
                  setIsPaused(true);
                  goToPrev();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-[#135C87] focus:ring-offset-2"
                aria-label="המלצה קודמת"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              {/* Next Button */}
              <button
                onClick={() => {
                  setIsPaused(true);
                  goToNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-[#135C87] focus:ring-offset-2"
                aria-label="המלצה הבאה"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Dots Indicator (only if more than 1 testimonial) */}
        {showCarousel && (
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsPaused(true);
                  goToIndex(index);
                }}
                className={`w-2.5 h-2.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-[#135C87] focus:ring-offset-2 ${
                  index === currentIndex
                    ? "bg-[#135C87] w-8"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`עבור להמלצה ${index + 1}`}
                aria-current={index === currentIndex ? "true" : "false"}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
