"use client";

/**
 * Testimonials Page Client Component
 * 
 * Shows all approved testimonials in a grid + form to submit new testimonial
 */

import { useState } from "react";

interface Testimonial {
  id: string;
  name: string;
  displayName: string | null;
  content: string;
}

interface TestimonialsPageClientProps {
  testimonials: Testimonial[];
}

export function TestimonialsPageClient({ testimonials }: TestimonialsPageClientProps) {
  const [formData, setFormData] = useState({
    name: "",
    content: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/testimonials/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("שגיאה בשליחת ההמלצה");
      }

      setMessage({
        type: "success",
        text: "תודה על ההמלצה! ההמלצה נשלחה לאישור ותפורסם בקרוב.",
      });
      
      setFormData({ name: "", content: "" });
    } catch {
      setMessage({
        type: "error",
        text: "שגיאה בשליחת ההמלצה. אנא נסו שוב.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white" dir="rtl">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#135C87] to-[#1a7bb3] text-white py-16">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            המלצות לקוחות
          </h1>
          <p className="text-xl text-white/90">
            קראו מה הלקוחות שלנו אומרים על השירות שלנו
          </p>
        </div>
      </section>

      {/* Testimonials Grid */}
      {testimonials.length > 0 ? (
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  {/* Quote Icon */}
                  <div className="text-[#135C87] text-3xl leading-none mb-3 opacity-20">
                    &ldquo;
                  </div>
                  
                  {/* Content */}
                  <p className="text-gray-700 text-lg leading-relaxed mb-4">
                    {testimonial.content}
                  </p>
                  
                  {/* Client Name */}
                  <div className="font-semibold text-gray-900">
                    {testimonial.displayName || testimonial.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6 lg:px-8 text-center">
            <p className="text-gray-600 text-lg">
              טרם פורסמו המלצות. היו הראשונים לשתף את החוויה שלכם!
            </p>
          </div>
        </section>
      )}

      {/* Submit Form Section */}
      <section className="py-16 bg-white">
        <div className="max-w-2xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              שתפו את החוויה שלכם
            </h2>
            <p className="text-gray-600">
              קיבלתם שירות מצוין? נשמח לשמוע ממכם!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                שם מלא *
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#135C87] focus:border-[#135C87] transition-colors"
                placeholder="שם מלא"
                disabled={isSubmitting}
              />
            </div>

            {/* Content Textarea */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                ההמלצה שלכם *
              </label>
              <textarea
                id="content"
                required
                rows={6}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#135C87] focus:border-[#135C87] transition-colors resize-none"
                placeholder="ספרו לנו על החוויה שלכם..."
                disabled={isSubmitting}
              />
              <p className="text-sm text-gray-500 mt-2">
                ההמלצה תעבור אישור לפני הפרסום
              </p>
            </div>

            {/* Success/Error Message */}
            {message && (
              <div
                className={`p-4 rounded-lg ${
                  message.type === "success"
                    ? "bg-green-50 border border-green-200 text-green-800"
                    : "bg-red-50 border border-red-200 text-red-800"
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-3 bg-[#135C87] text-white font-medium rounded-lg hover:bg-[#0f4a6b] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "שולח..." : "שלח המלצה"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
