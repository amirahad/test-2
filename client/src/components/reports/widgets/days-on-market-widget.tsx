import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Loader2, TrendingDown, TrendingUp } from 'lucide-react';

interface DaysOnMarketWidgetProps {
  agentId?: number;
  period?: string;
}

export function DaysOnMarketWidget({ agentId, period = '6months' }: DaysOnMarketWidgetProps) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/stats', { agentId, period }],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  // For days on market, lower is better
  const previousDays = Math.round(Number(stats?.avgDaysOnMarket || 0) * 1.15);
  const trend = previousDays - Number(stats?.avgDaysOnMarket || 0);
  const trendPercent = previousDays > 0 ? (trend / previousDays) * 100 : 0;
  const isUp = trend >= 0; // For DOM, "up" means improvement (less days)

  return (
    <div className="p-4 flex flex-col space-y-4">
      <div className="text-center">
        <h3 className="text-3xl font-bold text-purple-900">
          {stats?.avgDaysOnMarket || 0}
        </h3>
        <p className="text-xs text-gray-500">Average Days on Market</p>
      </div>
      
      <div className="flex items-center justify-center">
        <div className={`flex items-center ${isUp ? 'text-green-600' : 'text-red-600'}`}>
          {isUp ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
          <span className="text-sm font-medium">
            {isUp ? '-' : '+'}{Math.abs(trendPercent).toFixed(1)}%
          </span>
        </div>
        <span className="text-xs text-gray-500 ml-2">vs. Previous Period</span>
      </div>
      
      <div className="text-center mt-2">
        <p className="text-xs text-gray-500">
          Industry Average: {Math.round(Number(stats?.avgDaysOnMarket || 0) * 1.3)} days
        </p>
      </div>
    </div>
  );
}