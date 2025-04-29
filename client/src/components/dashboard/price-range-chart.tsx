import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Chart from "chart.js/auto";

interface PriceRangeChartProps {
  className?: string;
}

export function PriceRangeChart({ className }: PriceRangeChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  
  const { data, isLoading } = useQuery({
    queryKey: ["/api/charts/price-ranges"],
  });
  
  // Initialize chart when data is loaded
  useEffect(() => {
    if (!data || !chartRef.current) return;
    
    // Destroy previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;
    
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Number of Properties',
          data: data.data,
          backgroundColor: 'rgba(16, 185, 129, 0.8)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
    
    // Cleanup chart on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);
  
  return (
    <Card className={className}>
      <CardHeader className="px-4 py-5 sm:px-6">
        <CardTitle className="text-lg font-medium">Price Range Distribution</CardTitle>
      </CardHeader>
      <CardContent className="px-4 py-3 sm:px-6">
        <div className="chart-container" style={{ position: 'relative', height: '250px', width: '100%' }}>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <canvas ref={chartRef} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
