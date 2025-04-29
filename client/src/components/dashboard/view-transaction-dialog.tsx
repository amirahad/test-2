import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PropertyBadge } from "@/components/ui/property-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency, formatDate } from "@/lib/api";
import { Edit, Trash2 } from "lucide-react";

interface ViewTransactionDialogProps {
  transaction: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agents: any[];
  onEdit: () => void;
  onDelete: () => void;
}

export function ViewTransactionDialog({ 
  transaction, 
  open, 
  onOpenChange,
  agents = [],
  onEdit,
  onDelete
}: ViewTransactionDialogProps) {
  if (!transaction) return null;
  
  // Get agent name by ID
  const getAgentName = (agentId: number) => {
    const agent = agents.find((a: any) => a.id === agentId);
    return agent ? agent.name : "Unknown";
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="rounded-lg bg-gray-50 p-4 mb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">{transaction.propertyAddress}</h3>
            <p className="text-gray-600">{transaction.propertySuburb}, SA {transaction.propertyPostcode}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Property Type</p>
              <PropertyBadge type={transaction.propertyType} className="mt-1" />
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
              <StatusBadge status={transaction.status} className="mt-1" />
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Sale Date</p>
              <p className="text-base font-medium">{formatDate(transaction.saleDate)}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Price</p>
              <p className="text-base font-medium text-blue-600">{formatCurrency(transaction.price)}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Sales Agent</p>
              <p className="text-base">{getAgentName(transaction.agentId)}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Last Updated</p>
              <p className="text-base">{formatDate(transaction.updatedAt)}</p>
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button 
              variant="outline"
              className="gap-1"
              onClick={onEdit}
            >
              <Edit className="h-4 w-4" /> Edit
            </Button>
            <Button 
              variant="destructive"
              className="gap-1"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
