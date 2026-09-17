/**
 * Project Detail Page
 * 
 * Public project details
 */

import { notFound } from "next/navigation";
import { PublicHeader, PublicFooter, Container } from "@/components/public";

interface ProjectDTO {
  id: string;
  name: string;
  description: string | null;
  neighborhoodId: string;
  address: string | null;
  coverImage: string | null;
}

async function getProject(id: string): Promise<ProjectDTO | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/projects/${id}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching project:", error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) {
    return {
      title: "פרויקט לא נמצא | פנינה נדל״ן",
    };
  }

  return {
    title: `${project.name} | פנינה נדל״ן`,
    description: project.description || `${project.name} - פרויקט בירושלים`,
  };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      
      <main className="flex-1 bg-gray-50">
        <Container className="py-12">
          {/* Header */}
          <div className="bg-white p-8 mb-6 shadow-sm">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {project.name}
            </h1>
            {project.address && (
              <p className="text-lg text-gray-600">{project.address}</p>
            )}
          </div>

          {/* Cover Image */}
          {project.coverImage && (
            <div className="aspect-[21/9] bg-gray-200 mb-6 overflow-hidden">
              <img
                src={project.coverImage}
                alt={project.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Description */}
          {project.description && (
            <div className="bg-white p-8 mb-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">אודות הפרויקט</h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-lg">
                {project.description}
              </p>
            </div>
          )}

          {/* Contact CTA */}
          <div className="bg-[#135C87] text-white p-8 text-center">
            <h3 className="text-2xl font-semibold mb-4">
              מעוניינים לקבל פרטים נוספים?
            </h3>
            <p className="text-white/90 mb-6">
              צרו קשר לקבלת מידע מפורט על הפרויקט
            </p>
            <a
              href="/contact"
              className="inline-block px-8 py-3 text-base font-medium text-[#135C87] bg-white hover:bg-gray-100 transition-colors"
            >
              צור קשר
            </a>
          </div>
        </Container>
      </main>

      <PublicFooter />
    </div>
  );
}
