import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Pie } from 'recharts';
import { PieChart, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getChartColors, getPropertyTypeColor } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface PropertyTypeChartProps {
  className?: string;
  chartColors?: string[]; // Custom chart colors for reports
}

export function PropertyTypeChart({ className, chartColors }: PropertyTypeChartProps) {
  interface PropertyTypeData {
    labels: string[];
    data: number[];
  }

  const { data, isLoading } = useQuery<PropertyTypeData>({
    queryKey: ['/api/charts/property-types'],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Ensure we have labels and data
  const chartData = (data?.labels || []).map((label: string, index: number) => ({
    name: label,
    value: data?.data?.[index] || 0,
  }));

  // Use custom colors if provided, otherwise use default colors
  const colors = chartColors || getChartColors();

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.1;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return percent > 0.05 ? (
      <text
        x={x}
        y={y}
        fill="#888"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  return (
    <div className={`h-[300px] w-full ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry: any, index: number) => (
              <Cell
                key={`cell-${index}`}
                fill={colors && index < colors.length ? colors[index] : getPropertyTypeColor(entry.name)}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [value, 'Properties']}
            contentStyle={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              padding: '0.5rem',
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}