/**
 * Create Property Page — Hebrew RTL
 *
 * Server Component that fetches reference data and renders form.
 */

import { requireAuth } from "@/lib/auth-helpers";
import { useCases } from "@/lib/container";
import { PropertyForm } from "@/components/admin/PropertyForm";

export default async function NewPropertyPage() {
  const user = await requireAuth();

  // Fetch reference data
  const [neighborhoods, agents] = await Promise.all([
    useCases.neighborhoods.list.execute(),
    user.role === "ADMIN" || user.role === "EDITOR"
      ? useCases.users.list.execute({ role: "AGENT", active: true }, { page: 1, pageSize: 100 })
      : Promise.resolve({ data: [], meta: { page: 1, pageSize: 100, total: 0, totalPages: 0 } }),
  ]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">הוסף נכס חדש</h1>
        <p className="text-gray-600 mt-1">מלא את פרטי הנכס</p>
      </div>

      <PropertyForm
        neighborhoods={neighborhoods}
        agents={agents.data}
        userRole={user.role}
      />
    </div>
  );
}
