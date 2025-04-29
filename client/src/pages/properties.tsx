import { PageHeader } from "@/components/ui/page-header";
import { Sidebar } from "@/components/layout/sidebar";
import {
  Building2,
  ChevronDown,
  Download,
  Filter,
  Plus,
  Search,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PropertyBadge } from "@/components/ui/property-badge";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function PropertiesPage() {
  // State for pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [propertyType, setPropertyType] = useState("all");
  const [status, setStatus] = useState("all");
  const [agentId, setAgentId] = useState("all");
  const [sortBy, setSortBy] = useState("id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // State for property detail/edit modal
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Ref for search debounce
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Items per page set to 100 as requested
  const itemsPerPage = 100;

  // Fetch agents for the agent filter
  const { data: agents = [] } = useQuery({
    queryKey: ["/api/agents"],
    queryFn: async () => {
      const response = await fetch("/api/agents");
      if (!response.ok) {
        throw new Error("Failed to fetch agents");
      }
      return response.json();
    },
  });

  // Fetch transactions to display as properties
  const {
    data: propertiesData = { data: [], total: 0 },
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      "/api/transactions",
      currentPage,
      searchTerm,
      propertyType,
      status,
      agentId,
      sortBy,
      sortDirection,
    ],
    queryFn: async () => {
      // Build query parameters for filtering and sorting
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: itemsPerPage.toString(),
        sortBy,
        sortDirection,
      });

      if (searchTerm) params.append("search", searchTerm);
      if (propertyType && propertyType !== "all")
        params.append("propertyType", propertyType);
      if (status && status !== "all") params.append("status", status);
      if (agentId && agentId !== "all") params.append("agentId", agentId);

      console.log("Fetching with params:", params.toString());

      const response = await fetch(`/api/transactions?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch properties");
      }
      return response.json();
    },
    // Disable stale time to ensure the search is always fresh
    staleTime: 0,
  });

  // Calculate total pages
  const totalPages = Math.ceil((propertiesData?.total || 0) / itemsPerPage);

  // Handle search input change with debouncing
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Reset to first page when searching
    setCurrentPage(1);

    // Clear any existing timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Set a new timeout to trigger search after a small delay (debounce)
    searchTimeout.current = setTimeout(() => {
      console.log("Searching for:", value);
      refetch();
    }, 500);
  };

  // Handle form submission for adding a new property
  const handleAddProperty = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    // Get the selected agent to include the agent name
    const selectedAgentId = parseInt(formData.get("agentId") as string, 10);
    const selectedAgent = agents.find(agent => agent.id === selectedAgentId);
    const agentName = selectedAgent ? selectedAgent.name : "";

    // Format dates properly to meet timestamp expectations
    const listedDate = formData.get("listedDate") 
      ? new Date(formData.get("listedDate") as string).toISOString() 
      : new Date().toISOString();
      
    const transactionDate = formData.get("contractDate") 
      ? new Date(formData.get("contractDate") as string).toISOString() 
      : new Date().toISOString();

    // Get values from form with appropriate type conversions to match schema expectations
    const newProperty = {
      propertyAddress: formData.get("address") as string,
      propertySuburb: formData.get("suburb") as string,
      propertyType: formData.get("propertyType") as string,
      bedrooms: parseInt(formData.get("bedrooms") as string, 10) || 0,
      bathrooms: parseInt(formData.get("bathrooms") as string, 10) || 0, // Changed to integer
      price: formData.get("price") ? formData.get("price").toString() : "0", // Ensure it's a string for numeric
      agentId: selectedAgentId,
      agentName: agentName,
      status: formData.get("status") as string,
      transactionDate: transactionDate,
      listedDate: listedDate,
      // We'll also add agencyId if the user is associated with an agency
      agencyId: 1, // Assuming first agency for now
      // Extra fields will be ignored by the server-side validation
      propertyPostcode: formData.get("postcode"),
      contractDate: formData.get("contractDate") || null,
      settlementDate: formData.get("settlementDate") || null,
      landArea: parseInt(formData.get("landArea") as string, 10) || 0,
      buildingArea:
        parseInt(formData.get("buildingArea") as string, 10) || null,
      saleType: formData.get("saleType") || "Private Treaty",
      sellerSource: formData.get("sellerSource") || "Referral",
      buyerSource: formData.get("buyerSource") || null,
      marketingSpend:
        parseFloat(formData.get("marketingSpend") as string) || null,
      description: formData.get("description") || null,
    };
    
    // Add debugging to see what we're sending
    console.log("Submitting property data:", JSON.stringify(newProperty, null, 2));

    try {
      // Form validation
      const requiredFields = [
        "address",
        "suburb",
        "postcode",
        "propertyType",
        "price",
        "agentId",
        "status",
        "listedDate",
        "bedrooms",
        "bathrooms",
        "landArea",
        "saleType",
        "sellerSource",
      ];

      const missingFields = requiredFields.filter(
        (field) => !formData.get(field === "address" ? "address" : field),
      );

      if (missingFields.length > 0) {
        alert(
          `Please fill in all required fields: ${missingFields.join(", ")}`,
        );
        return;
      }

      // Additional validation for conditional fields
      const status = formData.get("status") as string;
      if (
        (status === "under_offer" ||
          status === "sold" ||
          status === "settled") &&
        !formData.get("contractDate")
      ) {
        alert("Contract Date is required for this property status");
        return;
      }

      if (
        (status === "sold" || status === "settled") &&
        !formData.get("settlementDate")
      ) {
        alert("Settlement Date is required for this property status");
        return;
      }

      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProperty),
      });

      if (!response.ok) {
        throw new Error("Failed to add property");
      }

      // Show success message
      alert("Property added successfully!");

      // Refresh the data
      refetch();

      // Close the dialog
      const dialogTrigger = document.querySelector('[data-state="open"]');
      if (dialogTrigger) {
        (dialogTrigger as HTMLElement).click();
      }
    } catch (error) {
      console.error("Error adding property:", error);
      alert(
        `Error adding property: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  // Handle pagination
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortBy === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New field, set to ascending by default
      setSortBy(field);
      setSortDirection("asc");
    }
  };

  // View property details
  const handleViewProperty = (property: any) => {
    setSelectedProperty(property);
    setViewDialogOpen(true);
  };

  // Edit property
  const handleEditProperty = (property: any) => {
    setSelectedProperty(property);
    setEditDialogOpen(true);
  };

  // Delete property
  const handleDeleteProperty = (property: any) => {
    setSelectedProperty(property);
    setDeleteDialogOpen(true);
  };

  // Handle update property
  const handleUpdateProperty = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!selectedProperty) return;

    const formData = new FormData(event.currentTarget);

    // Get the selected agent to include the agent name
    const selectedAgentId = parseInt(formData.get("agentId") as string, 10);
    const selectedAgent = agents.find(agent => agent.id === selectedAgentId);
    const agentName = selectedAgent ? selectedAgent.name : "";

    // Format dates properly to meet timestamp expectations
    const listedDate = formData.get("listedDate")
      ? new Date(formData.get("listedDate") as string).toISOString()
      : new Date().toISOString();
      
    const transactionDate = formData.get("contractDate")
      ? new Date(formData.get("contractDate") as string).toISOString()
      : new Date().toISOString();

    // Get values from form with appropriate type conversions to match schema expectations
    const updatedProperty = {
      propertyAddress: formData.get("address") as string,
      propertySuburb: formData.get("suburb") as string,
      propertyType: formData.get("propertyType") as string,
      bedrooms: parseInt(formData.get("bedrooms") as string, 10) || 0,
      bathrooms: parseInt(formData.get("bathrooms") as string, 10) || 0, // Changed to integer
      price: formData.get("price") ? formData.get("price").toString() : "0", // Ensure it's a string for numeric
      agentId: selectedAgentId,
      agentName: agentName,
      status: formData.get("status") as string,
      transactionDate: transactionDate,
      listedDate: listedDate,
      // We'll also add agencyId if the user is associated with an agency
      agencyId: 1, // Assuming first agency for now
      // Extra fields will be ignored by the server-side validation
      propertyPostcode: formData.get("postcode"),
      contractDate: formData.get("contractDate") || null,
      settlementDate: formData.get("settlementDate") || null,
      landArea: parseInt(formData.get("landArea") as string, 10) || 0,
      buildingArea:
        parseInt(formData.get("buildingArea") as string, 10) || null,
      saleType: formData.get("saleType") || "Private Treaty",
      sellerSource: formData.get("sellerSource") || "Referral",
      buyerSource: formData.get("buyerSource") || null,
      marketingSpend:
        parseFloat(formData.get("marketingSpend") as string) || null,
      description: formData.get("description") || null,
    };
    
    // Add debugging to see what we're sending
    console.log("Submitting updated property data:", JSON.stringify(updatedProperty, null, 2));

    try {
      // Form validation
      const requiredFields = [
        "address",
        "suburb",
        "postcode",
        "propertyType",
        "price",
        "agentId",
        "status",
        "listedDate",
        "bedrooms",
        "bathrooms",
        "landArea",
        "saleType",
        "sellerSource",
      ];

      const missingFields = requiredFields.filter(
        (field) => !formData.get(field === "address" ? "address" : field),
      );

      if (missingFields.length > 0) {
        alert(
          `Please fill in all required fields: ${missingFields.join(", ")}`,
        );
        return;
      }

      // Additional validation for conditional fields
      const status = formData.get("status") as string;
      if (
        (status === "under_offer" ||
          status === "sold" ||
          status === "settled") &&
        !formData.get("contractDate")
      ) {
        alert("Contract Date is required for this property status");
        return;
      }

      if (
        (status === "sold" || status === "settled") &&
        !formData.get("settlementDate")
      ) {
        alert("Settlement Date is required for this property status");
        return;
      }

      const response = await fetch(`/api/transactions/${selectedProperty.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProperty),
      });

      if (!response.ok) {
        throw new Error("Failed to update property");
      }

      // Show success message
      alert("Property updated successfully!");

      // Refresh the data
      refetch();

      // Close the dialog
      setEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating property:", error);
      alert(
        `Error updating property: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  // Confirm delete property
  const confirmDeleteProperty = async () => {
    if (!selectedProperty) return;

    try {
      const response = await fetch(`/api/transactions/${selectedProperty.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete property");
      }

      // Show success message
      alert("Property deleted successfully!");

      // Refresh the data
      refetch();

      // Close the dialog
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting property:", error);
      alert(
        `Error deleting property: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* View Property Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Property Details
              </DialogTitle>
            </DialogHeader>

            {selectedProperty && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <h3 className="text-sm font-medium text-gray-700 mb-2 border-b pb-1">
                      Basic Information
                    </h3>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Address</Label>
                    <p className="font-medium">
                      {selectedProperty.propertyAddress}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Suburb</Label>
                    <p className="font-medium">
                      {selectedProperty.propertySuburb}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Postcode</Label>
                    <p className="font-medium">
                      {selectedProperty.propertyPostcode || "-"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">
                      Property Type
                    </Label>
                    <p className="font-medium">
                      {selectedProperty.propertyType}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Price</Label>
                    <p className="font-medium">
                      {formatCurrency(selectedProperty.price)}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Status</Label>
                    <div>
                      {selectedProperty.status === "sold" ||
                      selectedProperty.status === "settled" ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                          {selectedProperty.status === "settled"
                            ? "Settled"
                            : "Sold"}
                        </Badge>
                      ) : selectedProperty.status === "under_offer" ||
                        selectedProperty.status === "pending" ? (
                        <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">
                          {selectedProperty.status === "under_offer"
                            ? "Under Offer"
                            : "Pending"}
                        </Badge>
                      ) : selectedProperty.status === "listed" ? (
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                          Listed
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
                          {selectedProperty.status
                            .replace(/_/g, " ")
                            .charAt(0)
                            .toUpperCase() +
                            selectedProperty.status.replace(/_/g, " ").slice(1)}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="col-span-2">
                    <h3 className="text-sm font-medium text-gray-700 mb-2 border-b pb-1 mt-4">
                      Property Features
                    </h3>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Bedrooms</Label>
                    <p className="font-medium">
                      {selectedProperty.bedrooms || "-"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Bathrooms</Label>
                    <p className="font-medium">
                      {selectedProperty.bathrooms || "-"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">
                      Land Area (sqm)
                    </Label>
                    <p className="font-medium">
                      {selectedProperty.landArea || "-"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">
                      Building Area (sqm)
                    </Label>
                    <p className="font-medium">
                      {selectedProperty.buildingArea || "-"}
                    </p>
                  </div>

                  <div className="col-span-2">
                    <h3 className="text-sm font-medium text-gray-700 mb-2 border-b pb-1 mt-4">
                      Dates
                    </h3>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Listed Date</Label>
                    <p className="font-medium">
                      {selectedProperty.listedDate
                        ? new Date(
                            selectedProperty.listedDate,
                          ).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">
                      Contract Date
                    </Label>
                    <p className="font-medium">
                      {selectedProperty.contractDate
                        ? new Date(
                            selectedProperty.contractDate,
                          ).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">
                      Settlement Date
                    </Label>
                    <p className="font-medium">
                      {selectedProperty.settlementDate
                        ? new Date(
                            selectedProperty.settlementDate,
                          ).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Agent</Label>
                    <p className="font-medium">
                      {selectedProperty.agentName || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setViewDialogOpen(false)}
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      setViewDialogOpen(false);
                      handleEditProperty(selectedProperty);
                    }}
                  >
                    Edit Property
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Delete Property
              </DialogTitle>
            </DialogHeader>

            <div className="py-4">
              <p className="text-gray-700">
                Are you sure you want to delete this property?
              </p>
              <p className="font-medium mt-1">
                {selectedProperty?.propertyAddress}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {selectedProperty?.propertySuburb}
              </p>

              <div className="mt-2 p-2 bg-red-50 text-red-700 rounded-md text-sm">
                This action cannot be undone. The property will be permanently
                removed from the system.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDeleteProperty}>
                Delete Property
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Property Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Edit Property
              </DialogTitle>
            </DialogHeader>

            {selectedProperty && (
              <form onSubmit={handleUpdateProperty} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Section 1: Basic Property Information */}
                  <div className="col-span-2">
                    <h3 className="text-sm font-medium text-gray-700 mb-2 border-b pb-1">
                      Basic Information
                    </h3>
                  </div>

                  {/* Property Address */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="address"
                      className="text-sm font-medium text-gray-700"
                    >
                      Property Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      defaultValue={selectedProperty.propertyAddress}
                      required
                    />
                  </div>

                  {/* Suburb */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="suburb"
                      className="text-sm font-medium text-gray-700"
                    >
                      Suburb <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="suburb"
                      name="suburb"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      defaultValue={selectedProperty.propertySuburb}
                      required
                    />
                  </div>

                  {/* Postcode */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="postcode"
                      className="text-sm font-medium text-gray-700"
                    >
                      Postcode <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="postcode"
                      name="postcode"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      defaultValue={selectedProperty.propertyPostcode}
                      required
                    />
                  </div>

                  {/* Property Type */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="propertyType"
                      className="text-sm font-medium text-gray-700"
                    >
                      Property Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      name="propertyType"
                      defaultValue={selectedProperty.propertyType}
                    >
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="House">House</SelectItem>
                        <SelectItem value="Apartment">Apartment</SelectItem>
                        <SelectItem value="Townhouse">Townhouse</SelectItem>
                        <SelectItem value="Land">Land</SelectItem>
                        <SelectItem value="Rural">Rural</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="price"
                      className="text-sm font-medium text-gray-700"
                    >
                      Price <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="price"
                      name="price"
                      type="text"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      defaultValue={selectedProperty.price}
                      required
                    />
                  </div>

                  {/* Agent */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="agentId"
                      className="text-sm font-medium text-gray-700"
                    >
                      Agent <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      name="agentId"
                      defaultValue={selectedProperty.agentId.toString()}
                    >
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Select agent" />
                      </SelectTrigger>
                      <SelectContent>
                        {agents.map((agent: any) => (
                          <SelectItem
                            key={agent.id}
                            value={agent.id.toString()}
                          >
                            {agent.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Section 2: Status & Dates */}
                  <div className="col-span-2">
                    <h3 className="text-sm font-medium text-gray-700 mb-2 border-b pb-1 mt-4">
                      Status & Dates
                    </h3>
                  </div>

                  {/* Status */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="status"
                      className="text-sm font-medium text-gray-700"
                    >
                      Status <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      name="status"
                      defaultValue={selectedProperty.status}
                      onValueChange={(value) => {
                        // Update any conditional fields based on status
                        const contractDateField =
                          document.getElementById("contractDate");
                        const settlementDateField =
                          document.getElementById("settlementDate");

                        if (contractDateField) {
                          if (
                            value === "under_offer" ||
                            value === "sold" ||
                            value === "settled"
                          ) {
                            contractDateField.removeAttribute("disabled");
                          } else {
                            contractDateField.setAttribute("disabled", "true");
                          }
                        }

                        if (settlementDateField) {
                          if (value === "sold" || value === "settled") {
                            settlementDateField.removeAttribute("disabled");
                          } else {
                            settlementDateField.setAttribute(
                              "disabled",
                              "true",
                            );
                          }
                        }
                      }}
                    >
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="listed">Listed</SelectItem>
                        <SelectItem value="under_offer">Under Offer</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="sold">Sold</SelectItem>
                        <SelectItem value="settled">Settled</SelectItem>
                        <SelectItem value="withdrawn">Withdrawn</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="off_market">Off Market</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Listing Date */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="listedDate"
                      className="text-sm font-medium text-gray-700"
                    >
                      Listing Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="listedDate"
                      name="listedDate"
                      type="date"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      defaultValue={
                        selectedProperty.listedDate
                          ? selectedProperty.listedDate.split("T")[0]
                          : ""
                      }
                      required
                    />
                  </div>

                  {/* Contract Date */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="contractDate"
                      className="text-sm font-medium text-gray-700"
                    >
                      Contract Date
                    </Label>
                    <Input
                      id="contractDate"
                      name="contractDate"
                      type="date"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      defaultValue={
                        selectedProperty.contractDate
                          ? selectedProperty.contractDate.split("T")[0]
                          : ""
                      }
                      disabled={
                        !["under_offer", "sold", "settled"].includes(
                          selectedProperty.status,
                        )
                      }
                    />
                  </div>

                  {/* Settlement Date */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="settlementDate"
                      className="text-sm font-medium text-gray-700"
                    >
                      Settlement Date
                    </Label>
                    <Input
                      id="settlementDate"
                      name="settlementDate"
                      type="date"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      defaultValue={
                        selectedProperty.settlementDate
                          ? selectedProperty.settlementDate.split("T")[0]
                          : ""
                      }
                      disabled={
                        !["sold", "settled"].includes(selectedProperty.status)
                      }
                    />
                  </div>

                  {/* Section 3: Property Features */}
                  <div className="col-span-2">
                    <h3 className="text-sm font-medium text-gray-700 mb-2 border-b pb-1 mt-4">
                      Property Features
                    </h3>
                  </div>

                  {/* Bedrooms */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="bedrooms"
                      className="text-sm font-medium text-gray-700"
                    >
                      Bedrooms <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="bedrooms"
                      name="bedrooms"
                      type="number"
                      min="0"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      defaultValue={selectedProperty.bedrooms || 0}
                      required
                    />
                  </div>

                  {/* Bathrooms */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="bathrooms"
                      className="text-sm font-medium text-gray-700"
                    >
                      Bathrooms <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="bathrooms"
                      name="bathrooms"
                      type="number"
                      min="0"
                      step="0.5"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      defaultValue={selectedProperty.bathrooms || 0}
                      required
                    />
                  </div>

                  {/* Land Area */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="landArea"
                      className="text-sm font-medium text-gray-700"
                    >
                      Land Area (sqm) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="landArea"
                      name="landArea"
                      type="number"
                      min="0"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      defaultValue={selectedProperty.landArea || 0}
                      required
                    />
                  </div>

                  {/* Building Area */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="buildingArea"
                      className="text-sm font-medium text-gray-700"
                    >
                      Building Area (sqm)
                    </Label>
                    <Input
                      id="buildingArea"
                      name="buildingArea"
                      type="number"
                      min="0"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      defaultValue={selectedProperty.buildingArea || ""}
                    />
                  </div>

                  {/* Section 4: Marketing and Sales Info */}
                  <div className="col-span-2">
                    <h3 className="text-sm font-medium text-gray-700 mb-2 border-b pb-1 mt-4">
                      Marketing & Sales
                    </h3>
                  </div>

                  {/* Sale Type */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="saleType"
                      className="text-sm font-medium text-gray-700"
                    >
                      Sale Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      name="saleType"
                      defaultValue={
                        selectedProperty.saleType || "Private Treaty"
                      }
                    >
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Select sale type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Private Treaty">
                          Private Treaty
                        </SelectItem>
                        <SelectItem value="Auction">Auction</SelectItem>
                        <SelectItem value="Off Market">Off Market</SelectItem>
                        <SelectItem value="EOI">
                          Expression of Interest
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Seller Source */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="sellerSource"
                      className="text-sm font-medium text-gray-700"
                    >
                      Seller Source <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      name="sellerSource"
                      defaultValue={selectedProperty.sellerSource || "Referral"}
                    >
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Select seller source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Referral">Referral</SelectItem>
                        <SelectItem value="Cold Call">Cold Call</SelectItem>
                        <SelectItem value="Online Inquiry">
                          Online Inquiry
                        </SelectItem>
                        <SelectItem value="Previous Client">
                          Previous Client
                        </SelectItem>
                        <SelectItem value="Signboard">Signboard</SelectItem>
                        <SelectItem value="Walk In">Walk In</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Update Property</Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <PageHeader
            title="Properties"
            subtitle="Manage and view all properties"
            actions={
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Property
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader className="mb-4">
                    <DialogTitle className="text-xl font-semibold text-gray-900">
                      Add New Property
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddProperty} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Section 1: Basic Property Information */}
                      <div className="col-span-2">
                        <h3 className="text-sm font-medium text-gray-700 mb-2 border-b pb-1">
                          Basic Information
                        </h3>
                      </div>

                      {/* Property Address */}
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="address"
                          className="text-sm font-medium text-gray-700"
                        >
                          Property Address{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="address"
                          name="address"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>

                      {/* Suburb */}
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="suburb"
                          className="text-sm font-medium text-gray-700"
                        >
                          Suburb <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="suburb"
                          name="suburb"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>

                      {/* Postcode */}
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="postcode"
                          className="text-sm font-medium text-gray-700"
                        >
                          Postcode <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="postcode"
                          name="postcode"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>

                      {/* Property Type */}
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="propertyType"
                          className="text-sm font-medium text-gray-700"
                        >
                          Property Type <span className="text-red-500">*</span>
                        </Label>
                        <Select name="propertyType" defaultValue="House">
                          <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Select property type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="House">House</SelectItem>
                            <SelectItem value="Apartment">Apartment</SelectItem>
                            <SelectItem value="Townhouse">Townhouse</SelectItem>
                            <SelectItem value="Land">Land</SelectItem>
                            <SelectItem value="Rural">Rural</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Price */}
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="price"
                          className="text-sm font-medium text-gray-700"
                        >
                          Price <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="price"
                          name="price"
                          type="text"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>

                      {/* Agent */}
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="agentId"
                          className="text-sm font-medium text-gray-700"
                        >
                          Agent <span className="text-red-500">*</span>
                        </Label>
                        <Select name="agentId">
                          <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Select agent" />
                          </SelectTrigger>
                          <SelectContent>
                            {agents.map((agent: any) => (
                              <SelectItem
                                key={agent.id}
                                value={agent.id.toString()}
                              >
                                {agent.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Section 2: Status & Dates */}
                      <div className="col-span-2">
                        <h3 className="text-sm font-medium text-gray-700 mb-2 border-b pb-1 mt-4">
                          Status & Dates
                        </h3>
                      </div>

                      {/* Status */}
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="status"
                          className="text-sm font-medium text-gray-700"
                        >
                          Status <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          name="status"
                          defaultValue="listed"
                          onValueChange={(value) => {
                            // Update any conditional fields based on status
                            const contractDateField =
                              document.getElementById("contractDate");
                            const settlementDateField =
                              document.getElementById("settlementDate");

                            if (contractDateField) {
                              if (
                                value === "under_offer" ||
                                value === "sold" ||
                                value === "settled"
                              ) {
                                contractDateField.removeAttribute("disabled");
                              } else {
                                contractDateField.setAttribute(
                                  "disabled",
                                  "true",
                                );
                              }
                            }

                            if (settlementDateField) {
                              if (value === "sold" || value === "settled") {
                                settlementDateField.removeAttribute("disabled");
                              } else {
                                settlementDateField.setAttribute(
                                  "disabled",
                                  "true",
                                );
                              }
                            }
                          }}
                        >
                          <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="listed">Listed</SelectItem>
                            <SelectItem value="under_offer">
                              Under Offer
                            </SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="sold">Sold</SelectItem>
                            <SelectItem value="settled">Settled</SelectItem>
                            <SelectItem value="withdrawn">Withdrawn</SelectItem>
                            <SelectItem value="expired">Expired</SelectItem>
                            <SelectItem value="off_market">
                              Off Market
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Listing Date */}
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="listedDate"
                          className="text-sm font-medium text-gray-700"
                        >
                          Listing Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="listedDate"
                          name="listedDate"
                          type="date"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          defaultValue={new Date().toISOString().split("T")[0]}
                          required
                        />
                      </div>

                      {/* Contract Date */}
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="contractDate"
                          className="text-sm font-medium text-gray-700"
                        >
                          Contract Date
                        </Label>
                        <Input
                          id="contractDate"
                          name="contractDate"
                          type="date"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          disabled
                        />
                      </div>

                      {/* Settlement Date */}
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="settlementDate"
                          className="text-sm font-medium text-gray-700"
                        >
                          Settlement Date
                        </Label>
                        <Input
                          id="settlementDate"
                          name="settlementDate"
                          type="date"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          disabled
                        />
                      </div>

                      {/* Section 3: Property Features */}
                      <div className="col-span-2">
                        <h3 className="text-sm font-medium text-gray-700 mb-2 border-b pb-1 mt-4">
                          Property Features
                        </h3>
                      </div>

                      {/* Bedrooms */}
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="bedrooms"
                          className="text-sm font-medium text-gray-700"
                        >
                          Bedrooms <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="bedrooms"
                          name="bedrooms"
                          type="number"
                          min="0"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>

                      {/* Bathrooms */}
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="bathrooms"
                          className="text-sm font-medium text-gray-700"
                        >
                          Bathrooms <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="bathrooms"
                          name="bathrooms"
                          type="number"
                          min="0"
                          step="0.5"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>

                      {/* Land Area */}
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="landArea"
                          className="text-sm font-medium text-gray-700"
                        >
                          Land Area (sqm){" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="landArea"
                          name="landArea"
                          type="number"
                          min="0"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>

                      {/* Building Area */}
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="buildingArea"
                          className="text-sm font-medium text-gray-700"
                        >
                          Building Area (sqm)
                        </Label>
                        <Input
                          id="buildingArea"
                          name="buildingArea"
                          type="number"
                          min="0"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      {/* Section 4: Sales Information */}
                      <div className="col-span-2">
                        <h3 className="text-sm font-medium text-gray-700 mb-2 border-b pb-1 mt-4">
                          Sales Information
                        </h3>
                      </div>

                      {/* Sale Type */}
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="saleType"
                          className="text-sm font-medium text-gray-700"
                        >
                          Sale Type <span className="text-red-500">*</span>
                        </Label>
                        <Select name="saleType" defaultValue="Private Treaty">
                          <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Select sale type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Auction">Auction</SelectItem>
                            <SelectItem value="Private Treaty">
                              Private Treaty
                            </SelectItem>
                            <SelectItem value="Expression of Interest">
                              Expression of Interest
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Seller Source */}
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="sellerSource"
                          className="text-sm font-medium text-gray-700"
                        >
                          Seller Source <span className="text-red-500">*</span>
                        </Label>
                        <Select name="sellerSource" defaultValue="Referral">
                          <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Select seller source" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Referral">Referral</SelectItem>
                            <SelectItem value="Walk-in">Walk-in</SelectItem>
                            <SelectItem value="Online">Online</SelectItem>
                            <SelectItem value="Repeat Client">
                              Repeat Client
                            </SelectItem>
                            <SelectItem value="Prospecting">
                              Prospecting
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Buyer Source */}
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="buyerSource"
                          className="text-sm font-medium text-gray-700"
                        >
                          Buyer Source
                        </Label>
                        <Select name="buyerSource">
                          <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Select buyer source" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Referral">Referral</SelectItem>
                            <SelectItem value="Walk-in">Walk-in</SelectItem>
                            <SelectItem value="Online">Online</SelectItem>
                            <SelectItem value="Repeat Client">
                              Repeat Client
                            </SelectItem>
                            <SelectItem value="Prospecting">
                              Prospecting
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Marketing Spend */}
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="marketingSpend"
                          className="text-sm font-medium text-gray-700"
                        >
                          Marketing Spend ($)
                        </Label>
                        <Input
                          id="marketingSpend"
                          name="marketingSpend"
                          type="number"
                          min="0"
                          step="0.01"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      {/* Property Description/Notes */}
                      <div className="col-span-2 space-y-1.5">
                        <Label
                          htmlFor="description"
                          className="text-sm font-medium text-gray-700"
                        >
                          Property Description/Notes
                        </Label>
                        <textarea
                          id="description"
                          name="description"
                          rows={3}
                          className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        ></textarea>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <p className="text-xs text-gray-500">
                        Fields marked with{" "}
                        <span className="text-red-500">*</span> are required
                      </p>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const dialogTrigger = document.querySelector(
                              '[data-state="open"]',
                            );
                            if (dialogTrigger) {
                              (dialogTrigger as HTMLElement).click();
                            }
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Add Property
                        </Button>
                      </div>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            }
          />

          <div className="mt-6 space-y-6">
            {/* Filters and Search */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="relative flex-1 min-w-[280px]">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search properties by address, suburb, postcode or agent..."
                  className="pl-10 py-6 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className={`border-gray-300 hover:bg-gray-50 hover:shadow-md transition-all rounded-md ${propertyType !== "all" || status !== "all" || agentId !== "all" ? "bg-blue-50 border-blue-300 text-blue-700" : ""}`}
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                    {(propertyType !== "all" ||
                      status !== "all" ||
                      agentId !== "all") && (
                      <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {[
                          propertyType !== "all" ? 1 : 0,
                          status !== "all" ? 1 : 0,
                          agentId !== "all" ? 1 : 0,
                        ].reduce((a, b) => a + b, 0)}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 p-2 rounded-lg shadow-lg border-gray-200"
                >
                  <div className="p-2">
                    <Label className="text-xs font-medium text-gray-700 mb-1.5 block">
                      Property Type
                    </Label>
                    <Select
                      value={propertyType}
                      onValueChange={setPropertyType}
                    >
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Any Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Type</SelectItem>
                        <SelectItem value="House">House</SelectItem>
                        <SelectItem value="Apartment">Apartment</SelectItem>
                        <SelectItem value="Townhouse">Townhouse</SelectItem>
                        <SelectItem value="Land">Land</SelectItem>
                        <SelectItem value="Rural">Rural</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="p-2">
                    <Label className="text-xs font-medium text-gray-700 mb-1.5 block">
                      Status
                    </Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Any Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Status</SelectItem>
                        <SelectItem value="listed">Listed</SelectItem>
                        <SelectItem value="under_offer">Under Offer</SelectItem>
                        <SelectItem value="sold">Sold</SelectItem>
                        <SelectItem value="settled">Settled</SelectItem>
                        <SelectItem value="withdrawn">Withdrawn</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="off_market">Off Market</SelectItem>
                        <SelectItem value="auctioned">Auctioned</SelectItem>
                        <SelectItem value="passed_in">Passed In</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="p-2">
                    <Label className="text-xs font-medium text-gray-700 mb-1.5 block">
                      Agent
                    </Label>
                    <Select value={agentId} onValueChange={setAgentId}>
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Any Agent" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Agent</SelectItem>
                        {agents.map((agent: any) => (
                          <SelectItem
                            key={agent.id}
                            value={agent.id.toString()}
                          >
                            {agent.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="p-2 pt-3 border-t flex justify-end mt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setPropertyType("all");
                        setStatus("all");
                        setAgentId("all");
                      }}
                      className="text-xs h-8"
                    >
                      Reset Filters
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-gray-300 hover:bg-gray-50 hover:shadow-md transition-all rounded-md"
                  >
                    {sortDirection === "asc" ? (
                      <SortAsc className="mr-2 h-4 w-4" />
                    ) : (
                      <SortDesc className="mr-2 h-4 w-4" />
                    )}
                    Sort By
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="rounded-lg shadow-lg border-gray-200"
                >
                  <DropdownMenuItem
                    onClick={() => handleSort("propertyAddress")}
                    className={
                      sortBy === "propertyAddress"
                        ? "bg-blue-50 text-blue-700"
                        : ""
                    }
                  >
                    Address{" "}
                    {sortBy === "propertyAddress" &&
                      (sortDirection === "asc" ? "↑" : "↓")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleSort("propertySuburb")}
                    className={
                      sortBy === "propertySuburb"
                        ? "bg-blue-50 text-blue-700"
                        : ""
                    }
                  >
                    Suburb{" "}
                    {sortBy === "propertySuburb" &&
                      (sortDirection === "asc" ? "↑" : "↓")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleSort("price")}
                    className={
                      sortBy === "price" ? "bg-blue-50 text-blue-700" : ""
                    }
                  >
                    Price{" "}
                    {sortBy === "price" &&
                      (sortDirection === "asc" ? "↑" : "↓")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleSort("listedDate")}
                    className={
                      sortBy === "listedDate" ? "bg-blue-50 text-blue-700" : ""
                    }
                  >
                    Listed Date{" "}
                    {sortBy === "listedDate" &&
                      (sortDirection === "asc" ? "↑" : "↓")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleSort("status")}
                    className={
                      sortBy === "status" ? "bg-blue-50 text-blue-700" : ""
                    }
                  >
                    Status{" "}
                    {sortBy === "status" &&
                      (sortDirection === "asc" ? "↑" : "↓")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="outline"
                className="border-gray-300 hover:bg-gray-50 hover:shadow-md transition-all rounded-md"
                onClick={() => {
                  // We would implement download CSV functionality here
                  alert("Export functionality would be implemented here");
                }}
              >
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
            </div>

            {/* Properties Table */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className="px-4 py-3 text-left font-medium text-gray-700 border-b"
                      onClick={() => handleSort("propertyAddress")}
                    >
                      <div className="flex items-center cursor-pointer group">
                        Address
                        {sortBy === "propertyAddress" ? (
                          sortDirection === "asc" ? (
                            <SortAsc className="ml-1 h-4 w-4 text-blue-600" />
                          ) : (
                            <SortDesc className="ml-1 h-4 w-4 text-blue-600" />
                          )
                        ) : (
                          <SortAsc className="ml-1 h-4 w-4 opacity-0 group-hover:opacity-30" />
                        )}
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left font-medium text-gray-700 border-b"
                      onClick={() => handleSort("propertySuburb")}
                    >
                      <div className="flex items-center cursor-pointer group">
                        Suburb
                        {sortBy === "propertySuburb" ? (
                          sortDirection === "asc" ? (
                            <SortAsc className="ml-1 h-4 w-4 text-blue-600" />
                          ) : (
                            <SortDesc className="ml-1 h-4 w-4 text-blue-600" />
                          )
                        ) : (
                          <SortAsc className="ml-1 h-4 w-4 opacity-0 group-hover:opacity-30" />
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700 border-b">
                      Type
                    </th>
                    <th
                      className="px-4 py-3 text-left font-medium text-gray-700 border-b"
                      onClick={() => handleSort("price")}
                    >
                      <div className="flex items-center cursor-pointer group">
                        Price
                        {sortBy === "price" ? (
                          sortDirection === "asc" ? (
                            <SortAsc className="ml-1 h-4 w-4 text-blue-600" />
                          ) : (
                            <SortDesc className="ml-1 h-4 w-4 text-blue-600" />
                          )
                        ) : (
                          <SortAsc className="ml-1 h-4 w-4 opacity-0 group-hover:opacity-30" />
                        )}
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left font-medium text-gray-700 border-b"
                      onClick={() => handleSort("status")}
                    >
                      <div className="flex items-center cursor-pointer group">
                        Status
                        {sortBy === "status" ? (
                          sortDirection === "asc" ? (
                            <SortAsc className="ml-1 h-4 w-4 text-blue-600" />
                          ) : (
                            <SortDesc className="ml-1 h-4 w-4 text-blue-600" />
                          )
                        ) : (
                          <SortAsc className="ml-1 h-4 w-4 opacity-0 group-hover:opacity-30" />
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700 border-b">
                      Beds
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700 border-b">
                      Baths
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700 border-b">
                      Agent
                    </th>
                    <th
                      className="px-4 py-3 text-left font-medium text-gray-700 border-b"
                      onClick={() => handleSort("listedDate")}
                    >
                      <div className="flex items-center cursor-pointer group">
                        Listed Date
                        {sortBy === "listedDate" ? (
                          sortDirection === "asc" ? (
                            <SortAsc className="ml-1 h-4 w-4 text-blue-600" />
                          ) : (
                            <SortDesc className="ml-1 h-4 w-4 text-blue-600" />
                          )
                        ) : (
                          <SortAsc className="ml-1 h-4 w-4 opacity-0 group-hover:opacity-30" />
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-700 border-b">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="py-12 text-center text-gray-500"
                      >
                        <div className="flex flex-col items-center justify-center">
                          <Building2 className="h-8 w-8 mb-2 text-gray-400 animate-pulse" />
                          <span>Loading properties...</span>
                        </div>
                      </td>
                    </tr>
                  ) : propertiesData.data.length === 0 ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="py-12 text-center text-gray-500"
                      >
                        <div className="flex flex-col items-center justify-center">
                          <Building2 className="h-8 w-8 mb-2 text-gray-400" />
                          <span>
                            No properties found. Try adjusting your filters.
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    propertiesData.data.map((property: any) => (
                      <tr
                        key={property.id}
                        className="border-b hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium">
                          {property.propertyAddress}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {property.propertySuburb}
                        </td>
                        <td className="px-4 py-3">
                          {property.propertyType === "House" && (
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-md">
                              House
                            </span>
                          )}
                          {property.propertyType === "Apartment" && (
                            <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-md">
                              Apartment
                            </span>
                          )}
                          {property.propertyType === "Townhouse" && (
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-md">
                              Townhouse
                            </span>
                          )}
                          {property.propertyType === "Land" && (
                            <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-md">
                              Land
                            </span>
                          )}
                          {property.propertyType === "Rural" && (
                            <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-md">
                              Rural
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {formatCurrency(property.price)}
                        </td>
                        <td className="px-4 py-3">
                          {(property.status === "sold" ||
                            property.status === "settled") && (
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-md">
                              {property.status === "settled"
                                ? "Settled"
                                : "Sold"}
                            </span>
                          )}
                          {(property.status === "under_offer" ||
                            property.status === "pending") && (
                            <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-md">
                              {property.status === "under_offer"
                                ? "Under Offer"
                                : "Pending"}
                            </span>
                          )}
                          {property.status === "listed" && (
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-md">
                              Listed
                            </span>
                          )}
                          {(property.status === "withdrawn" ||
                            property.status === "expired" ||
                            property.status === "off_market") && (
                            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-md">
                              {property.status === "withdrawn"
                                ? "Withdrawn"
                                : property.status === "expired"
                                  ? "Expired"
                                  : "Off Market"}
                            </span>
                          )}
                          {(property.status === "auctioned" ||
                            property.status === "passed_in") && (
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-md">
                              {property.status === "auctioned"
                                ? "Auctioned"
                                : "Passed In"}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {property.bedrooms || "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {property.bathrooms || "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {property.agentName}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {new Date(property.listedDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="rounded-md shadow-md"
                            >
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => handleViewProperty(property)}
                              >
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => handleEditProperty(property)}
                              >
                                Edit Property
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer text-red-600"
                                onClick={() => handleDeleteProperty(property)}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                {propertiesData.total > 0
                  ? `Showing ${Math.min((currentPage - 1) * itemsPerPage + 1, propertiesData.total)} to ${Math.min(currentPage * itemsPerPage, propertiesData.total)} of ${propertiesData.total} properties`
                  : "No properties found"}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="border-gray-300 text-gray-700 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50 disabled:bg-gray-100 px-4"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={nextPage}
                  disabled={currentPage >= totalPages}
                  className="border-gray-300 text-gray-700 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50 disabled:bg-gray-100 px-4"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
