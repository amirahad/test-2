import { getStatusColor } from "@/lib/api";

interface StatusBadgeProps {
  status: string;
  className?: string;
  isDarkMode?: boolean;
}

export function StatusBadge({ status, className = "", isDarkMode = false }: StatusBadgeProps) {
  const colorClass = getStatusColor(status, isDarkMode);
  
  return (
    <span className={`px-1.5 inline-flex text-2xs leading-4 font-semibold rounded-full ${colorClass} ${className}`}>
      {status}
    </span>
  );
}
