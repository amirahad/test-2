import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Sidebar } from "@/components/layout/sidebar";
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  Edit,
  Trash2,
  Star,
  User,
  Trophy,
  Award,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AgentPerformanceChart } from "@/components/dashboard/agent-performance-chart";
import { EditAgentDialog } from "@/components/dashboard/edit-agent-dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Agent } from "@shared/schema";

// Interface for agents with extended properties used in this component
interface AgentWithStats extends Agent {
  totalSales?: number;
}

// Define top agent interface with sales count
interface TopAgent extends Agent {
  salesCount: number;
}

export default function AgentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [topAgent, setTopAgent] = useState<TopAgent | null>(null);
  const { toast } = useToast();

  // Fetch agents data
  const { data: agents = [] } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
  });

  // Fetch performance data for top performer card
  const { data: performanceData } = useQuery<{
    labels: string[];
    data: number[];
  }>({
    queryKey: ["/api/charts/agent-performance"],
  });

  // Determine top performing agent
  useEffect(() => {
    if (
      performanceData &&
      performanceData.labels.length > 0 &&
      agents.length > 0
    ) {
      // Find the index of the maximum value in the data array
      const maxIndex = performanceData.data.indexOf(
        Math.max(...performanceData.data),
      );
      const topAgentName = performanceData.labels[maxIndex];

      // Find the agent with this name
      const topAgentData = agents.find((agent) => agent.name === topAgentName);
      if (topAgentData) {
        setTopAgent({
          ...topAgentData,
          salesCount: performanceData.data[maxIndex],
        } as TopAgent);
      }
    }
  }, [performanceData, agents]);

  // Filter agents based on search term
  const filteredAgents = agents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Delete agent mutation
  const deleteMutation = useMutation({
    mutationFn: async (agentId: number) => {
      return apiRequest("DELETE", `/api/agents/${agentId}`);
    },
    onSuccess: () => {
      toast({
        title: "Agent deleted",
        description: "The agent has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/charts/agent-performance"],
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete agent: ${error}`,
        variant: "destructive",
      });
    },
  });

  const handleAddAgent = () => {
    setSelectedAgent(null);
    setDialogOpen(true);
  };

  const handleEditAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setDialogOpen(true);
  };

  const handleDeleteAgent = (agentId: number) => {
    deleteMutation.mutate(agentId);
  };

  // Generate initials from full name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <PageHeader
            title="Agents"
            subtitle="View and manage property agents"
            actions={
              <Button onClick={handleAddAgent}>
                <Plus className="mr-2 h-4 w-4" /> Add Agent
              </Button>
            }
          />

          {/* Agent Performance Chart */}
          <div className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="flex-1">
                  <CardTitle className="text-xl">
                    <BarChart3 className="h-5 w-5 mr-1 inline-block text-blue-500" />
                    Agent Performance Comparison
                  </CardTitle>
                  <CardDescription>
                    Comparing total sales by agent
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <AgentPerformanceChart />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 space-y-6">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search agents..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div>
              {/* Agents Table */}
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Profile</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAgents.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center py-8 text-muted-foreground"
                          >
                            No agents found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredAgents.map((agent) => (
                          <TableRow key={agent.id}>
                            <TableCell>
                              {agent.profilePicture ? (
                                <div className="w-10 h-10 rounded-full overflow-hidden">
                                  <img
                                    src={agent.profilePicture}
                                    alt={agent.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target =
                                        e.target as HTMLImageElement;
                                      // Fallback to initials if image fails to load
                                      target.style.display = "none";
                                      target.parentElement!.classList.add(
                                        "bg-blue-500",
                                        "flex",
                                        "items-center",
                                        "justify-center",
                                        "text-white",
                                        "text-sm",
                                        "font-semibold",
                                      );
                                      target.parentElement!.textContent =
                                        getInitials(agent.name);
                                    }}
                                  />
                                </div>
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                                  {getInitials(agent.name)}
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">
                              <div>{agent.name}</div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Mail className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                                <span>{agent.email}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Phone className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                                <span>{agent.phone}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {agent.role || "Sales Agent"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditAgent(agent)}
                                >
                                  <Edit className="h-4 w-4 mr-1" /> Edit
                                </Button>

                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-red-500 hover:text-red-600"
                                    >
                                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Are you sure?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will permanently delete{" "}
                                        {agent.name}'s profile and cannot be
                                        undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          handleDeleteAgent(agent.id)
                                        }
                                        className="bg-red-500 hover:bg-red-600"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Agent Edit Dialog */}
      <EditAgentDialog
        agent={selectedAgent}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
