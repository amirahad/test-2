import { pgTable, text, serial, integer, boolean, timestamp, varchar, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Property type enum
export const PropertyType = {
  HOUSE: "House",
  APARTMENT: "Apartment",
  TOWNHOUSE: "Townhouse",
  LAND: "Land",
} as const;

export const PropertyTypeValues = Object.values(PropertyType);
export type PropertyTypeEnum = (typeof PropertyType)[keyof typeof PropertyType];

// Transaction status enum
export const TransactionStatus = {
  LISTED: "listed",
  UNDER_OFFER: "under_offer",
  SOLD: "sold",
  SETTLED: "settled",
  WITHDRAWN: "withdrawn",
  EXPIRED: "expired",
  OFF_MARKET: "off_market",
  AUCTIONED: "auctioned",
  PASSED_IN: "passed_in",
  PENDING: "pending"
} as const;

export const TransactionStatusValues = Object.values(TransactionStatus);
export type TransactionStatusEnum = (typeof TransactionStatus)[keyof typeof TransactionStatus];

// Agents table
export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  role: text("role").default("Sales Agent"),
  profilePicture: text("profile_picture"),
  agencyId: integer("agency_id").references(() => agencies.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAgentSchema = createInsertSchema(agents).pick({
  name: true,
  email: true,
  phone: true,
  role: true,
  profilePicture: true,
  agencyId: true,
});

export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Agent = typeof agents.$inferSelect;

// Transactions table (sales)
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  propertyAddress: text("property_address").notNull(),
  propertySuburb: text("property_suburb").notNull(),
  propertyType: text("property_type").notNull(),
  bedrooms: integer("bedrooms").default(0),
  bathrooms: integer("bathrooms").default(0),
  price: numeric("price").notNull(),
  agentId: integer("agent_id").notNull(),
  agentName: text("agent_name"),
  status: text("status").notNull().default(TransactionStatus.LISTED),
  transactionDate: timestamp("transaction_date").notNull().defaultNow(),
  listedDate: timestamp("listed_date").notNull().defaultNow(),
  agencyId: integer("agency_id").references(() => agencies.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  propertyAddress: true,
  propertySuburb: true,
  propertyType: true,
  bedrooms: true,
  bathrooms: true,
  price: true,
  agentId: true,
  agentName: true,
  status: true,
  transactionDate: true,
  listedDate: true,
});

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

// Sales stats (aggregated data for dashboard)
export const salesStats = pgTable("sales_stats", {
  id: serial("id").primaryKey(),
  totalSold: integer("total_sold").notNull(),
  totalRevenue: numeric("total_revenue").notNull(),
  avgPrice: numeric("avg_price").notNull(),
  avgDaysOnMarket: integer("avg_days_on_market").notNull(),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  agencyId: integer("agency_id").references(() => agencies.id),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSalesStatsSchema = createInsertSchema(salesStats).pick({
  totalSold: true,
  totalRevenue: true,
  avgPrice: true,
  avgDaysOnMarket: true,
  periodStart: true,
  periodEnd: true,
});

export type InsertSalesStats = z.infer<typeof insertSalesStatsSchema>;
export type SalesStats = typeof salesStats.$inferSelect;

// Agencies table
export const agencies = pgTable("agencies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contactName: text("contact_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone"),
  rlaNumber: text("rla_number"),
  logoUrl: text("logo_url"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAgencySchema = createInsertSchema(agencies).pick({
  name: true,
  contactName: true,
  contactEmail: true,
  contactPhone: true,
  rlaNumber: true,
  logoUrl: true,
  active: true,
});

export type InsertAgency = z.infer<typeof insertAgencySchema>;
export type Agency = typeof agencies.$inferSelect;

// Users table with agency relationship
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("admin"),
  agencyId: integer("agency_id").references(() => agencies.id),
  isSuperAdmin: boolean("is_super_admin").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  role: true,
  agencyId: true,
  isSuperAdmin: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Settings table for application settings
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull(),
  value: text("value").notNull(),
  category: text("category").notNull().default("general"),
  agencyId: integer("agency_id").references(() => agencies.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSettingsSchema = createInsertSchema(settings).pick({
  key: true,
  value: true,
  category: true,
  agencyId: true
});
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;
