import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Calendar, Home, Users, Loader2 } from "lucide-react";
import { dateRangeOptions, propertyTypeOptions } from "@/lib/utils";
import { downloadCSV } from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

interface FilterBarProps {
  onFilterChange: (filters: FilterState) => void;
  onRefresh: () => void;
}

export interface FilterState {
  dateRange: string;
  propertyType: string;
  agentId: string;
}

export function FilterBar({ onFilterChange, onRefresh }: FilterBarProps) {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    dateRange: "30days",
    propertyType: "all",
    agentId: "all",
  });
  
  // Define Agent interface
  interface Agent {
    id: number;
    name: string;
    [key: string]: any;
  }
  
  // Fetch agents for the dropdown
  const { data: agents = [] as Agent[] } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
  });
  
  // Fetch transaction data for export - with filters
  const { data: transactionsData, isFetching: isTransactionsFetching } = useQuery({
    queryKey: ["/api/transactions", filters],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (filters.dateRange !== "all") queryParams.append("dateRange", filters.dateRange);
      if (filters.propertyType !== "all") queryParams.append("propertyType", filters.propertyType);
      if (filters.agentId !== "all") queryParams.append("agentId", filters.agentId);
      
      const url = `/api/transactions?${queryParams.toString()}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch transactions");
      return response.json();
    },
  });
  
  const handleDateRangeChange = (value: string) => {
    // Toast notification for filter change
    toast({
      title: "Date range filter applied",
      description: `Data filtered to ${dateRangeOptions.find(opt => opt.value === value)?.label || value}`,
    });
    
    const newFilters = { ...filters, dateRange: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
    
    // Invalidate relevant queries
    queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
    queryClient.invalidateQueries({ queryKey: ["/api/charts/agent-commission"] });
  };
  
  const handlePropertyTypeChange = (value: string) => {
    // Toast notification for filter change
    toast({
      title: "Property type filter applied",
      description: `Showing ${value === "all" ? "all properties" : propertyTypeOptions.find(opt => opt.value === value)?.label || value}`,
    });
    
    const newFilters = { ...filters, propertyType: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
    
    // Invalidate relevant queries
    queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
  };
  
  const handleAgentChange = (value: string) => {
    // Toast notification for filter change
    const agentName = value === "all" 
      ? "all agents" 
      : agents.find((a: Agent) => a.id.toString() === value)?.name || "selected agent";
      
    toast({
      title: "Agent filter applied",
      description: `Showing data for ${agentName}`,
    });
    
    const newFilters = { ...filters, agentId: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
    
    // Invalidate relevant queries
    queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
  };
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
      
      // Invalidate all relevant queries
      await queryClient.invalidateQueries();
      
      toast({
        title: "Dashboard refreshed",
        description: "All data has been updated with the latest information",
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "There was a problem refreshing the dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const handleExport = async () => {
    if (!transactionsData?.data?.length) {
      toast({
        title: "No data to export",
        description: "There are no transactions matching your current filters.",
        variant: "destructive",
      });
      return;
    }
    
    setIsExporting(true);
    try {
      // Include the current filter information in the filename
      const dateInfo = dateRangeOptions.find(opt => opt.value === filters.dateRange)?.label || "all-time";
      const propertyInfo = filters.propertyType === "all" ? "all-properties" : filters.propertyType;
      const agentInfo = filters.agentId === "all" 
        ? "all-agents" 
        : (agents.find((a: Agent) => a.id.toString() === filters.agentId)?.name || "filtered-agent");
      
      const filename = `estate-dashboard_${dateInfo}_${propertyInfo}_${agentInfo.replace(/\s+/g, '-')}.csv`;
      downloadCSV(transactionsData.data, filename);
      
      toast({
        title: "Export successful",
        description: `Data has been exported to ${filename}`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was a problem exporting the data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start gap-5 w-full md:w-auto">
          <div className="flex flex-row items-center">
            <Calendar className="mr-2 h-5 w-5 text-blue-500" />
            <div>
              <label htmlFor="date-range" className="block text-sm font-medium text-gray-700 mb-1.5">Date Range</label>
              <Select value={filters.dateRange} onValueChange={handleDateRangeChange}>
                <SelectTrigger className="w-[180px] border-gray-300 bg-white shadow-sm hover:border-gray-400 transition-colors" id="date-range">
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  {dateRangeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex flex-row items-center">
            <Home className="mr-2 h-5 w-5 text-green-500" />
            <div>
              <label htmlFor="property-type" className="block text-sm font-medium text-gray-700 mb-1.5">Property Type</label>
              <Select value={filters.propertyType} onValueChange={handlePropertyTypeChange}>
                <SelectTrigger className="w-[180px] border-gray-300 bg-white shadow-sm hover:border-gray-400 transition-colors" id="property-type">
                  <SelectValue placeholder="All Properties" />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex flex-row items-center">
            <Users className="mr-2 h-5 w-5 text-purple-500" />
            <div>
              <label htmlFor="agent" className="block text-sm font-medium text-gray-700 mb-1.5">Sales Agent</label>
              <Select value={filters.agentId} onValueChange={handleAgentChange}>
                <SelectTrigger className="w-[180px] border-gray-300 bg-white shadow-sm hover:border-gray-400 transition-colors" id="agent">
                  <SelectValue placeholder="All Agents" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Agents</SelectItem>
                  {agents.map((agent: Agent) => (
                    <SelectItem key={agent.id} value={agent.id.toString()}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-4 items-end mt-4 sm:mt-0">
          <Button 
            size="sm" 
            className="bg-blue-600 hover:bg-blue-700 h-10 px-4" 
            onClick={handleExport}
            disabled={isExporting || isTransactionsFetching || !transactionsData?.data?.length}
          >
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Export
          </Button>
        </div>
      </div>
      
      {/* Loading indicator */}
      {isTransactionsFetching && (
        <div className="flex mt-3">
          <div className="text-xs text-gray-500 px-2 py-1 flex items-center">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Updating data...
          </div>
        </div>
      )}
    </div>
  );
}
