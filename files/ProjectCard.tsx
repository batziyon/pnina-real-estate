/**
 * Project Card Component
 * Clean, professional project card with subtle warm tones
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
      className="group block bg-white border border-gray-200 overflow-hidden transition-all hover:border-[#D9822B] hover:shadow-md"
    >
      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-[#f0e8dc] to-[#e2d5c4]">
        {project.coverImage ? (
          <img
            src={project.coverImage}
            alt={project.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-[#9b8870] text-sm">פרויקט {project.name}</div>
            </div>
          </div>
        )}

        {/* Hover Overlay with warm tint */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#D9822B]/0 to-[#D9822B]/0 group-hover:from-[#D9822B]/5 group-hover:to-[#D9822B]/10 transition-all duration-300" />
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Location */}
        {neighborhoodName && (
          <div className="text-xs font-semibold text-[#135C87] tracking-wider mb-2 uppercase">
            {neighborhoodName}
          </div>
        )}

        {/* Title */}
        <h3 className="text-xl font-bold text-[#18384C] mb-3 leading-tight group-hover:text-[#135C87] transition-colors">
          {project.name}
        </h3>

        {/* Description */}
        {project.description && (
          <p className="text-base text-[#18384C]/70 leading-relaxed mb-3 line-clamp-2">
            {project.description}
          </p>
        )}

        {/* Address */}
        {project.address && (
          <div className="text-sm text-[#18384C]/60 pt-3 border-t border-gray-200">
            {project.address}
          </div>
        )}
      </div>
    </Link>
  );
}
