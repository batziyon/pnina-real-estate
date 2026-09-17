/**
 * Section Heading Component
 * 
 * Consistent typography for section headers across the public site
 */

interface SectionHeadingProps {
  children: React.ReactNode;
  subtitle?: string;
  align?: "right" | "center";
  accentLine?: boolean;
}

export function SectionHeading({ 
  children, 
  subtitle, 
  align = "right",
  accentLine = false 
}: SectionHeadingProps) {
  const alignmentClass = align === "center" ? "text-center mx-auto" : "text-right";

  return (
    <div className={`${alignmentClass} max-w-2xl mb-12`}>
      {accentLine && (
        <div className={`h-0.5 w-12 bg-[#D9822B] mb-4 ${align === "center" ? "mx-auto" : ""}`} />
      )}
      <h2 className="text-3xl font-bold tracking-tight text-[#135C87] sm:text-4xl">
        {children}
      </h2>
      {subtitle && (
        <p className="mt-4 text-lg text-gray-600">
          {subtitle}
        </p>
      )}
    </div>
  );
}
