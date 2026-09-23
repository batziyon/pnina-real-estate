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
    <div className="flex min-h-screen flex-col bg-[#ffffff]">
      <PublicHeader />

      <main className="flex-1">
        <section className="bg-[#123F5A] py-10 text-white lg:py-14">
          <Container>
            <div className="max-w-4xl">
              <div className="mb-4 h-1 w-14 bg-[#D9822B]" />
              <h1 className="mb-2 text-4xl font-black leading-[0.96] tracking-[-0.06em] text-white sm:text-5xl">
                {project.name}
              </h1>
              {project.address && (
                <p className="max-w-2xl text-base leading-7 text-white/90 sm:text-lg">{project.address}</p>
              )}
            </div>
          </Container>
        </section>

        <Container className="py-10 lg:py-12">
          <div className="overflow-hidden border border-[#dfeaf1] bg-white rounded-lg shadow-sm">
            {project.coverImage && (
              <div className="aspect-[21/9] overflow-hidden bg-white">
                <img
                  src={project.coverImage}
                  alt={project.name}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            {project.description && (
              <div className="p-6 sm:p-8">
                <h2 className="mb-4 text-2xl font-bold text-[#135C87] sm:text-3xl">אודות הפרויקט</h2>
                <p className="whitespace-pre-wrap text-base leading-8 text-[#334155] sm:text-lg">
                  {project.description}
                </p>
              </div>
            )}

            <div className="bg-[#135C87] p-6 text-center text-white">
              <h3 className="mb-2 text-2xl font-bold text-white">
                מעוניינים לקבל פרטים נוספים?
              </h3>
              <p className="mb-5 text-base leading-7 text-white/90">
                צרו קשר לקבלת מידע מפורט על הפרויקט
              </p>
              <a
                href="/contact?type=general"
                className="inline-block bg-white px-7 py-3 text-base font-medium text-[#135C87] transition-colors hover:bg-gray-100"
              >
                צור קשר
              </a>
            </div>
          </div>
        </Container>
      </main>

      <PublicFooter />
    </div>
  );
}
