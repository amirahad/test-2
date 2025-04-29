import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, ChevronDown, ChevronUp, Maximize2, Minimize2, Download } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ReportWidgetProps {
  title: string;
  type: string;
  children: React.ReactNode;
  onRemove: () => void;
  className?: string;
  isExpandable?: boolean;
  widgetId?: string; // Adding the unique ID for each widget
}

export function ReportWidget({ 
  title, 
  type, 
  children, 
  onRemove, 
  className = "", 
  isExpandable = true,
  widgetId
}: ReportWidgetProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Card 
      className={`shadow-sm hover:shadow transition-shadow ${isExpanded ? 'md:col-span-2' : ''} ${className}`} 
      data-widget-id={widgetId || type}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium group flex items-center">
          {title}
        </CardTitle>
        
        <div className="flex items-center space-x-1">
          {/* Only show collapse button if widget is not a page break */}
          {type !== 'page-break' && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 w-7 p-0" 
              onClick={toggleCollapse}
            >
              {isCollapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
          )}
          
          {/* Show expand button for charts and tables */}
          {isExpandable && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 w-7 p-0" 
              onClick={toggleExpand}
            >
              {isExpanded ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="12" cy="5" r="1" />
                  <circle cx="12" cy="19" r="1" />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isExpandable && (
                <DropdownMenuItem 
                  className="flex items-center"
                  onClick={toggleExpand}
                >
                  {isExpanded ? (
                    <>
                      <Minimize2 className="mr-2 h-4 w-4" />
                      <span>Collapse to normal size</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="mr-2 h-4 w-4" />
                      <span>Expand to full width</span>
                    </>
                  )}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                className="flex items-center text-red-600" 
                onClick={(e) => {
                  e.preventDefault();
                  onRemove();
                }}
              >
                <X className="mr-2 h-4 w-4" />
                <span>Remove</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className={`widget-content ${isExpanded ? 'min-h-[300px]' : ''}`}>
        {!isCollapsed && children}
        {isCollapsed && (
          <div className="h-8 flex items-center justify-center">
            <span className="text-xs text-gray-400">Content collapsed</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}