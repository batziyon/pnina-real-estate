/**
 * Project Card Component
 * 
 * Card for displaying public projects
 */

import Link from "next/link";

export interface ProjectCardData {
  id: string;
  name: string;
  description: string | null;
  neighborhoodId: string;
  address: string | null;
  coverImage: string | null;
}

interface ProjectCardProps {
  project: ProjectCardData;
  neighborhoodName?: string;
}

export function ProjectCard({ project, neighborhoodName }: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="group block bg-white overflow-hidden transition-all hover:shadow-lg"
    >
      {/* Image */}
      <div className="relative aspect-[16/9] bg-gray-100 overflow-hidden">
        {project.coverImage ? (
          <img
            src={project.coverImage}
            alt={project.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100" />
        )}
      </div>

      {/* Content */}
      <div className="p-6 border border-t-0 border-gray-100 group-hover:border-gray-200 transition-colors">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-[#135C87] transition-colors">
          {project.name}
        </h3>

        {project.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {project.description}
          </p>
        )}

        {(project.address || neighborhoodName) && (
          <p className="text-sm text-gray-500">
            {[neighborhoodName, project.address].filter(Boolean).join(", ")}
          </p>
        )}
      </div>
    </Link>
  );
}
