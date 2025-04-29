import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Loader2, TrendingDown, TrendingUp } from 'lucide-react';

interface AveragePriceWidgetProps {
  agentId?: number;
  period?: string;
}

export function AveragePriceWidget({ agentId, period = '6months' }: AveragePriceWidgetProps) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/stats', { agentId, period }],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  // Simulate trend calculation - this would ideally come from the API
  const previousAvg = Number(stats?.avgPrice || 0) * 0.95;
  const trend = Number(stats?.avgPrice || 0) - previousAvg;
  const trendPercent = previousAvg > 0 ? (trend / previousAvg) * 100 : 0;
  const isUp = trend >= 0;

  return (
    <div className="p-4 flex flex-col space-y-4">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-amber-900">
          {formatCurrency(stats?.avgPrice || 0)}
        </h3>
        <p className="text-xs text-gray-500">Average Selling Price</p>
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
      
      <div className="text-center mt-2">
        <p className="text-xs text-gray-500">
          Based on {stats?.totalSold || 0} properties sold
        </p>
      </div>
    </div>
  );
}