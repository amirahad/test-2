import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart, LineChart, PieChart, ActivitySquare, Clock, DollarSign, 
  TrendingUp, Home, Users, Award, Type, AlignLeft, Heading, FileText,
  Palette
} from 'lucide-react';

interface WidgetSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWidgetSelect: (widgetType: string) => void;
}

export function WidgetSelector({ open, onOpenChange, onWidgetSelect }: WidgetSelectorProps) {
  const handleSelectWidget = (widgetType: string) => {
    onWidgetSelect(widgetType);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Widget to Report</DialogTitle>
          <DialogDescription>
            Select a widget to add to your custom report
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="stats" className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="tables">Tables</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="flex-1">
            <TabsContent value="stats" className="space-y-4 mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {statsWidgets.map((widget) => (
                  <WidgetOption
                    key={widget.id}
                    title={widget.title}
                    description={widget.description}
                    icon={widget.icon}
                    onClick={() => handleSelectWidget(widget.id)}
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="charts" className="space-y-4 mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {chartWidgets.map((widget) => (
                  <WidgetOption
                    key={widget.id}
                    title={widget.title}
                    description={widget.description}
                    icon={widget.icon}
                    onClick={() => handleSelectWidget(widget.id)}
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="tables" className="space-y-4 mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tableWidgets.map((widget) => (
                  <WidgetOption
                    key={widget.id}
                    title={widget.title}
                    description={widget.description}
                    icon={widget.icon}
                    onClick={() => handleSelectWidget(widget.id)}
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="content" className="space-y-4 mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contentWidgets.map((widget) => (
                  <WidgetOption
                    key={widget.id}
                    title={widget.title}
                    description={widget.description}
                    icon={widget.icon}
                    onClick={() => handleSelectWidget(widget.id)}
                  />
                ))}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface WidgetOptionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

function WidgetOption({ title, description, icon, onClick }: WidgetOptionProps) {
  return (
    <div
      className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3 mt-1 p-2 bg-primary/10 rounded-lg text-primary">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-medium">{title}</h3>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
}

const statsWidgets = [
  {
    id: 'total-properties-sold',
    title: 'Properties Sold',
    description: 'Display the total number of properties sold in the selected period',
    icon: <Home className="h-5 w-5" />,
  },
  {
    id: 'total-revenue',
    title: 'Total Revenue',
    description: 'Show the total revenue generated from property sales',
    icon: <DollarSign className="h-5 w-5" />,
  },
  {
    id: 'average-selling-price',
    title: 'Average Selling Price',
    description: 'Calculate and display the average property selling price',
    icon: <TrendingUp className="h-5 w-5" />,
  },
  {
    id: 'average-days-on-market',
    title: 'Days on Market',
    description: 'Show the average number of days properties were listed before being sold',
    icon: <Clock className="h-5 w-5" />,
  },
];

const chartWidgets = [
  {
    id: 'monthly-sales',
    title: 'Monthly Sales',
    description: 'Visualize sales performance over months with revenue trends',
    icon: <LineChart className="h-5 w-5" />,
  },
  {
    id: 'sales-by-property-type',
    title: 'Property Type Distribution',
    description: 'Show the breakdown of sales by property types (house, apartment, etc.)',
    icon: <PieChart className="h-5 w-5" />,
  },
  {
    id: 'agent-leaderboard',
    title: 'Agent Performance',
    description: 'Compare performance metrics between agents in a visual format',
    icon: <BarChart className="h-5 w-5" />,
  },
  {
    id: 'sales-by-suburb',
    title: 'Sales by Location',
    description: 'View sales distribution across different suburbs or regions',
    icon: <ActivitySquare className="h-5 w-5" />,
  },
];

const tableWidgets = [
  {
    id: 'top-sales',
    title: 'Top Sales',
    description: 'List the highest-value property sales during the selected period',
    icon: <Award className="h-5 w-5" />,
  },
  {
    id: 'agent-commission',
    title: 'Agent Commission',
    description: 'Display commission earned by agents during the selected period',
    icon: <Users className="h-5 w-5" />,
  },
];

const contentWidgets = [
  {
    id: 'section-title',
    title: 'Section Title',
    description: 'Add a heading to organize your report content (takes full width)',
    icon: <Heading className="h-5 w-5" />,
  },
  {
    id: 'text-section',
    title: 'Text Section',
    description: 'Add paragraphs of text to provide context or analysis (takes full width)',
    icon: <AlignLeft className="h-5 w-5" />,
  },
  {
    id: 'page-break',
    title: 'Page Break',
    description: 'Force a new page to start at this point in the PDF report',
    icon: <FileText className="h-5 w-5" />,
  },
];