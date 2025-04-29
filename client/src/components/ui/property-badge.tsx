import { getPropertyTypeColor } from "@/lib/api";

interface PropertyBadgeProps {
  type: string;
  className?: string;
  isDarkMode?: boolean;
}

export function PropertyBadge({ type, className = "", isDarkMode = false }: PropertyBadgeProps) {
  const colorClass = getPropertyTypeColor(type, isDarkMode);
  
  return (
    <span className={`px-1.5 inline-flex text-2xs leading-4 font-semibold rounded-full ${colorClass} ${className}`}>
      {type}
    </span>
  );
}
