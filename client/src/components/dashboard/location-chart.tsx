import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Chart from "chart.js/auto";
import { getChartColors, getChartBorderColors } from "@/lib/api";

interface LocationChartProps {
  className?: string;
}

export function LocationChart({ className }: LocationChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  
  const { data, isLoading } = useQuery({
    queryKey: ["/api/charts/locations"],
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
    
    // Check if in TV view
    const isTVView = window.location.pathname.includes('tv-view');
    
    // Check if in dark mode
    const isDarkMode = document.documentElement.classList.contains('dark') || 
                     window.matchMedia('(prefers-color-scheme: dark)').matches || isTVView;
    
    chartInstance.current = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: data.labels,
        datasets: [{
          data: data.data,
          backgroundColor: getChartColors(),
          borderColor: getChartBorderColors(),
          borderWidth: isTVView ? 2 : 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: isTVView ? 'bottom' : 'right',
            labels: {
              boxWidth: isTVView ? 16 : 15,
              padding: isTVView ? 20 : 10,
              color: isDarkMode ? '#e5e7eb' : '#374151',
              font: {
                size: isTVView ? 18 : 12,
                weight: isTVView ? 'bold' : 'normal'
              }
            }
          },
          tooltip: {
            backgroundColor: isDarkMode ? '#4b5563' : '#ffffff',
            titleColor: isDarkMode ? '#e5e7eb' : '#111827',
            bodyColor: isDarkMode ? '#e5e7eb' : '#374151',
            borderColor: isDarkMode ? '#6b7280' : '#e5e7eb',
            borderWidth: 1,
            titleFont: {
              size: isTVView ? 18 : 14,
              weight: 'bold',
            },
            bodyFont: {
              size: isTVView ? 16 : 12,
            },
            padding: isTVView ? 12 : 8
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
        <CardTitle className="text-lg font-medium">Sales by Location</CardTitle>
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
