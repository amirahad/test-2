import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Chart from "chart.js/auto";
import { getChartColors } from '@/lib/api';

interface AgentPerformanceData {
  labels: string[];
  data: number[];
}

interface AgentPerformanceChartProps {
  className?: string;
  chartColors?: string[]; // Custom chart colors for reports
}

export function AgentPerformanceChart({ className, chartColors }: AgentPerformanceChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  
  const { data, isLoading } = useQuery<AgentPerformanceData>({
    queryKey: ["/api/charts/agent-performance"],
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
    
    // Check if in dark mode
    const isDarkMode = document.documentElement.classList.contains('dark') || 
                     window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Use custom colors if provided, otherwise use default colors
    const colors = chartColors || getChartColors();
    
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Properties Sold',
          data: data.data,
          backgroundColor: colors,
          borderWidth: 1,
          borderRadius: 6,
          maxBarThickness: 30, 
          borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: isDarkMode ? '#4b5563' : '#ffffff',
            titleColor: isDarkMode ? '#e5e7eb' : '#111827',
            bodyColor: isDarkMode ? '#e5e7eb' : '#374151',
            borderColor: isDarkMode ? '#6b7280' : '#e5e7eb',
            borderWidth: 1,
            titleFont: {
              size: 14,
              weight: 'bold',
            },
            bodyFont: {
              size: 12,
            },
            padding: 8
          }
        },
        scales: {
          x: {
            grid: {
              color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            },
            ticks: {
              color: isDarkMode ? '#9ca3af' : '#4b5563',
              font: {
                size: 12
              },
              maxTicksLimit: 10
            }
          },
          y: {
            grid: {
              display: false
            },
            ticks: {
              color: isDarkMode ? '#9ca3af' : '#4b5563',
              font: {
                size: 12
              },
              padding: 4
            }
          }
        },
        layout: {
          padding: {
            top: 8,
            bottom: 8,
            left: 8,
            right: 8
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
  }, [data, chartColors]);
  
  return (
    <div className={`w-full h-full flex flex-col ${className}`}>
      {isLoading ? (
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <canvas ref={chartRef} className="w-full h-full" />
      )}
    </div>
  );
}
