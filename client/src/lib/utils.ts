import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility function for combining tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Function to convert Excel file to JSON
export async function excelToJson(file: File): Promise<any[]> {
  // In a real application, we'd process the Excel file, but for now we'll just return an empty array
  // as the backend already has sample data
  return [];
}

// Date ranges for filtering
export const dateRangeOptions = [
  { label: "Last 30 days", value: "30days" },
  { label: "Last quarter", value: "90days" },
  { label: "Last 6 months", value: "6months" },
  { label: "This year", value: "12months" },
  { label: "All time", value: "all" },
];

// Property type options
export const propertyTypeOptions = [
  { label: "All Properties", value: "all" },
  { label: "House", value: "House" },
  { label: "Apartment", value: "Apartment" },
  { label: "Townhouse", value: "Townhouse" },
  { label: "Land", value: "Land" },
];

// Transaction status options
export const statusOptions = [
  { label: "All Statuses", value: "all" },
  { label: "Listed", value: "listed" },
  { label: "Under Offer", value: "under_offer" },
  { label: "Sold", value: "sold" },
  { label: "Settled", value: "settled" },
  { label: "Withdrawn", value: "withdrawn" },
  { label: "Expired", value: "expired" },
  { label: "Off Market", value: "off_market" },
  { label: "Auctioned", value: "auctioned" },
  { label: "Passed In", value: "passed_in" },
  { label: "Pending", value: "pending" },
];

// Sort options for the transactions table
export const sortOptions = [
  { label: "Newest First", value: "date-desc" },
  { label: "Oldest First", value: "date-asc" },
  { label: "Price (High to Low)", value: "price-desc" },
  { label: "Price (Low to High)", value: "price-asc" },
  { label: "Property (A-Z)", value: "property-asc" },
  { label: "Property (Z-A)", value: "property-desc" },
];

// Chart period options
export const chartPeriodOptions = [
  { label: "This Quarter", value: "quarter" },
  { label: "Last Quarter", value: "lastQuarter" },
  { label: "This Year", value: "year" },
  { label: "Last Year", value: "lastYear" },
];

// Chart view options
export const chartViewOptions = [
  { label: "30 Days", value: "30days" },
  { label: "6 Months", value: "6months" },
  { label: "12 Months", value: "12months" },
];
