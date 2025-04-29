import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SuperAdminLayout } from "@/components/layout/super-admin-layout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, Plus, Check, X, Building2, MoreHorizontal } from "lucide-react";
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
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface Agency {
  id: number;
  name: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  rlaNumber: string | null;
  logoUrl: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Define form schema using zod for validation
const agencyFormSchema = z.object({
  name: z.string().min(2, { message: "Agency name must be at least 2 characters" }),
  contactName: z.string().min(2, { message: "Contact name must be at least 2 characters" }),
  contactEmail: z.string().email({ message: "Please enter a valid email address" }),
  contactPhone: z.string().optional(),
  rlaNumber: z.string().optional(),
  logoUrl: z.string().optional(),
  active: z.boolean().default(true)
});

type AgencyFormValues = z.infer<typeof agencyFormSchema>;

export default function SuperAdminAgenciesPage() {
  const { toast } = useToast();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [openAddAgencyDialog, setOpenAddAgencyDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Fetch all agencies
  const { data: agencies, isLoading, refetch } = useQuery<Agency[]>({
    queryKey: ["/api/super-admin/agencies"],
  });

  const handleToggleActive = async (agency: Agency) => {
    try {
      await apiRequest("PATCH", `/api/super-admin/agencies/${agency.id}/toggle-active`, {
        active: !agency.active,
      });
      
      toast({
        title: "Agency updated",
        description: `${agency.name} has been ${!agency.active ? "activated" : "deactivated"}`,
      });
      
      refetch();
    } catch (error) {
      toast({
        title: "Failed to update agency",
        description: "An error occurred while updating the agency status.",
        variant: "destructive",
      });
    }
  };

  const handleViewAgencyDetails = (agency: Agency) => {
    setSelectedAgency(agency);
    setOpenDialog(true);
  };
  
  // Form setup for adding a new agency
  const form = useForm<AgencyFormValues>({
    resolver: zodResolver(agencyFormSchema),
    defaultValues: {
      name: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      rlaNumber: "",
      logoUrl: "",
      active: true
    },
  });
  
  // Add agency mutation
  const addAgencyMutation = useMutation({
    mutationFn: async (data: AgencyFormValues) => {
      const res = await apiRequest("POST", "/api/super-admin/agencies", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Agency created successfully",
        description: "The new agency has been added to the system.",
      });
      setOpenAddAgencyDialog(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/agencies"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create agency",
        description: error.message || "An error occurred while creating the agency.",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: AgencyFormValues) => {
    addAgencyMutation.mutate(data);
  };
  
  const handleOpenAddAgencyDialog = () => {
    form.reset();
    setOpenAddAgencyDialog(true);
  };

  // This is a temporary mock data set for testing until the API is implemented
  const mockAgencies: Agency[] = [
    {
      id: 1,
      name: "Belle Property Mawson Lakes",
      contactName: "John Smith",
      contactEmail: "john@belleproperty.com",
      contactPhone: "+61 8 8123 4567",
      rlaNumber: "RLA123456",
      logoUrl: null,
      active: true,
      createdAt: new Date("2023-01-15"),
      updatedAt: new Date("2023-06-10"),
    },
    {
      id: 2,
      name: "Ray White Adelaide",
      contactName: "Jane Doe",
      contactEmail: "jane@raywhite.com",
      contactPhone: "+61 8 8765 4321",
      rlaNumber: "RLA654321",
      logoUrl: null,
      active: true,
      createdAt: new Date("2023-02-20"),
      updatedAt: new Date("2023-05-25"),
    },
    {
      id: 3,
      name: "Harris Real Estate",
      contactName: "Michael Brown",
      contactEmail: "michael@harris.com",
      contactPhone: "+61 8 8987 6543",
      rlaNumber: "RLA987654",
      logoUrl: null,
      active: false,
      createdAt: new Date("2023-03-10"),
      updatedAt: new Date("2023-07-05"),
    },
  ];

  // Use mock data for display if API data is not available
  const displayAgencies = agencies || mockAgencies;
  
  // Calculate pagination details
  const totalPages = Math.ceil(displayAgencies.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = displayAgencies.slice(indexOfFirstItem, indexOfLastItem);
  
  // Handle page changes
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <SuperAdminLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Agencies Management</h1>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleOpenAddAgencyDialog}>
            <Plus className="mr-2 h-4 w-4" /> Add New Agency
          </Button>
        </div>

        <Card className="shadow-md">
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle>All Registered Agencies</CardTitle>
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
                      <th className="px-6 py-3 text-left font-semibold">Agency Name</th>
                      <th className="px-6 py-3 text-left font-semibold">Contact Person</th>
                      <th className="px-6 py-3 text-left font-semibold">Email</th>
                      <th className="px-6 py-3 text-left font-semibold">Phone</th>
                      <th className="px-6 py-3 text-left font-semibold">RLA Number</th>
                      <th className="px-6 py-3 text-left font-semibold">Status</th>
                      <th className="px-6 py-3 text-left font-semibold">Joined Date</th>
                      <th className="px-6 py-3 text-left font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentItems.map((agency) => (
                      <tr key={agency.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium flex items-center">
                          {agency.logoUrl ? (
                            <img 
                              src={agency.logoUrl} 
                              alt={agency.name} 
                              className="w-8 h-8 mr-3 rounded-full object-cover"
                            />
                          ) : (
                            <Building2 className="w-6 h-6 mr-3 text-gray-400" />
                          )}
                          {agency.name}
                        </td>
                        <td className="px-6 py-4">{agency.contactName}</td>
                        <td className="px-6 py-4">{agency.contactEmail}</td>
                        <td className="px-6 py-4">{agency.contactPhone || "-"}</td>
                        <td className="px-6 py-4">{agency.rlaNumber || "-"}</td>
                        <td className="px-6 py-4">
                          <Badge 
                            className={agency.active ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-red-100 text-red-800 hover:bg-red-200"}
                          >
                            {agency.active ? (
                              <><Check className="h-3.5 w-3.5 mr-1" /> Active</>
                            ) : (
                              <><X className="h-3.5 w-3.5 mr-1" /> Inactive</>
                            )}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          {new Date(agency.createdAt).toLocaleDateString()}
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
                              <DropdownMenuItem onClick={() => handleViewAgencyDetails(agency)}>
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleToggleActive(agency)}
                                className={agency.active ? "text-red-600" : "text-green-600"}
                              >
                                {agency.active ? "Deactivate" : "Activate"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                    
                    {displayAgencies.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                          No agencies found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
          
          {/* Pagination */}
          {!isLoading && displayAgencies.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 bg-white border-t">
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(indexOfLastItem, displayAgencies.length)}
                </span>{" "}
                of <span className="font-medium">{displayAgencies.length}</span> results
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
        
        {/* Agency Details Dialog */}
        {selectedAgency && (
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Agency Details</DialogTitle>
                <DialogDescription>
                  View detailed information about {selectedAgency.name}.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-semibold">Agency Name</Label>
                  <div className="col-span-3">
                    <Input value={selectedAgency.name} readOnly />
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-semibold">Contact Person</Label>
                  <div className="col-span-3">
                    <Input value={selectedAgency.contactName} readOnly />
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-semibold">Contact Email</Label>
                  <div className="col-span-3">
                    <Input value={selectedAgency.contactEmail} readOnly />
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-semibold">Contact Phone</Label>
                  <div className="col-span-3">
                    <Input value={selectedAgency.contactPhone || ""} readOnly />
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-semibold">RLA Number</Label>
                  <div className="col-span-3">
                    <Input value={selectedAgency.rlaNumber || ""} readOnly />
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-semibold">Status</Label>
                  <div className="col-span-3">
                    <Badge 
                      className={selectedAgency.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                    >
                      {selectedAgency.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-semibold">Joined Date</Label>
                  <div className="col-span-3">
                    <Input 
                      value={new Date(selectedAgency.createdAt).toLocaleDateString()} 
                      readOnly 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-semibold">Last Updated</Label>
                  <div className="col-span-3">
                    <Input 
                      value={new Date(selectedAgency.updatedAt).toLocaleDateString()} 
                      readOnly 
                    />
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button onClick={() => setOpenDialog(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        
        {/* Add Agency Dialog */}
        <Dialog open={openAddAgencyDialog} onOpenChange={setOpenAddAgencyDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Agency</DialogTitle>
              <DialogDescription>
                Create a new agency in the system. Fill out the details below.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agency Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter agency name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Person *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter contact person name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter contact email" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter contact phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="rlaNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RLA Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter RLA number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="logoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo URL</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter logo URL" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Active</FormLabel>
                        <FormDescription>
                          Is this agency active and allowed to use the system?
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setOpenAddAgencyDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={addAgencyMutation.isPending}
                  >
                    {addAgencyMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Agency
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </SuperAdminLayout>
  );
}