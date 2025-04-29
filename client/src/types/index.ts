export interface Agent {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role?: string;
  profilePicture?: string | null;
  agencyId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Property {
  id: number;
  propertyAddress: string;
  propertySuburb: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  price: string;
  status: string;
  agentId: number;
  agentName: string;
  transactionDate?: Date;
  listedDate: Date;
  propertyPostcode?: string;
  agencyId?: number;
  agencyName?: string;
}

export interface SalesStats {
  totalSold: number;
  totalRevenue: string;
  avgPrice: string;
  avgDaysOnMarket: number;
  periodStart?: Date;
  periodEnd?: Date;
}

export interface Settings {
  key: string;
  value: string;
  category: string;
}

export interface Agency {
  id: number;
  name: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  rlaNumber?: string;
  logoUrl?: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}