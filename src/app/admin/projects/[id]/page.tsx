/**
 * Edit Project Page — Hebrew RTL
 *
 * Server Component that fetches project data and renders edit form.
 */

import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth-helpers";
import { useCases } from "@/lib/container";
import { ProjectForm } from "@/components/admin/ProjectForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: PageProps) {
  const { id } = await params;
  await requireAuth();

  // Fetch project
  const project = await useCases.projects.get.execute(id);
  if (!project) {
    notFound();
  }

  // Fetch reference data
  const neighborhoods = await useCases.neighborhoods.list.execute();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">ערוך פרויקט</h1>
        <p className="text-gray-600 mt-1">{project.name}</p>
      </div>

      <ProjectForm neighborhoods={neighborhoods} initialData={project} />
    </div>
  );
}
