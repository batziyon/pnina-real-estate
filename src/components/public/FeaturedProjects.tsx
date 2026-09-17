"use client";

/**
 * Featured Projects Section
 * 
 * Displays active public projects
 */

import Link from "next/link";
import { useState, useEffect } from "react";
import { ProjectCard } from "./ProjectCard";
import { SectionHeading } from "./SectionHeading";
import { Container } from "./Container";

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
        // Show max 3 featured projects on homepage
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

  // Hide section if no projects
  if (!loading && projects.length === 0) {
    return null;
  }

  return (
    <section className="py-16 lg:py-20 bg-white">
      <Container>
        <SectionHeading accentLine>
          פרויקטים בירושלים
        </SectionHeading>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-[#135C87] border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-600">טוען פרויקטים...</p>
          </div>
        )}

        {/* Projects Grid */}
        {!loading && projects.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>

            {/* View All Link */}
            <div className="mt-10 text-center">
              <Link
                href="/projects"
                className="inline-flex items-center px-6 py-3 text-base font-medium text-[#135C87] bg-white hover:bg-gray-50 border border-[#135C87] transition-colors"
              >
                לכל הפרויקטים
              </Link>
            </div>
          </>
        )}
      </Container>
    </section>
  );
}
