import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth-helpers";
import { useCases } from "@/lib/container";
import { PropertyForm } from "@/components/admin/PropertyForm";
import { PropertyActions } from "@/components/admin/PropertyActions";
import { canActorPublish } from "@/domain/property/property.rules";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPropertyPage({ params }: PageProps) {
  const { id } = await params;
  const user = await requireAuth();

  // Fetch property
  const property = await useCases.properties.get.execute(id);
  if (!property) {
    notFound();
  }

  // Fetch reference data
  const [neighborhoods, agents] = await Promise.all([
    useCases.neighborhoods.list.execute(),
    user.role === "ADMIN" || user.role === "EDITOR"
      ? useCases.users.list.execute({ role: "AGENT", active: true }, { page: 1, pageSize: 100 })
      : Promise.resolve({ data: [], meta: { page: 1, pageSize: 100, total: 0, totalPages: 0 } }),
  ]);

  // Server-side determination of permissions
  const userCanPublish = canActorPublish(user.id, user.role, property);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ערוך נכס</h1>
          <p className="text-gray-600 mt-1">{property.title}</p>
        </div>

        <PropertyActions
          propertyId={id}
          status={property.status}
          canPublish={userCanPublish}
        />
      </div>

      <PropertyForm
        neighborhoods={neighborhoods}
        agents={agents.data}
        userRole={user.role}
        initialData={property}
      />
    </div>
  );
}
