import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Loader2, MapPin } from 'lucide-react';

interface TopSalesWidgetProps {
  agentId?: number;
  period?: string;
  limit?: number;
}

export function TopSalesWidget({ agentId, period = '6months', limit = 5 }: TopSalesWidgetProps) {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['/api/transactions', { pageSize: 20, status: 'sold,settled', sortBy: 'price', sortDirection: 'desc', agentId, period }],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  // Limit to top sales
  const topSales = transactions?.data?.slice(0, limit) || [];

  return (
    <div className="p-4">
      <h3 className="text-base font-medium text-gray-900 mb-3">Top {limit} Sales</h3>
      
      {topSales.length === 0 ? (
        <div className="text-center text-sm text-gray-500 py-4">
          No sales data available for the selected criteria
        </div>
      ) : (
        <ul className="space-y-3">
          {topSales.map((sale: any) => (
            <li key={sale.id} className="border-b pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-900">{sale.propertyAddress}</p>
                  <div className="flex items-center text-xs text-gray-500">
                    <MapPin className="h-3 w-3 mr-1" />
                    {sale.propertySuburb}
                  </div>
                </div>
                <div className="text-sm font-bold text-green-700">
                  {formatCurrency(sale.price)}
                </div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>{sale.propertyType}</span>
                <span>{sale.agentName}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}