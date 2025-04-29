import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, useRef } from "react";
import { formatCurrency } from "@/lib/api";
import { 
  Building2, DollarSign, BarChart, Clock, Home, Star, Award, RefreshCw, 
  MapPin, Check, TrendingUp, Medal, Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function TVView() {
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [currentIndex, setCurrentIndex] = useState(0);
  const refreshTimerRef = useRef<number | null>(null);
  const rotationTimerRef = useRef<number | null>(null);
  const { toast } = useToast();
  
  // Define interface for settings
  interface Setting {
    key: string;
    value: string;
    category: string;
  }
  
  // Fetch branding settings
  const { data: brandingSettings = [] } = useQuery<Setting[]>({
    queryKey: ['/api/settings/category/branding'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Fetch TV view settings
  const { data: tvViewSettings = [] } = useQuery<Setting[]>({
    queryKey: ['/api/settings/category/tv_view'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Extract settings
  const companyName = brandingSettings.find((setting: Setting) => setting.key === 'company_name')?.value || 'Estate Dashboard';
  const logoUrl = brandingSettings.find((setting: Setting) => setting.key === 'logo_url')?.value || '';
  const themeColor = tvViewSettings.find((setting: Setting) => setting.key === 'theme_color')?.value || 'blue-600';
  const backgroundStyle = tvViewSettings.find((setting: Setting) => setting.key === 'background_style')?.value || 'gradient';
  
  // Define types for better type safety
  interface SalesStats {
    totalSold: number;
    totalRevenue: string;
    avgPrice: string;
    avgDaysOnMarket: number;
    [key: string]: any;
  }
  
  interface TransactionResponse {
    data: {
      id: number;
      propertyAddress: string;
      propertySuburb: string;
      propertyType: string;
      price: string;
      status: string;
      agentId: number;
      agentName: string;
      [key: string]: any;
    }[];
    total: number;
    page: number;
    pageSize: number;
  }
  
  // Fetch sales stats
  const { data: stats = { 
    totalSold: 0,
    totalRevenue: "0",
    avgPrice: "0",
    avgDaysOnMarket: 0
  } as SalesStats, isLoading, isError } = useQuery<SalesStats>({
    queryKey: ["/api/stats"],
    refetchOnWindowFocus: true,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });
  
  // Fetch latest transactions
  const { data: transactions = { data: [], total: 0, page: 1, pageSize: 10 } as TransactionResponse } = useQuery<TransactionResponse>({
    queryKey: ["/api/transactions", { pageSize: 10 }],
    refetchOnWindowFocus: true,
    staleTime: 5 * 60 * 1000,
  });
  
  // Mock data for client satisfaction - would be replaced with real data
  const clientSatisfaction = {
    rating: 4.9,
    reviewCount: 120
  };
  
  // Get the top 5 notable sales from transactions (sorted by price)
  const notableSales = [...(transactions?.data || [])].sort((a, b) => {
    const priceA = typeof a.price === 'string' ? parseFloat(a.price.replace(/[^0-9.-]+/g, '')) : Number(a.price);
    const priceB = typeof b.price === 'string' ? parseFloat(b.price.replace(/[^0-9.-]+/g, '')) : Number(b.price);
    return priceB - priceA;
  }).slice(0, 5);
  
  // Get top suburbs from transactions
  const topSuburbs = [...(transactions?.data || [])]
    .reduce((acc: {suburb: string, count: number}[], transaction) => {
      const suburb = transaction.propertySuburb;
      const existingSuburb = acc.find(s => s.suburb === suburb);
      
      if (existingSuburb) {
        existingSuburb.count += 1;
      } else {
        acc.push({ suburb, count: 1 });
      }
      
      return acc;
    }, [])
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  // Function to refresh data
  const handleRefresh = async () => {
    try {
      await fetch('/api/stats/update', { method: 'POST' });
      queryClient.invalidateQueries();
      setLastRefreshed(new Date());
      
      // Silent toast for TV view - less intrusive
      toast({
        title: "Dashboard Updated",
        description: "Data has been refreshed",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };
  
  // Set up auto-refresh every 10 minutes
  useEffect(() => {
    const refreshInterval = 10 * 60 * 1000; // 10 minutes in milliseconds
    
    const refresh = async () => {
      await handleRefresh();
    };
    
    // Initial refresh on mount
    refresh();
    
    // Set up the timer
    refreshTimerRef.current = window.setInterval(refresh, refreshInterval);
    
    // Force light mode for TV view
    document.documentElement.classList.remove('dark');
    document.body.style.backgroundColor = '#f9fafb'; // bg-gray-50
    
    // Clean up on unmount
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
      
      document.body.style.backgroundColor = '';
    };
  }, []);
  
  // Set up rotation of notable sales every 10 seconds
  useEffect(() => {
    if (notableSales.length > 1) {
      rotationTimerRef.current = window.setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % notableSales.length);
      }, 10000);
    }
    
    return () => {
      if (rotationTimerRef.current) {
        clearInterval(rotationTimerRef.current);
      }
    };
  }, [notableSales.length]);
  
  // Get background style class based on setting - light theme
  const getBackgroundStyleClass = () => {
    switch (backgroundStyle) {
      case 'solid':
        return 'bg-white';
      case 'gradient':
        return 'bg-gradient-to-br from-white via-gray-50 to-gray-100';
      case 'custom':
        return 'bg-white'; // Default to solid if custom isn't implemented yet
      default:
        return 'bg-white';
    }
  };
  
  // Format time as "just now" or "X min ago"
  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "just now";
    if (diffInMinutes === 1) return "1 min ago";
    if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
    
    return `${Math.floor(diffInMinutes / 60)} hrs ago`;
  };
  
  return (
    <div className={`h-screen w-screen ${getBackgroundStyleClass()} text-gray-900 overflow-hidden flex flex-col`}>
      {/* Main Content */}
      <div className="flex-1 p-8 grid grid-cols-2 gap-8">
        {/* Main Stats Grid - 2x2 Layout */}
        <div className="grid grid-cols-2 gap-8 col-span-2">
          {/* Card 1: Properties Sold */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-blue-100 to-blue-300 rounded-2xl shadow-lg overflow-hidden flex flex-col"
          >
            <div className="p-8 flex-1 flex flex-col justify-center items-center text-center">
              <Building2 className="h-20 w-20 mb-6 text-blue-600" />
              <h2 className="text-2xl font-semibold text-blue-800 mb-4">Properties Sold</h2>
              <div className="flex flex-col">
                <p className="text-5xl font-bold text-blue-900 mb-2">{stats.totalSold || 0}</p>
                <p className="text-blue-700 text-xl">This Month</p>
                <p className="text-3xl font-bold text-blue-900 mt-6">{stats.totalSold * 2 || 0}</p>
                <p className="text-blue-700 text-xl">Year-to-Date</p>
              </div>
            </div>
          </motion.div>
          
          {/* Card 2: Total Revenue */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gradient-to-br from-green-100 to-green-300 rounded-2xl shadow-lg overflow-hidden flex flex-col"
          >
            <div className="p-8 flex-1 flex flex-col justify-center items-center text-center">
              <DollarSign className="h-20 w-20 mb-6 text-green-600" />
              <h2 className="text-2xl font-semibold text-green-800 mb-4">Total Revenue</h2>
              <div className="flex flex-col">
                <p className="text-5xl font-bold text-green-900 mb-2">{formatCurrency(stats.totalRevenue || 0)}</p>
                <p className="text-green-700 text-xl">This Month</p>
              </div>
            </div>
          </motion.div>
          
          {/* Card 3: Average Selling Price */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gradient-to-br from-amber-100 to-amber-300 rounded-2xl shadow-lg overflow-hidden flex flex-col"
          >
            <div className="p-8 flex-1 flex flex-col justify-center items-center text-center">
              <BarChart className="h-20 w-20 mb-6 text-amber-600" />
              <h2 className="text-2xl font-semibold text-amber-800 mb-4">Average Selling Price</h2>
              <div className="flex flex-col">
                <p className="text-5xl font-bold text-amber-900 mb-2">{formatCurrency(stats.avgPrice || 0)}</p>
                <p className="text-amber-700 text-xl">Recent Settlements</p>
              </div>
            </div>
          </motion.div>
          
          {/* Card 4: Days on Market */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gradient-to-br from-purple-100 to-purple-300 rounded-2xl shadow-lg overflow-hidden flex flex-col"
          >
            <div className="p-8 flex-1 flex flex-col justify-center items-center text-center">
              <Clock className="h-20 w-20 mb-6 text-purple-600" />
              <h2 className="text-2xl font-semibold text-purple-800 mb-4">Days on Market</h2>
              <div className="flex flex-col">
                <p className="text-5xl font-bold text-purple-900 mb-2">{stats.avgDaysOnMarket || 0}</p>
                <p className="text-purple-700 text-xl">Average</p>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Additional Content - Bottom Row */}
        <div className="grid grid-cols-2 gap-8 col-span-2">
          {/* Notable Sales with Rotation */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-gradient-to-br from-indigo-100 to-indigo-300 rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-indigo-800 mb-4 flex items-center">
                <Award className="h-6 w-6 mr-2 text-indigo-600" />
                Recent Notable Sales
              </h2>
              
              <AnimatePresence mode="wait">
                {notableSales.length > 0 && (
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                    className="bg-indigo-200 rounded-xl p-4 shadow-inner"
                  >
                    <h3 className="text-xl font-bold text-indigo-900 mb-1">
                      {notableSales[currentIndex].propertyAddress}
                    </h3>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-indigo-700 mr-1" />
                        <span className="text-indigo-800">{notableSales[currentIndex].propertySuburb}</span>
                      </div>
                      <div className="text-xl font-bold text-indigo-900">
                        {formatCurrency(notableSales[currentIndex].price)}
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center">
                        <Home className="h-4 w-4 text-indigo-700 mr-1" />
                        <span className="text-indigo-800">{notableSales[currentIndex].propertyType}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-indigo-700 mr-1" />
                        <span className="text-indigo-800">
                          {new Date(notableSales[currentIndex].listedDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-3 text-center text-indigo-600 text-sm">
                      {currentIndex + 1} of {notableSales.length}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
          
          {/* Top Suburbs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-gradient-to-br from-rose-100 to-rose-300 rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-rose-800 mb-4 flex items-center">
                <Medal className="h-6 w-6 mr-2 text-rose-600" />
                Top Selling Suburbs
              </h2>
              
              <div className="space-y-3">
                {topSuburbs.map((suburb, index) => (
                  <div 
                    key={suburb.suburb} 
                    className="bg-rose-200 rounded-xl p-3 shadow-inner flex justify-between items-center"
                  >
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center mr-3 text-white font-bold text-sm`}>
                        {index + 1}
                      </div>
                      <span className="text-rose-900 font-medium">{suburb.suburb}</span>
                    </div>
                    <div className="flex items-center">
                      <Home className="h-4 w-4 text-rose-700 mr-2" />
                      <span className="text-rose-800 font-bold">{suburb.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}