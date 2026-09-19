/**
 * Container Component
 * 
 * Consistent max-width and padding wrapper
 */

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: "default" | "narrow" | "wide";
}

const sizeStyles = {
  narrow: "max-w-4xl",
  default: "max-w-[1280px]",
  wide: "max-w-[1380px]",
};

export function Container({ children, className = "", size = "default" }: ContainerProps) {
  return (
    <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${sizeStyles[size]} ${className}`}>
      {children}
    </div>
  );
}
