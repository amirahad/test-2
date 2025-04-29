import { format, parseISO } from 'date-fns';

// Helper function to format currency
export function formatCurrency(value: number | string): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (numValue >= 1000000) {
    return `$${(numValue / 1000000).toFixed(1)}M`;
  } else {
    return new Intl.NumberFormat('en-AU', { 
      style: 'currency', 
      currency: 'AUD',
      maximumFractionDigits: 0 
    }).format(numValue);
  }
}

// Helper function to format dates
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM d, yyyy');
}

// Get a color based on property type
export function getPropertyTypeColor(type: string, isDarkMode: boolean = false): string {
  if (isDarkMode) {
    switch (type) {
      case 'House':
        return 'bg-blue-700 text-blue-100';
      case 'Apartment':
        return 'bg-purple-700 text-purple-100';
      case 'Townhouse':
        return 'bg-green-700 text-green-100';
      case 'Land':
        return 'bg-amber-700 text-amber-100';
      default:
        return 'bg-gray-700 text-gray-100';
    }
  } else {
    switch (type) {
      case 'House':
        return 'bg-blue-100 text-blue-800';
      case 'Apartment':
        return 'bg-purple-100 text-purple-800';
      case 'Townhouse':
        return 'bg-green-100 text-green-800';
      case 'Land':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}

// Get a color based on transaction status
export function getStatusColor(status: string, isDarkMode: boolean = false): string {
  if (isDarkMode) {
    switch (status) {
      case 'Settled':
        return 'bg-green-700 text-green-100';
      case 'Pending':
        return 'bg-yellow-700 text-yellow-100';
      case 'Cancelled':
        return 'bg-red-700 text-red-100';
      default:
        return 'bg-gray-700 text-gray-100';
    }
  } else {
    switch (status) {
      case 'Settled':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}

// Get chart colors for consistency
export function getChartColors(): string[] {
  return [
    'rgba(59, 130, 246, 0.8)', // blue
    'rgba(16, 185, 129, 0.8)', // green
    'rgba(139, 92, 246, 0.8)',  // purple
    'rgba(245, 158, 11, 0.8)', // amber
    'rgba(239, 68, 68, 0.8)' // red
  ];
}

export function getChartBorderColors(): string[] {
  return [
    'rgba(59, 130, 246, 1)', // blue
    'rgba(16, 185, 129, 1)', // green
    'rgba(139, 92, 246, 1)',  // purple
    'rgba(245, 158, 11, 1)', // amber
    'rgba(239, 68, 68, 1)' // red
  ];
}

// Download data as CSV
export function downloadCSV(data: any[], filename: string): void {
  if (!data.length) return;
  
  // Get headers from first row
  const headers = Object.keys(data[0]);
  
  // Convert data to CSV
  const csvRows = [];
  
  // Add headers
  csvRows.push(headers.join(','));
  
  // Add rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      
      // Handle strings with commas
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`;
      }
      
      return value;
    });
    
    csvRows.push(values.join(','));
  }
  
  // Create CSV content
  const csvContent = csvRows.join('\n');
  
  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  // Create temporary link and trigger download
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
