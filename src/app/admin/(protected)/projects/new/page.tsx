/**
 * Create Project Page — Hebrew RTL
 */

import { requireAuth } from "@/lib/auth-helpers";
import { useCases } from "@/lib/container";
import { ProjectForm } from "@/components/admin/ProjectForm";

export default async function NewProjectPage() {
  await requireAuth();

  const neighborhoods = await useCases.neighborhoods.list.execute();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">הוסף פרויקט חדש</h1>
        <p className="text-gray-600 mt-1">מלא את פרטי הפרויקט</p>
      </div>

      <ProjectForm neighborhoods={neighborhoods} />
    </div>
  );
}
