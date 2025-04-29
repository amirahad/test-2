import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { FilterBar, FilterState } from "@/components/dashboard/filter-bar";
import { StatCard } from "@/components/dashboard/stat-card";
import { SalesTable } from "@/components/dashboard/sales-table";
import { AgentCommissionTable } from "@/components/dashboard/agent-commission-table";
import { PropertyTransactionTable } from "@/components/dashboard/property-transaction-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Building2,
  DollarSign,
  BarChart,
  Clock,
  TrendingUp,
  Home,
  Building,
  User,
  MapPin,
  AlertTriangle,
  Bed,
  Bath,
  Calendar,
  CheckCircle,
  PauseCircle,
  XCircle,
  HelpCircle,
  Briefcase,
  Compass,
} from "lucide-react";
import { formatCurrency } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [filters, setFilters] = useState<FilterState>({
    dateRange: "30days",
    propertyType: "",
    agentId: "",
  });
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const refreshTimerRef = useRef<number | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  // Define stats type
  interface SalesStats {
    totalSold: number;
    totalRevenue: string;
    avgPrice: string;
    avgDaysOnMarket: number;
    totalPending: number;
    [key: string]: any;
  }

  // Mock data for additional analytics (these would come from API in a real implementation)
  const propertyTypeData = {
    house: { count: 45, percentage: 45, avgPrice: "850000" },
    apartment: { count: 25, percentage: 25, avgPrice: "520000" },
    townhouse: { count: 20, percentage: 20, avgPrice: "650000" },
    land: { count: 10, percentage: 10, avgPrice: "350000" },
  };

  const bedroomData = [
    { bedrooms: 1, avgPrice: "420000" },
    { bedrooms: 2, avgPrice: "560000" },
    { bedrooms: 3, avgPrice: "720000" },
    { bedrooms: 4, avgPrice: "950000" },
    { bedrooms: 5, avgPrice: "1250000" },
  ];

  const suburbData = [
    {
      name: "Mawson Lakes",
      sales: 35,
      revenue: "21000000",
      avgPrice: "850000",
      avgDays: 28,
    },
    {
      name: "Salisbury",
      sales: 22,
      revenue: "15400000",
      avgPrice: "700000",
      avgDays: 32,
    },
    {
      name: "Elizabeth",
      sales: 18,
      revenue: "9900000",
      avgPrice: "550000",
      avgDays: 38,
    },
    {
      name: "Prospect",
      sales: 15,
      revenue: "12750000",
      avgPrice: "850000",
      avgDays: 25,
    },
  ];

  const statusData = {
    listed: 42,
    underOffer: 18,
    pending: 12,
    sold: 65,
    settled: 53,
    withdrawn: 8,
    expired: 5,
  };

  const priceRangeData = [
    { range: "< $500k", count: 25 },
    { range: "$500k-$750k", count: 38 },
    { range: "$750k-$1M", count: 22 },
    { range: "$1M-$1.5M", count: 12 },
    { range: "$1.5M+", count: 5 },
  ];

  // Fetch sales stats
  const {
    data: stats = {
      totalSold: 75,
      totalPending: 30,
      totalRevenue: "42800000",
      avgPrice: "720000",
      avgDaysOnMarket: 32,
    } as SalesStats,
    isLoading,
    isError,
  } = useQuery<SalesStats>({
    queryKey: ["/api/stats"],
    refetchOnWindowFocus: true,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });

  // Fetch agent data
  const { data: agents = [] } = useQuery<any[]>({
    queryKey: ["/api/agents"],
  });

  // Set up auto-refresh every 10 minutes
  useEffect(() => {
    const refreshInterval = 10 * 60 * 1000; // 10 minutes in milliseconds

    const refresh = async () => {
      await handleRefresh();
      toast({
        title: "Dashboard Refreshed",
        description: "All data has been refreshed automatically",
      });
    };

    // Initial refresh on mount
    refresh();

    // Set up the timer
    refreshTimerRef.current = window.setInterval(refresh, refreshInterval);

    // Clean up on unmount
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, []);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleRefresh = async () => {
    // Update stats first, then invalidate queries
    try {
      await fetch("/api/stats/update", { method: "POST" });
      // Invalidate all queries to refresh data
      queryClient.invalidateQueries();
      setLastRefreshed(new Date());
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast({
        title: "Error refreshing data",
        description:
          "There was a problem updating the dashboard data. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Filter Bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <FilterBar
            onFilterChange={handleFilterChange}
            onRefresh={handleRefresh}
          />
        </div>

        <main className="flex-1 overflow-y-auto p-8">
          {/* Main Metrics Cards - Arranged in one horizontal line */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Properties Sold"
              value={isLoading ? "..." : stats?.totalSold || 0}
              change={12.5}
              icon={<Building2 className="h-5 w-5 text-white" />}
              iconColor="bg-blue-600"
            />

            <StatCard
              title="Properties Under Offer"
              value={isLoading ? "..." : stats?.totalPending || 0}
              change={4.2}
              icon={<PauseCircle className="h-5 w-5 text-white" />}
              iconColor="bg-amber-500"
            />

            <StatCard
              title="Total Revenue"
              value={
                isLoading ? "..." : formatCurrency(stats?.totalRevenue || 0)
              }
              change={8.2}
              icon={<DollarSign className="h-5 w-5 text-white" />}
              iconColor="bg-green-600"
            />

            <StatCard
              title="Average Sale Price"
              value={isLoading ? "..." : formatCurrency(stats?.avgPrice || 0)}
              change={3.7}
              icon={<TrendingUp className="h-5 w-5 text-white" />}
              iconColor="bg-indigo-600"
            />
          </div>

          {/* Analytics Tabs */}
          <div className="mb-8">
            <Tabs
              defaultValue="overview"
              className="w-full"
              onValueChange={setActiveTab}
            >
              <TabsList className="grid grid-cols-5 mb-6 shadow-sm">
                <TabsTrigger
                  value="overview"
                  className="flex items-center justify-center"
                >
                  <BarChart className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="property"
                  className="flex items-center justify-center"
                >
                  <Building className="h-4 w-4 mr-2" />
                  Property Analytics
                </TabsTrigger>
                <TabsTrigger
                  value="agent"
                  className="flex items-center justify-center"
                >
                  <User className="h-4 w-4 mr-2" />
                  Agent Performance
                </TabsTrigger>
                <TabsTrigger
                  value="location"
                  className="flex items-center justify-center"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Suburb Analysis
                </TabsTrigger>
                <TabsTrigger
                  value="trends"
                  className="flex items-center justify-center"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Pricing Trends
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {/* Days on Market */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-semibold flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-purple-500" />
                        Days on Market
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-4">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">
                              Listed to Sold
                            </span>
                            <span className="text-2xl font-bold">
                              {stats.avgDaysOnMarket} days
                            </span>
                          </div>
                          <Progress
                            value={(stats.avgDaysOnMarket / 60) * 100}
                            className="h-2"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">
                              Listed to Settled
                            </span>
                            <span className="text-2xl font-bold">
                              {stats.avgDaysOnMarket + 42} days
                            </span>
                          </div>
                          <Progress
                            value={((stats.avgDaysOnMarket + 42) / 120) * 100}
                            className="h-2"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Property Status Distribution */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-semibold flex items-center">
                        <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                        Property Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center">
                          <div className="mr-2 h-3 w-3 rounded-full bg-blue-500"></div>
                          <span className="text-sm">
                            Listed: {statusData.listed}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <div className="mr-2 h-3 w-3 rounded-full bg-amber-500"></div>
                          <span className="text-sm">
                            Under Offer: {statusData.underOffer}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <div className="mr-2 h-3 w-3 rounded-full bg-orange-500"></div>
                          <span className="text-sm">
                            Pending: {statusData.pending}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <div className="mr-2 h-3 w-3 rounded-full bg-green-500"></div>
                          <span className="text-sm">
                            Sold: {statusData.sold}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <div className="mr-2 h-3 w-3 rounded-full bg-green-700"></div>
                          <span className="text-sm">
                            Settled: {statusData.settled}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <div className="mr-2 h-3 w-3 rounded-full bg-red-500"></div>
                          <span className="text-sm">
                            Withdrawn: {statusData.withdrawn}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <div className="mr-2 h-3 w-3 rounded-full bg-gray-500"></div>
                          <span className="text-sm">
                            Expired: {statusData.expired}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Property Type Distribution */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-semibold flex items-center">
                        <Home className="h-5 w-5 mr-2 text-blue-500" />
                        Property Type
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">Houses</span>
                            <span className="text-sm font-bold">
                              {propertyTypeData.house.percentage}%
                            </span>
                          </div>
                          <Progress
                            value={propertyTypeData.house.percentage}
                            className="h-2"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">
                              Apartments
                            </span>
                            <span className="text-sm font-bold">
                              {propertyTypeData.apartment.percentage}%
                            </span>
                          </div>
                          <Progress
                            value={propertyTypeData.apartment.percentage}
                            className="h-2"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">
                              Townhouses
                            </span>
                            <span className="text-sm font-bold">
                              {propertyTypeData.townhouse.percentage}%
                            </span>
                          </div>
                          <Progress
                            value={propertyTypeData.townhouse.percentage}
                            className="h-2"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">Land</span>
                            <span className="text-sm font-bold">
                              {propertyTypeData.land.percentage}%
                            </span>
                          </div>
                          <Progress
                            value={propertyTypeData.land.percentage}
                            className="h-2"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Property Analytics Tab */}
              <TabsContent value="property" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Bedroom Trends */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold flex items-center">
                        <Bed className="h-5 w-5 mr-2 text-blue-500" />
                        Bedroom Trends
                      </CardTitle>
                      <CardDescription>
                        Average prices by bedroom count
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 font-medium text-gray-500">
                              Bedrooms
                            </th>
                            <th className="text-right py-2 font-medium text-gray-500">
                              Average Price
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {bedroomData.map((item) => (
                            <tr key={item.bedrooms} className="border-b">
                              <td className="py-3">{item.bedrooms} Bedroom</td>
                              <td className="py-3 text-right font-semibold">
                                {formatCurrency(item.avgPrice)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>

                  {/* Bathroom Trends (showing similar data for example) */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold flex items-center">
                        <Bath className="h-5 w-5 mr-2 text-green-500" />
                        Bathroom Trends
                      </CardTitle>
                      <CardDescription>
                        Average prices by bathroom count
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 font-medium text-gray-500">
                              Bathrooms
                            </th>
                            <th className="text-right py-2 font-medium text-gray-500">
                              Average Price
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="py-3">1 Bathroom</td>
                            <td className="py-3 text-right font-semibold">
                              {formatCurrency("450000")}
                            </td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-3">2 Bathrooms</td>
                            <td className="py-3 text-right font-semibold">
                              {formatCurrency("650000")}
                            </td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-3">3 Bathrooms</td>
                            <td className="py-3 text-right font-semibold">
                              {formatCurrency("820000")}
                            </td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-3">4+ Bathrooms</td>
                            <td className="py-3 text-right font-semibold">
                              {formatCurrency("1100000")}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                </div>

                {/* Property Type Breakdown */}
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center">
                      <Building className="h-5 w-5 mr-2 text-indigo-500" />
                      Property Type Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 font-medium text-gray-500">
                              Property Type
                            </th>
                            <th className="text-center py-2 font-medium text-gray-500">
                              Total Sales
                            </th>
                            <th className="text-center py-2 font-medium text-gray-500">
                              Distribution
                            </th>
                            <th className="text-right py-2 font-medium text-gray-500">
                              Average Price
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b even:bg-gray-50">
                            <td className="py-3">Houses</td>
                            <td className="py-3 text-center">
                              {propertyTypeData.house.count}
                            </td>
                            <td className="py-3 px-4">
                              <Progress
                                value={propertyTypeData.house.percentage}
                                className="h-2"
                              />
                            </td>
                            <td className="py-3 text-right font-semibold">
                              {formatCurrency(propertyTypeData.house.avgPrice)}
                            </td>
                          </tr>
                          <tr className="border-b even:bg-gray-50">
                            <td className="py-3">Apartments</td>
                            <td className="py-3 text-center">
                              {propertyTypeData.apartment.count}
                            </td>
                            <td className="py-3 px-4">
                              <Progress
                                value={propertyTypeData.apartment.percentage}
                                className="h-2"
                              />
                            </td>
                            <td className="py-3 text-right font-semibold">
                              {formatCurrency(
                                propertyTypeData.apartment.avgPrice,
                              )}
                            </td>
                          </tr>
                          <tr className="border-b even:bg-gray-50">
                            <td className="py-3">Townhouses</td>
                            <td className="py-3 text-center">
                              {propertyTypeData.townhouse.count}
                            </td>
                            <td className="py-3 px-4">
                              <Progress
                                value={propertyTypeData.townhouse.percentage}
                                className="h-2"
                              />
                            </td>
                            <td className="py-3 text-right font-semibold">
                              {formatCurrency(
                                propertyTypeData.townhouse.avgPrice,
                              )}
                            </td>
                          </tr>
                          <tr className="border-b even:bg-gray-50">
                            <td className="py-3">Land</td>
                            <td className="py-3 text-center">
                              {propertyTypeData.land.count}
                            </td>
                            <td className="py-3 px-4">
                              <Progress
                                value={propertyTypeData.land.percentage}
                                className="h-2"
                              />
                            </td>
                            <td className="py-3 text-right font-semibold">
                              {formatCurrency(propertyTypeData.land.avgPrice)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Agent Performance Tab */}
              <TabsContent value="agent" className="mt-0">
                <div className="grid grid-cols-1 gap-6 mb-8">
                  {/* Top Agents */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold flex items-center">
                        <User className="h-5 w-5 mr-2 text-blue-500" />
                        Agent Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 font-medium text-gray-500">
                                Agent
                              </th>
                              <th className="text-center py-2 font-medium text-gray-500">
                                Properties Sold
                              </th>
                              <th className="text-center py-2 font-medium text-gray-500">
                                Active Listings
                              </th>
                              <th className="text-center py-2 font-medium text-gray-500">
                                Under Offer
                              </th>
                              <th className="text-right py-2 font-medium text-gray-500">
                                Total Revenue
                              </th>
                              <th className="text-right py-2 font-medium text-gray-500">
                                Avg. Sale Price
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {agents
                              .slice(0, 5)
                              .map((agent: any, index: number) => (
                                <tr
                                  key={agent.id}
                                  className="border-b even:bg-gray-50"
                                >
                                  <td className="py-3 font-medium">
                                    {agent.name}
                                  </td>
                                  <td className="py-3 text-center">
                                    {10 - index}
                                  </td>
                                  <td className="py-3 text-center">
                                    {5 - Math.floor(index / 2)}
                                  </td>
                                  <td className="py-3 text-center">
                                    {2 - Math.floor(index / 3)}
                                  </td>
                                  <td className="py-3 text-right font-semibold">
                                    {formatCurrency(
                                      (8500000 - index * 1000000).toString(),
                                    )}
                                  </td>
                                  <td className="py-3 text-right font-semibold">
                                    {formatCurrency(
                                      (850000 - index * 50000).toString(),
                                    )}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Agent Commission Table */}
                <div className="mb-8">
                  <AgentCommissionTable />
                </div>
              </TabsContent>

              {/* Suburb Analysis Tab */}
              <TabsContent value="location" className="mt-0">
                <div className="grid grid-cols-1 gap-6 mb-8">
                  {/* Top Performing Suburbs */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold flex items-center">
                        <MapPin className="h-5 w-5 mr-2 text-blue-500" />
                        Suburb Performance
                      </CardTitle>
                      <CardDescription>
                        Analysis by suburb/postcode
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 font-medium text-gray-500">
                                Suburb
                              </th>
                              <th className="text-center py-2 font-medium text-gray-500">
                                Total Sales
                              </th>
                              <th className="text-right py-2 font-medium text-gray-500">
                                Total Revenue
                              </th>
                              <th className="text-right py-2 font-medium text-gray-500">
                                Avg. Sale Price
                              </th>
                              <th className="text-right py-2 font-medium text-gray-500">
                                Avg. Days on Market
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {suburbData.map((suburb, index) => (
                              <tr
                                key={suburb.name}
                                className={`border-b ${index === 0 ? "bg-blue-50" : "even:bg-gray-50"}`}
                              >
                                <td className="py-3 font-medium">
                                  {index === 0 && (
                                    <span className="mr-2 inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/10">
                                      Top
                                    </span>
                                  )}
                                  {suburb.name}
                                </td>
                                <td className="py-3 text-center">
                                  {suburb.sales}
                                </td>
                                <td className="py-3 text-right font-semibold">
                                  {formatCurrency(suburb.revenue)}
                                </td>
                                <td className="py-3 text-right font-semibold">
                                  {formatCurrency(suburb.avgPrice)}
                                </td>
                                <td className="py-3 text-right">
                                  {suburb.avgDays} days
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Pricing Trends Tab */}
              <TabsContent value="trends" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Price Distribution Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold flex items-center">
                        <BarChart className="h-5 w-5 mr-2 text-blue-500" />
                        Price Distribution
                      </CardTitle>
                      <CardDescription>Sales by price range</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {priceRangeData.map((item) => (
                          <div key={item.range}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">
                                {item.range}
                              </span>
                              <span className="text-sm font-bold">
                                {item.count} sales
                              </span>
                            </div>
                            <Progress
                              value={(item.count / 40) * 100}
                              className="h-3"
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Highest and Lowest Performing */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                        Price Extremes
                      </CardTitle>
                      <CardDescription>
                        Highest and lowest performing properties
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-6">
                        <h3 className="text-sm font-semibold mb-2 text-green-700">
                          Highest Selling Properties
                        </h3>
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 font-medium text-gray-500">
                                Address
                              </th>
                              <th className="text-left py-2 font-medium text-gray-500">
                                Type
                              </th>
                              <th className="text-right py-2 font-medium text-gray-500">
                                Price
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b">
                              <td className="py-2">
                                42 Premier Avenue, Mawson Lakes
                              </td>
                              <td className="py-2">House (4BR)</td>
                              <td className="py-2 text-right font-semibold text-green-600">
                                {formatCurrency("1850000")}
                              </td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2">
                                8 Lake View Dr, Mawson Lakes
                              </td>
                              <td className="py-2">House (5BR)</td>
                              <td className="py-2 text-right font-semibold text-green-600">
                                {formatCurrency("1650000")}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold mb-2 text-red-700">
                          Lowest Selling Properties
                        </h3>
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 font-medium text-gray-500">
                                Address
                              </th>
                              <th className="text-left py-2 font-medium text-gray-500">
                                Type
                              </th>
                              <th className="text-right py-2 font-medium text-gray-500">
                                Price
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b">
                              <td className="py-2">5/12 Main St, Elizabeth</td>
                              <td className="py-2">Apartment (1BR)</td>
                              <td className="py-2 text-right font-semibold text-red-600">
                                {formatCurrency("320000")}
                              </td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2">14 Small Lane, Salisbury</td>
                              <td className="py-2">Apartment (1BR)</td>
                              <td className="py-2 text-right font-semibold text-red-600">
                                {formatCurrency("345000")}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Main Transaction Table */}
          <div className="mb-6">
            <PropertyTransactionTable className="shadow-lg" />
          </div>
        </main>
      </div>
    </div>
  );
}
