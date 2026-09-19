"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ProjectCard } from "./ProjectCard";

interface ProjectDTO {
  id: string;
  name: string;
  description: string | null;
  neighborhoodId: string;
  address: string | null;
  coverImage: string | null;
}

export function FeaturedProjects() {
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
      try {
        const response = await fetch("/api/projects");

        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }

        const data: ProjectDTO[] = await response.json();
        setProjects(data.slice(0, 3));
      } catch (error) {
        console.error("Error fetching projects:", error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  if (!loading && projects.length === 0) {
    return null;
  }

  return (
    <section className="bg-[#F7F4EE] py-20 lg:py-28" dir="rtl">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-12 lg:mb-16">
          <div className="flex items-start justify-between gap-8">
            <div className="max-w-2xl">
              <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-[#18384C] leading-tight mb-4">
                פרויקטים בירושלים
              </h2>
              <p className="text-lg text-[#18384C]/70 leading-relaxed">
                פרויקטים נבחרים שאנחנו מתווכים, משווקים ומפתחים בשכונות המובילות בירושלים.
              </p>
            </div>

            <Link
              href="/projects"
              className="hidden lg:inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-[#135C87] border-2 border-[#135C87] hover:bg-[#135C87] hover:text-white transition-all"
            >
              <span>כל הפרויקטים</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 text-center">
            <div className="inline-block h-10 w-10 animate-spin border-4 border-[#135C87] border-t-transparent" />
            <p className="mt-4 text-[#18384C]/70">טוען פרויקטים...</p>
          </div>
        )}

        {/* Projects Grid */}
        {!loading && projects.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>

            {/* Mobile CTA */}
            <div className="mt-12 text-center lg:hidden">
              <Link
                href="/projects"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-[#135C87] hover:bg-[#123F5A] transition-colors"
              >
                לכל הפרויקטים
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
