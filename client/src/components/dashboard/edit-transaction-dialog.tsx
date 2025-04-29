import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PropertyType, TransactionStatus, TransactionStatusValues, PropertyTypeValues } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface EditTransactionDialogProps {
  transaction: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agents: any[];
}

export function EditTransactionDialog({ 
  transaction, 
  open, 
  onOpenChange,
  agents = []
}: EditTransactionDialogProps) {
  const [formData, setFormData] = useState({
    propertyAddress: "",
    propertySuburb: "",
    propertyPostcode: "",
    propertyType: PropertyType.HOUSE,
    transactionDate: "",
    listedDate: "",
    price: "",
    agentId: "1",
    status: TransactionStatus.PENDING
  });
  
  const { toast } = useToast();
  
  // Reset form when transaction changes
  useEffect(() => {
    if (transaction) {
      // Format date for input
      const transactionDate = transaction.transactionDate 
        ? new Date(transaction.transactionDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
        
      const listedDate = transaction.listedDate 
        ? new Date(transaction.listedDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      
      setFormData({
        propertyAddress: transaction.propertyAddress || "",
        propertySuburb: transaction.propertySuburb || "",
        propertyPostcode: transaction.propertyPostcode || "",
        propertyType: transaction.propertyType || PropertyType.HOUSE,
        transactionDate: transactionDate,
        listedDate: listedDate,
        price: transaction.price?.toString() || "",
        agentId: transaction.agentId?.toString() || "1",
        status: transaction.status || TransactionStatus.PENDING
      });
    } else {
      // Clear form for new transaction
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        propertyAddress: "",
        propertySuburb: "",
        propertyPostcode: "",
        propertyType: PropertyType.HOUSE,
        transactionDate: today,
        listedDate: today,
        price: "",
        agentId: "1",
        status: TransactionStatus.PENDING
      });
    }
  }, [transaction, open]);
  
  // Create or update transaction mutation
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (transaction) {
        // Update existing transaction
        return apiRequest("PATCH", `/api/transactions/${transaction.id}`, data);
      } else {
        // Create new transaction
        return apiRequest("POST", "/api/transactions", data);
      }
    },
    onSuccess: () => {
      toast({
        title: transaction ? "Transaction updated" : "Transaction created",
        description: transaction 
          ? "The transaction has been successfully updated." 
          : "The transaction has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/charts"] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${transaction ? 'update' : 'create'} transaction: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.propertyAddress || !formData.propertySuburb || !formData.price || !formData.transactionDate || !formData.listedDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    // Format data for submission
    const submissionData = {
      ...formData,
      price: parseFloat(formData.price),
      agentId: parseInt(formData.agentId)
    };
    
    mutation.mutate(submissionData);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{transaction ? "Edit Transaction" : "Add New Transaction"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="propertyAddress">Property Address *</Label>
              <Input
                id="propertyAddress"
                name="propertyAddress"
                value={formData.propertyAddress}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="propertySuburb">Suburb *</Label>
              <Input
                id="propertySuburb"
                name="propertySuburb"
                value={formData.propertySuburb}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="propertyPostcode">Postcode *</Label>
              <Input
                id="propertyPostcode"
                name="propertyPostcode"
                value={formData.propertyPostcode}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="propertyType">Property Type *</Label>
              <Select 
                value={formData.propertyType} 
                onValueChange={(value) => handleSelectChange("propertyType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  {PropertyTypeValues.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="transactionDate">Sale Date *</Label>
              <Input
                id="transactionDate"
                name="transactionDate"
                type="date"
                value={formData.transactionDate}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="listedDate">Listed Date *</Label>
              <Input
                id="listedDate"
                name="listedDate"
                type="date"
                value={formData.listedDate}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Price (AUD) *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                min="0"
                step="1000"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="agentId">Sales Agent *</Label>
              <Select 
                value={formData.agentId} 
                onValueChange={(value) => handleSelectChange("agentId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select agent" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent: any) => (
                    <SelectItem key={agent.id} value={agent.id.toString()}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {TransactionStatusValues.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {transaction ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
