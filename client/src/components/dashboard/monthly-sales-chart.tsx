import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Chart from "chart.js/auto";
import { getChartColors, getChartBorderColors } from '@/lib/api';

interface MonthlyChartData {
  months: string[];
  salesData: number[];
  revenueData: number[];
}

interface MonthlySalesChartProps {
  period?: string;
  hideTitle?: boolean; // Add option to hide title when used in reports
  chartColors?: string[]; // Custom chart colors for reports
}

export function MonthlySalesChart({ 
  period = "6months", 
  hideTitle = false,
  chartColors: customChartColors
}: MonthlySalesChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState(period);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  
  const { data, isLoading } = useQuery<MonthlyChartData>({
    queryKey: ["/api/charts/monthly-sales", selectedPeriod],
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
                     
    console.log("Rendering line chart in path:", window.location.pathname);
    
    // Filter data to only show months from January onwards
    const startFromJan = (month: string, index: number, array: string[]) => {
      // Find January's index in the data
      const janIndex = array.findIndex(m => m === 'Jan');
      // If January exists in the data, only show from January onwards
      return janIndex !== -1 ? index >= janIndex : true;
    };
    
    // Only include data from January onwards if data.months exists
    const filteredMonths = data && data.months ? data.months.filter(startFromJan) : [];
    const filteredSalesData = data && data.months && data.salesData ? 
      data.salesData.filter((_, index: number) => startFromJan(data.months[index], index, data.months)) : [];
    const filteredRevenueData = data && data.months && data.revenueData ? 
      data.revenueData.filter((_, index: number) => startFromJan(data.months[index], index, data.months)) : [];
    
    // Use custom colors if provided, otherwise use default colors
    const defaultChartColors = getChartColors();
    const defaultChartBorderColors = getChartBorderColors();
    
    // Use custom colors if provided
    const chartBorderColors = customChartColors || defaultChartBorderColors;
    
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: filteredMonths,
        datasets: [
          {
            label: 'Properties Sold',
            data: filteredSalesData,
            borderColor: chartBorderColors[0],
            backgroundColor: 'transparent',
            borderWidth: isTVView ? 4 : 3,
            fill: false,
            tension: 0.2,
            pointRadius: isTVView ? 6 : 4,
            pointHoverRadius: isTVView ? 8 : 6,
            pointBackgroundColor: chartBorderColors[0]
          },
          {
            label: 'Revenue (millions)',
            data: filteredRevenueData,
            borderColor: chartBorderColors[1],
            backgroundColor: 'transparent',
            borderWidth: isTVView ? 4 : 3,
            fill: false,
            tension: 0.2,
            pointRadius: isTVView ? 6 : 4,
            pointHoverRadius: isTVView ? 8 : 6,
            pointBackgroundColor: chartBorderColors[1],
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: isTVView ? 15 : 10,
              color: isDarkMode ? '#e5e7eb' : '#374151',
              font: {
                size: isTVView ? 18 : 12,
                weight: isTVView ? 'bold' : 'normal'
              },
              padding: isTVView ? 20 : 10
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
        },
        scales: {
          x: {
            grid: {
              display: true,
              color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            },
            ticks: {
              color: isDarkMode ? '#9ca3af' : '#4b5563',
              font: {
                size: isTVView ? 16 : 12,
                weight: isTVView ? 'bold' : 'normal'
              }
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              display: true,
              color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            },
            ticks: {
              color: isDarkMode ? '#9ca3af' : '#4b5563',
              font: {
                size: isTVView ? 16 : 12
              }
            },
            title: {
              display: !isTVView,
              text: 'Properties Sold',
              color: isDarkMode ? '#9ca3af' : '#4b5563',
              font: {
                size: isTVView ? 16 : 12
              }
            }
          },
          y1: {
            beginAtZero: true,
            position: 'right',
            grid: {
              drawOnChartArea: false
            },
            ticks: {
              color: isDarkMode ? '#9ca3af' : '#4b5563',
              font: {
                size: isTVView ? 16 : 12
              }
            },
            title: {
              display: !isTVView,
              text: 'Revenue (millions)',
              color: isDarkMode ? '#9ca3af' : '#4b5563',
              font: {
                size: isTVView ? 16 : 12
              }
            }
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
  }, [data, customChartColors, selectedPeriod]);
  
  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
  };
  
  return (
    <Card>
      <CardHeader className="px-4 py-3 sm:px-5 flex flex-col sm:flex-row justify-between sm:items-center space-y-1 sm:space-y-0">
        {!hideTitle && <CardTitle className="text-lg font-medium">Monthly Sales Performance</CardTitle>}
        <div className="flex space-x-1">
          <Button 
            variant={selectedPeriod === "30days" ? "default" : "outline"}
            size="sm"
            onClick={() => handlePeriodChange("30days")}
            className="text-xs h-7"
          >
            30 Days
          </Button>
          <Button 
            variant={selectedPeriod === "6months" ? "default" : "outline"}
            size="sm"
            onClick={() => handlePeriodChange("6months")}
            className="text-xs h-7"
          >
            6 Months
          </Button>
          <Button 
            variant={selectedPeriod === "12months" ? "default" : "outline"}
            size="sm"
            onClick={() => handlePeriodChange("12months")}
            className="text-xs h-7"
          >
            12 Months
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-2 py-2 sm:px-3">
        <div className="chart-container" style={{ position: 'relative', height: '300px', width: '100%' }}>
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
