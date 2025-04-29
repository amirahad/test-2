import React from 'react';
import { MonthlySalesChart } from '@/components/dashboard/monthly-sales-chart';
import { PropertyTypeChart } from '@/components/dashboard/property-type-chart';
import { PropertiesSoldWidget } from './widgets/properties-sold-widget';
import { TotalRevenueWidget } from './widgets/total-revenue-widget';
import { AveragePriceWidget } from './widgets/average-price-widget';
import { DaysOnMarketWidget } from './widgets/days-on-market-widget';
import { TopSalesWidget } from './widgets/top-sales-widget';
import { AgentPerformanceChart } from '@/components/dashboard/agent-performance-chart';

interface PdfReportContentProps {
  widgets: { id: string; type: string }[];
  agentId?: number;
  period?: string;
}

export function PdfReportContent({ widgets, agentId, period }: PdfReportContentProps) {
  const renderWidget = (widget: { id: string; type: string }) => {
    switch (widget.type) {
      case 'total-properties-sold':
        return (
          <div style={{ padding: '10px' }}>
            <h3 style={{ fontSize: '16pt', marginBottom: '10px', textAlign: 'center' }}>Properties Sold</h3>
            <PropertiesSoldWidget agentId={agentId} period={period} />
          </div>
        );
      case 'total-revenue':
        return (
          <div style={{ padding: '10px' }}>
            <h3 style={{ fontSize: '16pt', marginBottom: '10px', textAlign: 'center' }}>Total Revenue</h3>
            <TotalRevenueWidget agentId={agentId} period={period} />
          </div>
        );
      case 'average-selling-price':
        return (
          <div style={{ padding: '10px' }}>
            <h3 style={{ fontSize: '16pt', marginBottom: '10px', textAlign: 'center' }}>Average Selling Price</h3>
            <AveragePriceWidget agentId={agentId} period={period} />
          </div>
        );
      case 'average-days-on-market':
        return (
          <div style={{ padding: '10px' }}>
            <h3 style={{ fontSize: '16pt', marginBottom: '10px', textAlign: 'center' }}>Average Days on Market</h3>
            <DaysOnMarketWidget agentId={agentId} period={period} />
          </div>
        );
      case 'sales-by-property-type':
        return (
          <div style={{ padding: '10px' }}>
            <h3 style={{ fontSize: '16pt', marginBottom: '10px', textAlign: 'center' }}>Sales by Property Type</h3>
            <div style={{ height: '250px' }}>
              <PropertyTypeChart />
            </div>
          </div>
        );
      case 'monthly-sales':
        return (
          <div style={{ padding: '10px' }}>
            <h3 style={{ fontSize: '16pt', marginBottom: '10px', textAlign: 'center' }}>Monthly Sales Performance</h3>
            <div style={{ height: '250px' }}>
              <MonthlySalesChart period={period} />
            </div>
          </div>
        );
      case 'top-sales':
        return (
          <div style={{ padding: '10px' }}>
            <h3 style={{ fontSize: '16pt', marginBottom: '10px', textAlign: 'center' }}>Top 5 Sales</h3>
            <TopSalesWidget agentId={agentId} period={period} limit={5} />
          </div>
        );
      case 'agent-leaderboard':
        return (
          <div style={{ padding: '10px' }}>
            <h3 style={{ fontSize: '16pt', marginBottom: '10px', textAlign: 'center' }}>Agent Performance</h3>
            <AgentPerformanceChart />
          </div>
        );
      default:
        return <div>Unknown widget type: {widget.type}</div>;
    }
  };

  // Group widgets into pairs for a two-column layout
  const widgetPairs = [];
  for (let i = 0; i < widgets.length; i += 2) {
    widgetPairs.push(widgets.slice(i, i + 2));
  }

  return (
    <div style={{ pageBreakInside: 'avoid' }}>
      {widgetPairs.map((pair, pairIndex) => (
        <div 
          key={pairIndex}
          style={{ 
            display: 'flex', 
            marginBottom: '20px',
            pageBreakInside: 'avoid'
          }}
        >
          {pair.map((widget) => (
            <div 
              key={widget.id} 
              style={{ 
                flex: 1,
                margin: '0 10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                overflow: 'hidden',
                backgroundColor: '#fff',
                pageBreakInside: 'avoid'
              }}
            >
              {renderWidget(widget)}
            </div>
          ))}
          {pair.length === 1 && <div style={{ flex: 1, margin: '0 10px' }}></div>}
        </div>
      ))}
    </div>
  );
}