import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface PropertyTransaction {
  address: string;
  suburb: string;
  type: string;
  office: string;
  agent: string;
  unsold: string;
  removeFromMrkt: string;
  mdUse: string;
  officeRef: string;
  soldPrice: string;
  underContract: string;
  settlementDate: string;
  incGst: string;
  comm: string;
  officeLead: string;
  saleType: string;
  dom: string;
  trafficLights: string;
  ojc: string;
  rental: string;
}

interface PropertyTransactionTableProps {
  className?: string;
  isDarkMode?: boolean;
}

export function PropertyTransactionTable({ className, isDarkMode = false }: PropertyTransactionTableProps) {
  // Fetch property transactions data from API
  const { data, isLoading } = useQuery<PropertyTransaction[]>({
    queryKey: ["/api/property-transactions"]
  });
  
  // State for search and sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState("address");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  // Handle sort click
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Format currency
  const formatCurrency = (value: string | undefined) => {
    if (!value || value === "") return "-";
    return value.startsWith("$") ? value : "$" + value;
  };
  
  // Get property status badge
  const getStatusBadge = (transaction: PropertyTransaction) => {
    if (transaction?.soldPrice && transaction.soldPrice !== "") {
      return <Badge className="bg-green-500 hover:bg-green-600">Sold</Badge>;
    } else if (transaction?.underContract && transaction.underContract !== "") {
      return <Badge className="bg-amber-500 hover:bg-amber-600">Under Contract</Badge>;
    } else if (transaction?.removeFromMrkt && transaction.removeFromMrkt !== "") {
      return <Badge className="bg-red-500 hover:bg-red-600">Removed</Badge>;
    } else {
      return <Badge className="bg-blue-500 hover:bg-blue-600">Listed</Badge>;
    }
  };
  
  // Filter and sort data
  const filteredAndSortedData = data
    ? [...data]
        .filter(
          (transaction) =>
            (transaction.address?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (transaction.suburb?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (transaction.agent?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
          const aValue = (a[sortColumn as keyof PropertyTransaction] || '') as string;
          const bValue = (b[sortColumn as keyof PropertyTransaction] || '') as string;
          
          if (sortColumn === "soldPrice" || sortColumn === "comm") {
            const aNum = parseFloat((aValue || '').replace(/[^0-9.-]+/g, "") || "0");
            const bNum = parseFloat((bValue || '').replace(/[^0-9.-]+/g, "") || "0");
            return sortDirection === "asc" ? aNum - bNum : bNum - aNum;
          }
          
          return sortDirection === "asc"
            ? String(aValue).localeCompare(String(bValue))
            : String(bValue).localeCompare(String(aValue));
        })
    : [];

  // Check if we're in TV view
  const isTVView = typeof window !== 'undefined' && window.location.pathname.includes('tv-view');

  // TV View version
  if (isTVView) {
    return (
      <div className="w-full h-full bg-gray-800 rounded-lg text-white p-1">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="py-2 px-1 font-bold text-gray-300">Address</th>
                <th className="py-2 px-1 font-bold text-gray-300">Suburb</th>
                <th className="py-2 px-1 font-bold text-gray-300">Type</th>
                <th className="py-2 px-1 font-bold text-gray-300">Office</th>
                <th className="py-2 px-1 font-bold text-gray-300">Agent</th>
                <th className="py-2 px-1 font-bold text-gray-300">Status</th>
                <th className="py-2 px-1 font-bold text-gray-300">Sold Price</th>
                <th className="py-2 px-1 font-bold text-gray-300">Under Contract</th>
                <th className="py-2 px-1 font-bold text-gray-300">Settlement</th>
                <th className="py-2 px-1 font-bold text-gray-300">Comm</th>
                <th className="py-2 px-1 font-bold text-gray-300">Sale Type</th>
                <th className="py-2 px-1 font-bold text-gray-300">DOM</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((transaction, index) => (
                <tr key={index} className="border-b border-gray-700">
                  <td className="py-1.5 px-1 font-medium">{transaction.address}</td>
                  <td className="py-1.5 px-1">{transaction.suburb}</td>
                  <td className="py-1.5 px-1">{transaction.type}</td>
                  <td className="py-1.5 px-1">{transaction.office}</td>
                  <td className="py-1.5 px-1">{transaction.agent}</td>
                  <td className="py-1.5 px-1">{getStatusBadge(transaction)}</td>
                  <td className="py-1.5 px-1 font-bold text-blue-400">
                    {formatCurrency(transaction.soldPrice)}
                  </td>
                  <td className="py-1.5 px-1">{transaction.underContract || "-"}</td>
                  <td className="py-1.5 px-1">{transaction.settlementDate || "-"}</td>
                  <td className="py-1.5 px-1 font-medium text-green-400">
                    {formatCurrency(transaction.comm)}
                  </td>
                  <td className="py-1.5 px-1">{transaction.saleType}</td>
                  <td className="py-1.5 px-1">{transaction.dom}</td>
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
          <CardTitle className="text-xl font-semibold">Property Transactions</CardTitle>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search by address, suburb or agent..."
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
                      onClick={() => handleSort("address")}
                      className="hover:bg-gray-100 -ml-3 font-semibold"
                    >
                      Address
                      {sortColumn === "address" && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  </th>
                  <th className="py-3 px-4 font-semibold text-gray-600">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("suburb")}
                      className="hover:bg-gray-100 -ml-3 font-semibold"
                    >
                      Suburb
                      {sortColumn === "suburb" && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  </th>
                  <th className="py-3 px-4 font-semibold text-gray-600">Type</th>
                  <th className="py-3 px-4 font-semibold text-gray-600">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("agent")}
                      className="hover:bg-gray-100 -ml-3 font-semibold"
                    >
                      Agent
                      {sortColumn === "agent" && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  </th>
                  <th className="py-3 px-4 font-semibold text-gray-600">Status</th>
                  <th className="py-3 px-4 font-semibold text-gray-600">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("soldPrice")}
                      className="hover:bg-gray-100 -ml-3 font-semibold"
                    >
                      Sold Price
                      {sortColumn === "soldPrice" && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  </th>
                  <th className="py-3 px-4 font-semibold text-gray-600">Under Contract</th>
                  <th className="py-3 px-4 font-semibold text-gray-600">Settlement Date</th>
                  <th className="py-3 px-4 font-semibold text-gray-600">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("comm")}
                      className="hover:bg-gray-100 -ml-3 font-semibold"
                    >
                      Commission
                      {sortColumn === "comm" && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  </th>
                  <th className="py-3 px-4 font-semibold text-gray-600">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("dom")}
                      className="hover:bg-gray-100 -ml-3 font-semibold"
                    >
                      DOM
                      {sortColumn === "dom" && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedData.map((transaction, index) => (
                  <tr key={index} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-gray-50' : ''}`}>
                    <td className="py-4 px-6 font-medium">{transaction.address}</td>
                    <td className="py-4 px-4">{transaction.suburb}</td>
                    <td className="py-4 px-4">
                      <Badge variant="outline" className="bg-gray-100 text-gray-800 font-medium border-gray-200">
                        {transaction.type}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">{transaction.agent}</td>
                    <td className="py-4 px-4">{getStatusBadge(transaction)}</td>
                    <td className="py-4 px-4 font-semibold text-blue-600">{formatCurrency(transaction.soldPrice)}</td>
                    <td className="py-4 px-4">{transaction.underContract || "-"}</td>
                    <td className="py-4 px-4">{transaction.settlementDate || "-"}</td>
                    <td className="py-4 px-4 font-semibold text-green-600">{formatCurrency(transaction.comm)}</td>
                    <td className="py-4 px-4 font-semibold">{transaction.dom || "-"}</td>
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