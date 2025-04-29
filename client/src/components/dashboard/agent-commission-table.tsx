import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { Loader2, TrendingUp, ArrowUpDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface AgentCommissionData {
  name: string;
  listings: number;
  totalCommission: number;
  averageCommission: number | null;
  commissionPercent: number;
  auctionPercent: number;
  totalAdminFee: number;
}

interface AgentCommissionTableProps {
  className?: string;
  isDarkMode?: boolean;
}

export function AgentCommissionTable({ className, isDarkMode = false }: AgentCommissionTableProps) {
  // Fetch agent commission data from API
  const { data, isLoading } = useQuery<AgentCommissionData[]>({
    queryKey: ["/api/charts/agent-commission"]
  });
  
  // State for search and sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState("totalCommission");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  
  // Handle sort click
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc"); // Default to descending for commission data
    }
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Calculate max commission for the progress bar
  const maxCommission = data ? Math.max(...data.map(agent => agent.totalCommission)) : 0;
  
  // Filter and sort data
  const filteredAndSortedData = data
    ? [...data]
        .filter(agent => agent.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
          if (sortColumn === "name") {
            return sortDirection === "asc" 
              ? a.name.localeCompare(b.name) 
              : b.name.localeCompare(a.name);
          } else {
            const aValue = a[sortColumn as keyof AgentCommissionData] as number;
            const bValue = b[sortColumn as keyof AgentCommissionData] as number;
            return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
          }
        })
    : [];

  // Check if we're in TV view
  const isTVView = typeof window !== 'undefined' && window.location.pathname.includes('tv-view');

  // TV View version
  if (isTVView) {
    return (
      <div className="w-full h-full bg-gray-800 rounded-lg text-white p-3">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="pb-2 font-bold text-gray-300">Agent</th>
                <th className="pb-2 font-bold text-center text-gray-300">Listings</th>
                <th className="pb-2 font-bold text-right text-gray-300">Total Comm</th>
                <th className="pb-2 font-bold text-right text-gray-300">Comm %</th>
                <th className="pb-2 font-bold text-right text-gray-300">Admin Fee</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((agent) => (
                <tr key={agent.name} className="border-b border-gray-700">
                  <td className="py-1 font-medium">{agent.name}</td>
                  <td className="py-1 text-center">{agent.listings}</td>
                  <td className="py-1 text-right font-bold text-blue-400">
                    {agent.totalCommission > 0 ? formatCurrency(agent.totalCommission) : '-'}
                  </td>
                  <td className="py-1 text-right">
                    {agent.commissionPercent > 0 ? `${agent.commissionPercent.toFixed(2)}%` : '-'}
                  </td>
                  <td className="py-1 text-right font-medium text-green-400">
                    {agent.totalAdminFee > 0 ? formatCurrency(agent.totalAdminFee) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Standard dashboard version
  return (
    <Card className={`${className} shadow-md`}>
      <CardHeader className="px-6 py-4 border-b bg-gray-50">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <CardTitle className="text-xl font-semibold flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
            Agent Commission Performance
          </CardTitle>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search by agent name..."
              className="pl-8 bg-white border-gray-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-52">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50">
                <tr className="border-b border-t text-left">
                  <th className="py-3 px-6 font-semibold text-gray-600">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("name")}
                      className="hover:bg-gray-100 -ml-3 font-semibold"
                    >
                      Agent Name
                      {sortColumn === "name" && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  </th>
                  <th className="py-3 px-4 font-semibold text-gray-600 text-center">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("listings")}
                      className="hover:bg-gray-100 -ml-3 font-semibold"
                    >
                      Listings
                      {sortColumn === "listings" && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  </th>
                  <th className="py-3 px-4 font-semibold text-gray-600 text-right">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("totalCommission")}
                      className="hover:bg-gray-100 -ml-3 font-semibold"
                    >
                      Total Commission
                      {sortColumn === "totalCommission" && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  </th>
                  <th className="py-3 px-4 font-semibold text-gray-600 text-center">Performance</th>
                  <th className="py-3 px-4 font-semibold text-gray-600 text-right">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("averageCommission")}
                      className="hover:bg-gray-100 -ml-3 font-semibold"
                    >
                      Avg Commission
                      {sortColumn === "averageCommission" && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  </th>
                  <th className="py-3 px-4 font-semibold text-gray-600 text-right">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("commissionPercent")}
                      className="hover:bg-gray-100 -ml-3 font-semibold"
                    >
                      Comm %
                      {sortColumn === "commissionPercent" && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  </th>
                  <th className="py-3 px-4 font-semibold text-gray-600 text-right">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("auctionPercent")}
                      className="hover:bg-gray-100 -ml-3 font-semibold"
                    >
                      Auction %
                      {sortColumn === "auctionPercent" && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  </th>
                  <th className="py-3 px-4 font-semibold text-gray-600 text-right">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("totalAdminFee")}
                      className="hover:bg-gray-100 -ml-3 font-semibold"
                    >
                      Admin Fee
                      {sortColumn === "totalAdminFee" && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedData.map((agent, index) => (
                  <tr key={agent.name} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-gray-50' : ''}`}>
                    <td className="py-4 px-6 font-medium">
                      {index === 0 && sortColumn === "totalCommission" && sortDirection === "desc" && (
                        <Badge className="mr-2 bg-blue-100 text-blue-800 border-blue-200">Top Performer</Badge>
                      )}
                      {agent.name}
                    </td>
                    <td className="py-4 px-4 text-center font-medium">{agent.listings}</td>
                    <td className="py-4 px-4 text-right font-semibold text-blue-600">
                      {agent.totalCommission > 0 ? formatCurrency(agent.totalCommission) : '-'}
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-full px-1">
                        <Progress 
                          value={(agent.totalCommission / maxCommission) * 100} 
                          className="h-2" 
                          indicatorClassName={index === 0 ? "bg-blue-600" : ""}
                        />
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {agent.averageCommission ? formatCurrency(agent.averageCommission) : 'N/A'}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {agent.commissionPercent > 0 ? `${agent.commissionPercent.toFixed(2)}%` : '-'}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {agent.auctionPercent > 0 ? `${agent.auctionPercent}%` : '0%'}
                    </td>
                    <td className="py-4 px-4 text-right font-semibold text-green-600">
                      {agent.totalAdminFee > 0 ? formatCurrency(agent.totalAdminFee) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}