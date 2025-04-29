import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, Upload, User, Camera, Edit2, 
  X, Trash2, Plus, Image
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Agent } from "@shared/schema";

interface EditAgentDialogProps {
  agent: Agent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditAgentDialog({ 
  agent, 
  open, 
  onOpenChange
}: EditAgentDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Sales Agent",
    profilePicture: ""
  });
  
  // File upload states
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  
  // Reset form when agent changes
  useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.name || "",
        email: agent.email || "",
        phone: agent.phone || "",
        role: agent.role || "Sales Agent",
        profilePicture: agent.profilePicture || ""
      });
    } else {
      // Clear form for new agent
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "Sales Agent",
        profilePicture: ""
      });
    }
    setUploadError("");
  }, [agent, open]);
  
  // Create or update agent mutation
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (agent) {
        // Update existing agent
        return apiRequest("PATCH", `/api/agents/${agent.id}`, data);
      } else {
        // Create new agent
        return apiRequest("POST", "/api/agents", data);
      }
    },
    onSuccess: () => {
      toast({
        title: agent ? "Agent updated" : "Agent created",
        description: agent 
          ? "The agent has been successfully updated." 
          : "The agent has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/charts/agent-performance"] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${agent ? 'update' : 'create'} agent: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleRoleChange = (value: string) => {
    setFormData({ ...formData, role: value });
  };
  
  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setUploadError("Please select a valid image file (JPEG, PNG, GIF, or WEBP)");
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File size exceeds 5MB limit");
      return;
    }
    
    try {
      setUploading(true);
      setUploadError("");
      
      const formData = new FormData();
      formData.append('profileImage', file);
      
      const response = await fetch('/api/upload/profile', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setFormData(prev => ({
          ...prev,
          profilePicture: result.filePath
        }));
        
        toast({
          title: "Upload successful",
          description: "Profile picture has been uploaded",
        });
      } else {
        throw new Error(result.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Unknown error occurred');
      
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : 'Failed to upload image',
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // Handle removing profile picture
  const handleRemovePicture = async () => {
    if (!formData.profilePicture) return;
    
    try {
      // Only call the API if the image is from our uploads
      if (formData.profilePicture.startsWith('/uploads/')) {
        await fetch('/api/upload/profile', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ filePath: formData.profilePicture }),
        });
      }
      
      // Update form data regardless of delete API result
      setFormData(prev => ({
        ...prev,
        profilePicture: ''
      }));
      
      toast({
        title: "Profile picture removed",
        description: "The profile picture has been removed",
      });
    } catch (error) {
      console.error('Error removing profile picture:', error);
      
      // Update form data even if API call fails
      setFormData(prev => ({
        ...prev,
        profilePicture: ''
      }));
    }
  };
  
  // Trigger file input click
  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.email) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    mutation.mutate(formData);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{agent ? "Edit Agent" : "Add New Agent"}</DialogTitle>
          <DialogDescription>
            Fill in the details to {agent ? "update" : "create"} an agent profile.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sales Agent">Sales Agent</SelectItem>
                    <SelectItem value="Senior Agent">Senior Agent</SelectItem>
                    <SelectItem value="Principal">Principal</SelectItem>
                    <SelectItem value="Director">Director</SelectItem>
                    <SelectItem value="Support">Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="profilePicture">Profile Picture</Label>
              <div className="flex items-center gap-3">
                <div className="flex-grow">
                  <Input
                    id="profilePicture"
                    name="profilePicture"
                    value={formData.profilePicture}
                    onChange={handleInputChange}
                    placeholder="Image URL or use upload button"
                    className="mr-2"
                  />
                </div>
                
                {/* Hidden file input for uploading profile picture */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                />
                
                <Button 
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={triggerFileUpload}
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                </Button>
                
                {formData.profilePicture && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="relative w-14 h-14 rounded-full border overflow-hidden cursor-pointer group">
                        <img 
                          src={formData.profilePicture} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            // Fallback to initials if image fails to load
                            target.style.display = 'none';
                            target.parentElement!.classList.add('bg-blue-500', 'flex', 'items-center', 'justify-center', 'text-white', 'text-sm', 'font-semibold');
                            target.parentElement!.textContent = formData.name 
                              ? formData.name.split(' ').map(n => n[0]).join('')
                              : 'U';
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Edit2 className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={triggerFileUpload}>
                        <Plus className="mr-2 h-4 w-4" />
                        <span>Add new picture</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleRemovePicture}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Remove</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => {}}>
                        <X className="mr-2 h-4 w-4" />
                        <span>Cancel</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                
                {!formData.profilePicture && (
                  <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                    <User className="w-6 h-6" />
                  </div>
                )}
              </div>
              
              {uploadError && (
                <p className="text-xs text-red-500 mt-1">{uploadError}</p>
              )}
              
              <p className="text-xs text-muted-foreground mt-1">
                Enter an image URL or upload an image (max 5MB).
              </p>
            </div>
          </div>
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {agent ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}