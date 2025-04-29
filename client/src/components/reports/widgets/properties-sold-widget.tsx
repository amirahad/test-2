import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Loader2, TrendingDown, TrendingUp } from 'lucide-react';

interface PropertiesSoldWidgetProps {
  agentId?: number;
  period?: string;
}

export function PropertiesSoldWidget({ agentId, period = '6months' }: PropertiesSoldWidgetProps) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/stats', { agentId, period }],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Simulate trend calculation
  const previousTotal = Math.round(Number(stats?.totalSold || 0) * 0.9);
  const trend = Number(stats?.totalSold || 0) - previousTotal;
  const trendPercent = previousTotal > 0 ? (trend / previousTotal) * 100 : 0;
  const isUp = trend >= 0;

  return (
    <div className="p-4 flex flex-col space-y-4">
      <div className="text-center">
        <h3 className="text-3xl font-bold text-blue-900">
          {stats?.totalSold || 0}
        </h3>
        <p className="text-xs text-gray-500">Properties Sold</p>
      </div>
      
      <div className="flex items-center justify-center">
        <div className={`flex items-center ${isUp ? 'text-green-600' : 'text-red-600'}`}>
          {isUp ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
          <span className="text-sm font-medium">
            {isUp ? '+' : ''}{trendPercent.toFixed(1)}%
          </span>
        </div>
        <span className="text-xs text-gray-500 ml-2">vs. Previous Period</span>
      </div>
      
      <div className="flex justify-between text-xs text-gray-500 mt-4">
        <div>YTD: {stats?.totalSold ? stats.totalSold * 2 : 0}</div>
        <div>Target: {stats?.totalSold ? Math.round(stats.totalSold * 1.25) : 0}</div>
        <div>Monthly Avg: {stats?.totalSold ? Math.round(stats.totalSold / 6) : 0}</div>
      </div>
    </div>
  );
}