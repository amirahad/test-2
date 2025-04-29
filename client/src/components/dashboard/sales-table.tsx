import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency, formatDate } from "@/lib/api";
import { PropertyBadge } from "@/components/ui/property-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Plus, ArrowLeft, ArrowRight, ArrowUpDown } from "lucide-react";
import { EditTransactionDialog } from "./edit-transaction-dialog";
import { ViewTransactionDialog } from "./view-transaction-dialog";
import { useToast } from "@/hooks/use-toast";

interface SalesTableProps {
  filters?: {
    dateRange?: string;
    propertyType?: string;
    agentId?: string;
  };
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export function SalesTable({ filters }: SalesTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'transactionDate', direction: 'desc' });
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Construct the query key with filters
  const queryKey = ["/api/transactions", { 
    page,
    pageSize,
    ...(filters?.dateRange && filters.dateRange !== "all" && { period: filters.dateRange }),
    ...(filters?.propertyType && { propertyType: filters.propertyType }),
    ...(filters?.agentId && { agentId: filters.agentId }),
    sort: `${sortConfig.key}-${sortConfig.direction}`,
    search
  }];
  
  // Fetch transactions with filters and pagination
  const { data, isLoading, isError } = useQuery({ queryKey });
  
  // Fetch agents for mapping agent IDs to names
  const { data: agents = [] } = useQuery({
    queryKey: ["/api/agents"],
  });
  
  // Delete mutation
  const deleteTransaction = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/transactions/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Transaction deleted",
        description: "The transaction has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/charts"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete transaction: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  // Get agent name by ID
  const getAgentName = (agentId: number) => {
    const agent = agents.find((a: any) => a.id === agentId);
    return agent ? agent.name : "Unknown";
  };
  
  // Handle sort
  const handleSort = (key: string) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  // Render sort indicator
  const renderSortIndicator = (key: string) => {
    if (sortConfig.key === key) {
      return (
        <span className="ml-1">
          {sortConfig.direction === 'asc' ? '↑' : '↓'}
        </span>
      );
    }
    return <ArrowUpDown className="ml-1 h-4 w-4" />;
  };
  
  // Handle edit button click
  const handleEdit = (transaction: any) => {
    setSelectedTransaction(transaction);
    setIsEditDialogOpen(true);
  };
  
  // Handle view button click
  const handleView = (transaction: any) => {
    setSelectedTransaction(transaction);
    setIsViewDialogOpen(true);
  };
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page when search changes
  };
  
  // Handle add new transaction
  const handleAdd = () => {
    setSelectedTransaction(null);
    setIsEditDialogOpen(true);
  };
  
  // Handle pagination
  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };
  
  const handleNextPage = () => {
    if (data && page < Math.ceil(data.total / pageSize)) {
      setPage(page + 1);
    }
  };
  
  const handlePageClick = (pageNumber: number) => {
    setPage(pageNumber);
  };
  
  // Generate pagination items
  const renderPagination = () => {
    if (!data) return null;
    
    const totalPages = Math.ceil(data.total / pageSize);
    if (totalPages <= 1) return null;
    
    let pages = [];
    
    // Always show first page, current page, and last page
    // Add ellipsis if needed
    if (totalPages <= 5) {
      // Show all pages if there are 5 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Handle middle pages
      if (page > 3) {
        pages.push(-1); // ellipsis
      }
      
      // Show current page and surrounding pages
      for (let i = Math.max(2, page - 1); i <= Math.min(page + 1, totalPages - 1); i++) {
        pages.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (page < totalPages - 2) {
        pages.push(-2); // ellipsis
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return (
      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
        <Button 
          variant="outline" 
          className="relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium"
          onClick={handlePrevPage}
          disabled={page === 1}
        >
          <span className="sr-only">Previous</span>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        {pages.map((pageNum, i) => {
          if (pageNum < 0) {
            // Render ellipsis
            return (
              <span key={`ellipsis-${i}`} className="relative inline-flex items-center px-4 py-2 border text-sm font-medium bg-white text-gray-700">
                ...
              </span>
            );
          }
          
          return (
            <Button
              key={pageNum}
              variant={page === pageNum ? "default" : "outline"}
              className="relative inline-flex items-center px-4 py-2 border text-sm font-medium"
              onClick={() => handlePageClick(pageNum)}
            >
              {pageNum}
            </Button>
          );
        })}
        
        <Button 
          variant="outline"
          className="relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium"
          onClick={handleNextPage}
          disabled={!data || page >= Math.ceil(data.total / pageSize)}
        >
          <span className="sr-only">Next</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </nav>
    );
  };
  
  return (
    <>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Sales Transactions</h3>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search transactions..."
                value={search}
                onChange={handleSearchChange}
                className="w-full pl-3 pr-10 py-1.5 text-sm"
              />
            </div>
            <Button onClick={handleAdd}>
              <Plus className="mr-1 h-4 w-4" /> Add
            </Button>
          </div>
        </div>
        
        <div className="border-t border-gray-200 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="px-6 py-3 cursor-pointer" 
                  onClick={() => handleSort('propertyAddress')}
                >
                  <div className="flex items-center">
                    Property
                    {renderSortIndicator('propertyAddress')}
                  </div>
                </TableHead>
                <TableHead 
                  className="px-6 py-3 cursor-pointer" 
                  onClick={() => handleSort('propertyType')}
                >
                  <div className="flex items-center">
                    Type
                    {renderSortIndicator('propertyType')}
                  </div>
                </TableHead>
                <TableHead 
                  className="px-6 py-3 cursor-pointer" 
                  onClick={() => handleSort('transactionDate')}
                >
                  <div className="flex items-center">
                    Sale Date
                    {renderSortIndicator('transactionDate')}
                  </div>
                </TableHead>
                <TableHead 
                  className="px-6 py-3 cursor-pointer" 
                  onClick={() => handleSort('price')}
                >
                  <div className="flex items-center">
                    Price
                    {renderSortIndicator('price')}
                  </div>
                </TableHead>
                <TableHead 
                  className="px-6 py-3 cursor-pointer" 
                  onClick={() => handleSort('agentId')}
                >
                  <div className="flex items-center">
                    Agent
                    {renderSortIndicator('agentId')}
                  </div>
                </TableHead>
                <TableHead 
                  className="px-6 py-3 cursor-pointer" 
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">
                    Status
                    {renderSortIndicator('status')}
                  </div>
                </TableHead>
                <TableHead className="px-6 py-3 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-red-500">
                    Error loading transactions. Please try again.
                  </TableCell>
                </TableRow>
              ) : data?.data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No transactions found.
                  </TableCell>
                </TableRow>
              ) : (
                data?.data?.map((transaction: any) => (
                  <TableRow key={transaction.id} className="hover:bg-gray-50">
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{transaction.propertyAddress}</div>
                      <div className="text-sm text-gray-500">{transaction.propertySuburb}, SA {transaction.propertyPostcode}</div>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <PropertyBadge type={transaction.propertyType} />
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(transaction.transactionDate)}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {formatCurrency(transaction.price)}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getAgentName(transaction.agentId)}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={transaction.status} />
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button 
                        variant="ghost" 
                        className="text-blue-600 hover:text-blue-700"
                        onClick={() => handleEdit(transaction)}
                      >
                        Edit
                      </Button>
                      <span className="mx-1 text-gray-300">|</span>
                      <Button 
                        variant="ghost" 
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => handleView(transaction)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        <div className="px-4 py-3 border-t border-gray-200 sm:px-6 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button 
              variant="outline" 
              className="relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md"
              onClick={handlePrevPage}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button 
              variant="outline"
              className="ml-3 relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md"
              onClick={handleNextPage}
              disabled={!data || page >= Math.ceil(data.total / pageSize)}
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(page - 1) * pageSize + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(page * pageSize, data?.total || 0)}
                </span>{" "}
                of <span className="font-medium">{data?.total || 0}</span> results
              </p>
            </div>
            <div>
              {renderPagination()}
            </div>
          </div>
        </div>
      </div>
      
      {/* Edit transaction dialog */}
      <EditTransactionDialog 
        transaction={selectedTransaction}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        agents={agents}
      />
      
      {/* View transaction dialog */}
      <ViewTransactionDialog 
        transaction={selectedTransaction}
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        agents={agents}
        onEdit={() => {
          setIsViewDialogOpen(false);
          setIsEditDialogOpen(true);
        }}
        onDelete={async () => {
          if (selectedTransaction && confirm("Are you sure you want to delete this transaction?")) {
            await deleteTransaction.mutateAsync(selectedTransaction.id);
            setIsViewDialogOpen(false);
          }
        }}
      />
    </>
  );
}
