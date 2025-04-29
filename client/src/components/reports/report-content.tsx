import React, { useState } from 'react';
import { ReportWidget } from './report-widget';
import { MonthlySalesChart } from '@/components/dashboard/monthly-sales-chart';
import { PropertyTypeChart } from '@/components/dashboard/property-type-chart';
import { PropertiesSoldWidget } from './widgets/properties-sold-widget';
import { TotalRevenueWidget } from './widgets/total-revenue-widget';
import { AveragePriceWidget } from './widgets/average-price-widget';
import { DaysOnMarketWidget } from './widgets/days-on-market-widget';
import { TopSalesWidget } from './widgets/top-sales-widget';
import { AgentPerformanceChart } from '@/components/dashboard/agent-performance-chart';
import { TextSectionWidget } from './widgets/text-section-widget';
import { SectionTitleWidget } from './widgets/section-title-widget';
import { ColorSettingsWidget } from './widgets/color-settings-widget';
import { PageBreakWidget } from './widgets/page-break-widget';

interface ReportContentProps {
  widgets: { id: string; type: string }[];
  agentId?: number;
  period?: string;
  onRemoveWidget: (id: string) => void;
  chartColors?: {
    primary: string;
    secondary: string;
    tertiary: string;
    quaternary: string;
  };
}

export function ReportContent({ 
  widgets, 
  agentId, 
  period, 
  onRemoveWidget,
  chartColors: propChartColors
}: ReportContentProps) {
  // Use passed in chart colors or default to these values
  const [localChartColors, setLocalChartColors] = useState({
    primary: '#2563eb',   // Blue
    secondary: '#16a34a', // Green
    tertiary: '#d97706',  // Amber
    quaternary: '#db2777', // Pink
  });
  
  // Use either props colors or local state
  const chartColors = propChartColors || localChartColors;
  
  // Widget types that should span the full width (two columns)
  const fullWidthTypes = ['text-section', 'section-title', 'page-break', 'color-settings'];

  const handleColorSave = (colors: {
    primary: string;
    secondary: string;
    tertiary: string;
    quaternary: string;
  }) => {
    setLocalChartColors(colors);
    // Here you would also update any charts using these colors
  };

  const renderWidget = (widget: { id: string; type: string }) => {
    switch (widget.type) {
      case 'total-properties-sold':
        return (
          <PropertiesSoldWidget 
            agentId={agentId} 
            period={period} 
          />
        );
      case 'total-revenue':
        return (
          <TotalRevenueWidget 
            agentId={agentId} 
            period={period} 
          />
        );
      case 'average-selling-price':
        return (
          <AveragePriceWidget 
            agentId={agentId} 
            period={period} 
          />
        );
      case 'average-days-on-market':
        return (
          <DaysOnMarketWidget 
            agentId={agentId} 
            period={period} 
          />
        );
      case 'sales-by-property-type':
        return <PropertyTypeChart chartColors={[
          chartColors.primary,
          chartColors.secondary,
          chartColors.tertiary,
          chartColors.quaternary
        ]} />;
      case 'monthly-sales':
        return <MonthlySalesChart 
          period={period} 
          hideTitle={true}
          chartColors={[
            chartColors.primary,
            chartColors.secondary
          ]}
        />;
      case 'top-sales':
        return (
          <TopSalesWidget 
            agentId={agentId} 
            period={period} 
            limit={5}
          />
        );
      case 'agent-leaderboard':
        return <AgentPerformanceChart chartColors={[
          chartColors.primary,
          chartColors.secondary,
          chartColors.tertiary
        ]} />;
      case 'text-section':
        return <TextSectionWidget />;
      case 'section-title':
        return <SectionTitleWidget />;
      case 'color-settings':
        return <ColorSettingsWidget onSave={handleColorSave} initialColors={chartColors} />;
      case 'page-break':
        return <PageBreakWidget />;
      default:
        return <div>Unknown widget type: {widget.type}</div>;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {widgets.map((widget) => (
        <ReportWidget
          key={widget.id}
          title={getWidgetTitle(widget.type)}
          type={widget.type}
          onRemove={() => onRemoveWidget(widget.id)}
          className={fullWidthTypes.includes(widget.type) ? "md:col-span-2" : ""}
          isExpandable={!fullWidthTypes.includes(widget.type)}
          widgetId={widget.id}
        >
          {renderWidget(widget)}
        </ReportWidget>
      ))}
    </div>
  );
}

function getWidgetTitle(type: string): string {
  switch (type) {
    case 'total-properties-sold':
      return 'Properties Sold';
    case 'total-revenue':
      return 'Total Revenue';
    case 'average-selling-price':
      return 'Average Selling Price';
    case 'average-days-on-market':
      return 'Average Days on Market';
    case 'sales-by-property-type':
      return 'Sales by Property Type';
    case 'monthly-sales':
      return 'Monthly Sales Performance';
    case 'top-sales':
      return 'Top 5 Sales';
    case 'agent-leaderboard':
      return 'Agent Performance';
    case 'text-section':
      return 'Text Section';
    case 'section-title':
      return 'Section Title';
    case 'color-settings':
      return 'Chart Colors';
    case 'page-break':
      return 'Page Break';
    default:
      return 'Unknown Widget';
  }
}