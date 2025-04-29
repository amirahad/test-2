import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SuperAdminLayout } from "@/components/layout/super-admin-layout";
import { useQuery } from "@tanstack/react-query";
import { 
  Loader2, 
  Search, 
  Home, 
  Building, 
  ParkingCircle, 
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Property {
  id: number;
  propertyAddress: string;
  propertySuburb: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  price: string;
  status: string;
  agentName: string;
  agencyName: string;
  agencyId: number;
  listedDate: Date;
  transactionDate?: Date;
}

export default function SuperAdminPropertiesPage() {
  const { toast } = useToast();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [agencyFilter, setAgencyFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Fetch all properties across all agencies
  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ["/api/super-admin/properties"],
  });

  const handleViewPropertyDetails = (property: Property) => {
    setSelectedProperty(property);
    setOpenDialog(true);
  };

  // This is a temporary mock data set for testing until the API is implemented
  const mockProperties: Property[] = [
    {
      id: 1,
      propertyAddress: "123 Main Street",
      propertySuburb: "Mawson Lakes",
      propertyType: "House",
      bedrooms: 4,
      bathrooms: 2,
      price: "850000",
      status: "sold",
      agentName: "John Smith",
      agencyName: "Belle Property Mawson Lakes",
      agencyId: 1,
      listedDate: new Date("2023-01-15"),
      transactionDate: new Date("2023-03-20"),
    },
    {
      id: 2,
      propertyAddress: "45 Park Avenue",
      propertySuburb: "North Adelaide",
      propertyType: "Apartment",
      bedrooms: 2,
      bathrooms: 1,
      price: "420000",
      status: "listed",
      agentName: "Jane Doe",
      agencyName: "Ray White Adelaide",
      agencyId: 2,
      listedDate: new Date("2023-05-10"),
    },
    {
      id: 3,
      propertyAddress: "78 Beach Road",
      propertySuburb: "Glenelg",
      propertyType: "Townhouse",
      bedrooms: 3,
      bathrooms: 2,
      price: "620000",
      status: "under_offer",
      agentName: "Michael Brown",
      agencyName: "Harris Real Estate",
      agencyId: 3,
      listedDate: new Date("2023-04-28"),
    },
    {
      id: 4,
      propertyAddress: "12 Hill View",
      propertySuburb: "Blackwood",
      propertyType: "House",
      bedrooms: 5,
      bathrooms: 3,
      price: "950000",
      status: "listed",
      agentName: "Sarah Johnson",
      agencyName: "Belle Property Mawson Lakes",
      agencyId: 1,
      listedDate: new Date("2023-06-15"),
    },
    {
      id: 5,
      propertyAddress: "33 Riverside Drive",
      propertySuburb: "Port Adelaide",
      propertyType: "Apartment",
      bedrooms: 2,
      bathrooms: 2,
      price: "380000",
      status: "sold",
      agentName: "Robert Chen",
      agencyName: "Ray White Adelaide",
      agencyId: 2,
      listedDate: new Date("2023-02-10"),
      transactionDate: new Date("2023-05-25"),
    },
  ];

  // Use mock data for display if API data is not available
  const displayProperties = properties || mockProperties;

  // Get unique agencies for filter dropdown
  const agencies = Array.from(new Set(displayProperties.map(p => p.agencyName)));

  // Apply filters
  const filteredProperties = displayProperties.filter(property => {
    // Add null checks to prevent errors with toLowerCase()
    // Search filter
    const matchesSearch = 
      (property.propertyAddress?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (property.propertySuburb?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (property.agentName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (property.agencyName?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    // Agency filter
    const matchesAgency = agencyFilter === 'all' || property.agencyName === agencyFilter;
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
    
    // Type filter
    const matchesType = typeFilter === 'all' || property.propertyType === typeFilter;
    
    return matchesSearch && matchesAgency && matchesStatus && matchesType;
  });
  
  // Calculate pagination details
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProperties.slice(indexOfFirstItem, indexOfLastItem);
  
  // Handle page changes
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    if (!status) return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    
    switch (status.toLowerCase()) {
      case 'sold':
        return <Badge className="bg-green-100 text-green-800">Sold</Badge>;
      case 'under_offer':
        return <Badge className="bg-amber-100 text-amber-800">Under Offer</Badge>;
      case 'listed':
        return <Badge className="bg-blue-100 text-blue-800">Listed</Badge>;
      case 'withdrawn':
        return <Badge className="bg-red-100 text-red-800">Withdrawn</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  return (
    <SuperAdminLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">All Properties</h1>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search properties..."
                className="pl-8 bg-white border-gray-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <Select 
                value={agencyFilter} 
                onValueChange={setAgencyFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Agency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Agencies</SelectItem>
                  {agencies.map(agency => (
                    <SelectItem key={agency} value={agency}>{agency}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select 
                value={statusFilter} 
                onValueChange={setStatusFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="listed">Listed</SelectItem>
                  <SelectItem value="under_offer">Under Offer</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select 
                value={typeFilter} 
                onValueChange={setTypeFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="House">House</SelectItem>
                  <SelectItem value="Apartment">Apartment</SelectItem>
                  <SelectItem value="Townhouse">Townhouse</SelectItem>
                  <SelectItem value="Land">Land</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Card className="shadow-md">
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle>Properties Database</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[600px]">
                <table className="w-full">
                  <thead className="bg-gray-50 text-gray-700 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold">Address</th>
                      <th className="px-6 py-3 text-left font-semibold">Suburb</th>
                      <th className="px-6 py-3 text-left font-semibold">Type</th>
                      <th className="px-6 py-3 text-left font-semibold">Beds/Baths</th>
                      <th className="px-6 py-3 text-left font-semibold">Price</th>
                      <th className="px-6 py-3 text-left font-semibold">Status</th>
                      <th className="px-6 py-3 text-left font-semibold">Agency</th>
                      <th className="px-6 py-3 text-left font-semibold">Agent</th>
                      <th className="px-6 py-3 text-left font-semibold">Listed Date</th>
                      <th className="px-6 py-3 text-left font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentItems.map((property) => (
                      <tr key={property.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">{property.propertyAddress}</td>
                        <td className="px-6 py-4">{property.propertySuburb}</td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="bg-gray-100 text-gray-800 font-medium border-gray-200">
                            {property.propertyType}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <span className="flex items-center">
                              <Home className="h-4 w-4 mr-1 text-gray-500" />
                              {property.bedrooms}
                            </span>
                            <span className="flex items-center">
                              <ParkingCircle className="h-4 w-4 mr-1 text-gray-500" />
                              {property.bathrooms}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-blue-600">
                          {formatCurrency(property.price)}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(property.status)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <Building className="h-4 w-4 mr-2 text-gray-500" />
                            {property.agencyName}
                          </div>
                        </td>
                        <td className="px-6 py-4">{property.agentName}</td>
                        <td className="px-6 py-4">
                          {new Date(property.listedDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[160px]">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleViewPropertyDetails(property)}>
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                Edit Property
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                    
                    {filteredProperties.length === 0 && (
                      <tr>
                        <td colSpan={10} className="px-6 py-10 text-center text-gray-500">
                          No properties found matching your filters
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
          
          {/* Pagination */}
          {!isLoading && filteredProperties.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 bg-white border-t">
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(indexOfLastItem, filteredProperties.length)}
                </span>{" "}
                of <span className="font-medium">{filteredProperties.length}</span> results
              </div>
              <nav className="flex space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-2"
                >
                  Previous
                </Button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-2"
                >
                  Next
                </Button>
              </nav>
            </div>
          )}
        </Card>
        
        {/* Property Details Dialog */}
        {selectedProperty && (
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Property Details</DialogTitle>
                <DialogDescription>
                  View detailed information about this property.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-semibold">Address</Label>
                  <div className="col-span-3">
                    <Input value={selectedProperty.propertyAddress} readOnly />
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-semibold">Suburb</Label>
                  <div className="col-span-3">
                    <Input value={selectedProperty.propertySuburb} readOnly />
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-semibold">Property Type</Label>
                  <div className="col-span-3">
                    <Input value={selectedProperty.propertyType} readOnly />
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-semibold">Bedrooms</Label>
                  <div className="col-span-3">
                    <Input value={selectedProperty.bedrooms.toString()} readOnly />
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-semibold">Bathrooms</Label>
                  <div className="col-span-3">
                    <Input value={selectedProperty.bathrooms.toString()} readOnly />
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-semibold">Price</Label>
                  <div className="col-span-3">
                    <Input value={formatCurrency(selectedProperty.price)} readOnly />
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-semibold">Status</Label>
                  <div className="col-span-3 flex items-center">
                    {getStatusBadge(selectedProperty.status)}
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-semibold">Agency</Label>
                  <div className="col-span-3">
                    <Input value={selectedProperty.agencyName} readOnly />
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-semibold">Agent</Label>
                  <div className="col-span-3">
                    <Input value={selectedProperty.agentName} readOnly />
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-semibold">Listed Date</Label>
                  <div className="col-span-3">
                    <Input 
                      value={new Date(selectedProperty.listedDate).toLocaleDateString()} 
                      readOnly 
                    />
                  </div>
                </div>
                
                {selectedProperty.transactionDate && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right font-semibold">Transaction Date</Label>
                    <div className="col-span-3">
                      <Input 
                        value={new Date(selectedProperty.transactionDate).toLocaleDateString()} 
                        readOnly 
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button onClick={() => setOpenDialog(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </SuperAdminLayout>
  );
}