/**
 * Section Heading Component
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
  accentLine = false,
}: SectionHeadingProps) {
  const alignmentClass = align === "center" ? "text-center mx-auto" : "text-right";

  return (
    <div className={`${alignmentClass} max-w-3xl`}>
      {accentLine && (
        <div className={`mb-4 h-1 w-16 bg-[#D9822B] ${align === "center" ? "mx-auto" : ""}`} />
      )}
      <h2 className="text-[#135C87] leading-[1.08] tracking-[-0.05em]">{children}</h2>
      {subtitle && <p className="mt-3 text-base leading-7 text-[#4d5f70] sm:text-lg">{subtitle}</p>}
    </div>
  );
}
