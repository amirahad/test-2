import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp } from "lucide-react";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: ReactNode;
  iconColor: string;
}

export function StatCard({ title, value, change, icon, iconColor }: StatCardProps) {
  return (
    <div className="bg-white overflow-hidden shadow-md rounded-xl hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 group">
      <div className="p-6">
        <div className="flex items-center">
          <div className={cn("flex-shrink-0 rounded-lg p-3 transition-colors group-hover:opacity-90", iconColor)}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate group-hover:text-gray-700 transition-colors">
                {title}
              </dt>
              <dd className="flex items-baseline mt-1.5">
                <div className="text-2xl font-bold text-gray-900">
                  {value}
                </div>
                
                {change !== undefined && (
                  <div 
                    className={cn(
                      "ml-2 flex items-center text-sm font-semibold",
                      change >= 0 ? "text-green-600" : "text-red-600"
                    )}
                  >
                    {change >= 0 ? (
                      <ArrowUp className="h-4 w-4 mr-0.5" />
                    ) : (
                      <ArrowDown className="h-4 w-4 mr-0.5" />
                    )}
                    <span className="sr-only">
                      {change >= 0 ? "Increased by" : "Decreased by"}
                    </span>
                    {Math.abs(change).toFixed(1)}%
                    <span className="ml-1 text-xs font-medium text-gray-500">vs last period</span>
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
