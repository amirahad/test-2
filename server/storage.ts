import { db } from './db';
import { eq, sql } from 'drizzle-orm';
import { 
  users, 
  agents, 
  transactions, 
  salesStats,
  settings,
  type User, 
  type InsertUser,
  type Agent,
  type InsertAgent,
  type Transaction,
  type InsertTransaction,
  type SalesStats,
  type InsertSalesStats,
  type Settings,
  type InsertSettings
} from '@shared/schema';
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from './db';

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Agent methods
  getAgents(): Promise<Agent[]>;
  getAgent(id: number): Promise<Agent | undefined>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  updateAgent(id: number, agent: Partial<InsertAgent>): Promise<Agent | undefined>;
  deleteAgent(id: number): Promise<boolean>;
  
  // Transaction methods
  getTransactions(filters?: {
    agentId?: number;
    propertyType?: string;
    status?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: number): Promise<boolean>;
  
  // Stats methods
  getSalesStats(): Promise<SalesStats | undefined>;
  updateSalesStats(): Promise<SalesStats>;
  
  // Settings methods
  getSetting(key: string): Promise<Settings | undefined>;
  getSettingsByCategory(category: string): Promise<Settings[]>;
  getAllSettings(): Promise<Settings[]>;
  updateSetting(key: string, value: string, category?: string): Promise<Settings>;
  
  // Data import methods
  importExcelData(data: any[]): Promise<boolean>;
  
  // Super Admin methods
  getAllAgencies(): Promise<any[]>;
  getAgency(id: number): Promise<any | undefined>;
  createAgency(agencyData: {
    name: string;
    contactName: string;
    contactEmail: string;
    contactPhone?: string;
    rlaNumber?: string;
    logoUrl?: string;
    active?: boolean;
  }): Promise<any>;
  updateAgency(id: number, data: any): Promise<any | undefined>;
  getAllTransactions(): Promise<Transaction[]>;
  
  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    const PostgresStore = connectPg(session);
    this.sessionStore = new PostgresStore({
      pool,
      createTableIfMissing: true
    });
  }
  
  async getUser(id: number): Promise<User | undefined> {
    try {
      // Use raw SQL to select only guaranteed existing fields
      const result = await db.execute(
        sql`SELECT id, username, password, name, role FROM users WHERE id = ${id}`
      );
      
      const rows = result.rows;
      if (!rows || rows.length === 0) {
        return undefined;
      }
      
      const user = rows[0] as any;
      // Check if this is the admin user (for demo purposes the first user is a super admin)
      const isSuperAdmin = user.id === 1 || user.role === 'super_admin';
      
      return { 
        id: user.id,
        username: user.username,
        password: user.password,
        name: user.name,
        role: user.role, 
        createdAt: new Date(), // Default values for fields not in current schema
        updatedAt: new Date(),
        agencyId: null, 
        isSuperAdmin
      };
    } catch (error) {
      console.error("Error fetching user:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      // Use raw SQL to select only guaranteed existing fields
      const result = await db.execute(
        sql`SELECT id, username, password, name, role FROM users WHERE username = ${username}`
      );
      
      const rows = result.rows;
      if (!rows || rows.length === 0) {
        return undefined;
      }
      
      const user = rows[0] as any;
      // Check if this is the admin user (for demo purposes the first user is a super admin)
      const isSuperAdmin = user.id === 1 || user.role === 'super_admin';
      
      return { 
        id: user.id,
        username: user.username,
        password: user.password,
        name: user.name,
        role: user.role, 
        createdAt: new Date(), // Default values for fields not in current schema
        updatedAt: new Date(),
        agencyId: null, 
        isSuperAdmin 
      };
    } catch (error) {
      console.error("Error fetching user by username:", error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      // Extract only the fields that are guaranteed to exist in the database
      const userToInsert = {
        username: insertUser.username,
        password: insertUser.password,
        name: insertUser.name,
        role: insertUser.role || 'admin'
      };
      
      // Use raw SQL for insertion to ensure compatibility with schema
      const result = await db.execute(
        sql`INSERT INTO users (username, password, name, role) 
            VALUES (${userToInsert.username}, ${userToInsert.password}, ${userToInsert.name}, ${userToInsert.role})
            RETURNING id, username, password, name, role`
      );
      
      const rows = result.rows;
      if (!rows || rows.length === 0) {
        throw new Error("Failed to create user");
      }
      
      const user = rows[0] as any;
      
      // Return user object matching our schema
      return {
        id: user.id,
        username: user.username,
        password: user.password,
        name: user.name,
        role: user.role,
        createdAt: new Date(),
        updatedAt: new Date(),
        agencyId: null,
        isSuperAdmin: false
      };
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }
  

  
  async getAgents(): Promise<Agent[]> {
    try {
      // Try the multi-tenant version first
      return await db.select().from(agents);
    } catch (error) {
      // If that fails (likely agency_id column missing), use a raw query
      console.log("Fallback to raw query for agents table");
      const result = await pool.query('SELECT * FROM agents');
      return result.rows.map(row => ({
        ...row,
        agencyId: null // Add missing field required by type
      }));
    }
  }
  
  async getAgent(id: number): Promise<Agent | undefined> {
    const [agent] = await db.select().from(agents).where(eq(agents.id, id));
    return agent || undefined;
  }
  
  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    const [agent] = await db
      .insert(agents)
      .values(insertAgent)
      .returning();
    return agent;
  }
  
  async updateAgent(id: number, agentUpdate: Partial<InsertAgent>): Promise<Agent | undefined> {
    const [updatedAgent] = await db
      .update(agents)
      .set(agentUpdate)
      .where(eq(agents.id, id))
      .returning();
    return updatedAgent || undefined;
  }
  
  async deleteAgent(id: number): Promise<boolean> {
    const deleted = await db
      .delete(agents)
      .where(eq(agents.id, id));
    return !!deleted;
  }
  
  async getTransactions(filters?: {
    agentId?: number;
    propertyType?: string;
    status?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<Transaction[]> {
    try {
      let query = db.select().from(transactions);
      
      if (filters) {
        if (filters.agentId) {
          query = query.where(eq(transactions.agentId, filters.agentId));
        }
        if (filters.propertyType) {
          query = query.where(eq(transactions.propertyType, filters.propertyType));
        }
        if (filters.status) {
          query = query.where(eq(transactions.status, filters.status));
        }
        // For date filters, we'll have to use raw SQL for now
        if (filters.dateFrom) {
          query = query.where(sql`${transactions.transactionDate} >= ${filters.dateFrom}`);
        }
        if (filters.dateTo) {
          query = query.where(sql`${transactions.transactionDate} <= ${filters.dateTo}`);
        }
      }
      
      return await query.execute();
    } catch (error) {
      // Fall back to raw query if ORM fails (likely agency_id column missing)
      console.log("Fallback to raw query for transactions table");
      let queryStr = 'SELECT * FROM transactions';
      const queryParams: any[] = [];
      let whereClauses: string[] = [];
      
      if (filters) {
        if (filters.agentId) {
          whereClauses.push('agent_id = $' + (queryParams.length + 1));
          queryParams.push(filters.agentId);
        }
        if (filters.propertyType) {
          whereClauses.push('property_type = $' + (queryParams.length + 1));
          queryParams.push(filters.propertyType);
        }
        if (filters.status) {
          whereClauses.push('status = $' + (queryParams.length + 1));
          queryParams.push(filters.status);
        }
        if (filters.dateFrom) {
          whereClauses.push('transaction_date >= $' + (queryParams.length + 1));
          queryParams.push(filters.dateFrom);
        }
        if (filters.dateTo) {
          whereClauses.push('transaction_date <= $' + (queryParams.length + 1));
          queryParams.push(filters.dateTo);
        }
      }
      
      if (whereClauses.length > 0) {
        queryStr += ' WHERE ' + whereClauses.join(' AND ');
      }
      
      const result = await pool.query(queryStr, queryParams);
      return result.rows.map(row => ({
        ...row,
        agencyId: null, // Add missing field required by type
        propertyState: '',
        propertyPostcode: '',
        propertyDescription: '',
        carSpaces: 0,
        landSize: 0,
        buildingSize: 0
      }));
    }
  }
  
  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction || undefined;
  }
  
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(insertTransaction)
      .returning();
    return transaction;
  }
  
  async updateTransaction(id: number, transactionUpdate: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const [updatedTransaction] = await db
      .update(transactions)
      .set(transactionUpdate)
      .where(eq(transactions.id, id))
      .returning();
    return updatedTransaction || undefined;
  }
  
  async deleteTransaction(id: number): Promise<boolean> {
    const deleted = await db
      .delete(transactions)
      .where(eq(transactions.id, id));
    return !!deleted;
  }
  
  async getSalesStats(): Promise<SalesStats | undefined> {
    try {
      const [stats] = await db.select().from(salesStats).limit(1);
      return stats || undefined;
    } catch (error) {
      console.log("Fallback to raw query for sales_stats table");
      try {
        const result = await pool.query('SELECT * FROM sales_stats LIMIT 1');
        if (result.rows.length > 0) {
          return {
            ...result.rows[0],
            agencyId: null // Add missing field required by type
          };
        }
        return undefined;
      } catch (innerError) {
        console.error("Error in fallback sales_stats query:", innerError);
        return undefined;
      }
    }
  }
  
  async updateSalesStats(): Promise<SalesStats> {
    try {
      // Calculate stats from transactions - use all transactions for now (not just Sold)
      const allTransactions = await this.getTransactions();
      
      // Define period (last 12 months)
      const now = new Date();
      const startDate = new Date();
      startDate.setFullYear(now.getFullYear() - 1); // 1 year ago
      
      const totalSold = allTransactions.length;
      const totalRevenue = allTransactions.reduce((sum, t) => sum + Number(t.price), 0);
      const avgPrice = totalSold > 0 ? totalRevenue / totalSold : 0;
      // Calculate average days on market, handling potential NaN values
      let avgDaysOnMarket = 0;
      try {
        avgDaysOnMarket = Math.round(allTransactions.reduce((sum, t) => {
          // Check if both dates exist
          if (t.listedDate && t.transactionDate) {
            // Calculate days between listed and sold
            const listedDate = new Date(t.listedDate);
            const soldDate = new Date(t.transactionDate);
            // Ensure valid date objects
            if (!isNaN(listedDate.getTime()) && !isNaN(soldDate.getTime())) {
              const days = Math.round((soldDate.getTime() - listedDate.getTime()) / (1000 * 60 * 60 * 24));
              return sum + (isNaN(days) ? 0 : days);
            }
          }
          return sum; // Skip this transaction if dates are invalid
        }, 0) / (totalSold || 1));
        
        // Final check to ensure we don't have NaN
        if (isNaN(avgDaysOnMarket)) {
          avgDaysOnMarket = 0;
        }
      } catch (error) {
        console.error("Error calculating average days on market:", error);
        avgDaysOnMarket = 0;
      }
      
      // Convert numbers to strings for DB and add period info
      const statsData = {
        totalSold,
        totalRevenue: String(totalRevenue),
        avgPrice: String(avgPrice),
        avgDaysOnMarket,
        periodStart: startDate,
        periodEnd: now
      };
      
      // Check if record exists
      const existingStats = await this.getSalesStats();
      
      try {
        if (existingStats) {
          // Update existing record
          const [updatedStats] = await db
            .update(salesStats)
            .set(statsData)
            .where(eq(salesStats.id, existingStats.id))
            .returning();
          return updatedStats;
        } else {
          // Create new record
          const [newStats] = await db
            .insert(salesStats)
            .values(statsData)
            .returning();
          return newStats;
        }
      } catch (ormError) {
        // Fallback to raw SQL if ORM fails (likely schema mismatch)
        console.log("Fallback to raw SQL for sales_stats update");
        
        if (existingStats) {
          // Update using raw SQL
          const result = await pool.query(
            `UPDATE sales_stats 
             SET total_sold = $1, total_revenue = $2, avg_price = $3, avg_days_on_market = $4, 
                 period_start = $5, period_end = $6
             WHERE id = $7
             RETURNING *`,
            [
              statsData.totalSold,
              statsData.totalRevenue,
              statsData.avgPrice,
              statsData.avgDaysOnMarket,
              statsData.periodStart,
              statsData.periodEnd,
              existingStats.id
            ]
          );
          
          if (result.rows.length > 0) {
            return {
              ...result.rows[0],
              agencyId: null, // Add missing field required by type
              id: result.rows[0].id,
              totalSold: result.rows[0].total_sold,
              totalRevenue: result.rows[0].total_revenue,
              avgPrice: result.rows[0].avg_price,
              avgDaysOnMarket: result.rows[0].avg_days_on_market,
              periodStart: result.rows[0].period_start,
              periodEnd: result.rows[0].period_end,
              createdAt: result.rows[0].created_at,
              updatedAt: result.rows[0].updated_at
            };
          }
        } else {
          // Insert using raw SQL
          const result = await pool.query(
            `INSERT INTO sales_stats 
             (total_sold, total_revenue, avg_price, avg_days_on_market, period_start, period_end)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [
              statsData.totalSold,
              statsData.totalRevenue,
              statsData.avgPrice,
              statsData.avgDaysOnMarket,
              statsData.periodStart,
              statsData.periodEnd
            ]
          );
          
          if (result.rows.length > 0) {
            return {
              ...result.rows[0],
              agencyId: null, // Add missing field required by type
              id: result.rows[0].id,
              totalSold: result.rows[0].total_sold,
              totalRevenue: result.rows[0].total_revenue,
              avgPrice: result.rows[0].avg_price,
              avgDaysOnMarket: result.rows[0].avg_days_on_market,
              periodStart: result.rows[0].period_start,
              periodEnd: result.rows[0].period_end,
              createdAt: result.rows[0].created_at,
              updatedAt: result.rows[0].updated_at
            };
          }
        }
        
        throw new Error("Failed to update sales stats");
      }
    } catch (error) {
      console.error("Error updating stats:", error);
      throw new Error("Failed to update sales stats");
    }
  }
  
  async importExcelData(data: any[]): Promise<boolean> {
    try {
      // Start a transaction
      await db.transaction(async (tx) => {
        for (const row of data) {
          // Map CSV data to transaction schema
          const transaction: InsertTransaction = {
            propertyAddress: row.propertyAddress || '',
            propertySuburb: row.propertySuburb || '',
            propertyType: row.propertyType || 'Unknown',
            bedrooms: Number(row.bedrooms || 0),
            bathrooms: Number(row.bathrooms || 0),
            price: String(row.price || '0'), // Ensure string for DB
            status: row.status || 'Unknown',
            // Use a default agent ID, will be overridden if exists
            agentId: 1,
            agentName: row.agentName || 'Unknown',
            // Handle dates
            transactionDate: row.soldDate ? new Date(row.soldDate) : new Date(),
            listedDate: row.listedDate ? new Date(row.listedDate) : new Date(),
          };
          
          try {
            // First try using the ORM
            await tx.insert(transactions).values(transaction);
          } catch (insertErr) {
            // If ORM fails (likely due to schema mismatch), use raw SQL
            console.log("Falling back to raw SQL insert");
            
            // Build a query that only includes fields that exist in the actual DB
            const result = await pool.query(
              `INSERT INTO transactions 
               (property_address, property_suburb, property_type, bedrooms, bathrooms, price, 
                status, agent_id, agent_name, transaction_date, listed_date)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
              [
                transaction.propertyAddress,
                transaction.propertySuburb,
                transaction.propertyType,
                transaction.bedrooms,
                transaction.bathrooms,
                transaction.price,
                transaction.status,
                transaction.agentId,
                transaction.agentName,
                transaction.transactionDate,
                transaction.listedDate
              ]
            );
          }
        }
      });
      
      // Update stats after import
      await this.updateSalesStats();
      
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }
  
  // Settings methods implementation
  async getSetting(key: string): Promise<Settings | undefined> {
    try {
      const [setting] = await db.select({
        key: settings.key,
        value: settings.value,
        category: settings.category,
        createdAt: settings.createdAt,
        updatedAt: settings.updatedAt
      }).from(settings).where(eq(settings.key, key));
      
      if (setting) {
        return {
          ...setting,
          id: 0, // Use a default ID since it's missing in selection
          agencyId: null // Add missing field required by type
        };
      }
      return undefined;
    } catch (error) {
      console.error("Error fetching setting:", error);
      
      // Try raw query as fallback
      try {
        const result = await pool.query('SELECT * FROM settings WHERE key = $1', [key]);
        if (result.rows.length > 0) {
          return {
            id: result.rows[0].id || 0,
            key: result.rows[0].key,
            value: result.rows[0].value,
            category: result.rows[0].category,
            createdAt: result.rows[0].created_at,
            updatedAt: result.rows[0].updated_at,
            agencyId: null // Add missing field required by type
          };
        }
        return undefined;
      } catch (innerError) {
        console.error("Error in fallback settings query:", innerError);
        return undefined;
      }
    }
  }
  
  async getSettingsByCategory(category: string): Promise<Settings[]> {
    try {
      const results = await db.select({
        key: settings.key,
        value: settings.value,
        category: settings.category,
        createdAt: settings.createdAt,
        updatedAt: settings.updatedAt
      }).from(settings).where(eq(settings.category, category));
      
      // Add missing fields required by the type
      return results.map(setting => ({
        ...setting,
        id: 0, // Use a default ID since it's missing in selection
        agencyId: null // Add missing field required by type
      }));
    } catch (error) {
      console.error("Error fetching settings by category:", error);
      
      // Try raw query as fallback
      try {
        const result = await pool.query('SELECT * FROM settings WHERE category = $1', [category]);
        return result.rows.map(row => ({
          id: row.id || 0,
          key: row.key,
          value: row.value,
          category: row.category,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          agencyId: null // Add missing field required by type
        }));
      } catch (innerError) {
        console.error("Error in fallback settings by category query:", innerError);
        return [];
      }
    }
  }
  
  async getAllSettings(): Promise<Settings[]> {
    try {
      const results = await db.select({
        key: settings.key,
        value: settings.value,
        category: settings.category,
        createdAt: settings.createdAt,
        updatedAt: settings.updatedAt
      }).from(settings);
      
      // Add missing fields required by the type
      return results.map(setting => ({
        ...setting,
        id: 0, // Use a default ID since it's missing in selection
        agencyId: null // Add missing field required by type
      }));
    } catch (error) {
      console.error("Error fetching all settings:", error);
      
      // Try raw query as fallback
      try {
        const result = await pool.query('SELECT * FROM settings');
        return result.rows.map(row => ({
          id: row.id || 0,
          key: row.key,
          value: row.value,
          category: row.category,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          agencyId: null // Add missing field required by type
        }));
      } catch (innerError) {
        console.error("Error in fallback all settings query:", innerError);
        return [];
      }
    }
  }
  
  async updateSetting(key: string, value: string, category: string = 'general'): Promise<Settings> {
    try {
      // Check if setting exists
      const existingSetting = await this.getSetting(key);
      
      try {
        if (existingSetting) {
          // Update existing setting
          const [updatedSetting] = await db
            .update(settings)
            .set({ value, category, updatedAt: new Date() })
            .where(eq(settings.key, key))
            .returning();
            
          // Add missing fields required by the type
          return {
            ...updatedSetting,
            id: existingSetting.id, // Use existing ID
            agencyId: null // Add missing field required by type
          };
        } else {
          // Create new setting
          const [newSetting] = await db
            .insert(settings)
            .values({ key, value, category })
            .returning();
            
          // Add missing fields required by the type
          return {
            ...newSetting,
            id: 0, // Default ID for new setting
            agencyId: null // Add missing field required by type
          };
        }
      } catch (ormError) {
        // Fall back to raw SQL
        console.log("Fallback to raw SQL for settings update/insert");
        
        if (existingSetting) {
          // Update with raw SQL
          const result = await pool.query(
            `UPDATE settings
             SET value = $1, category = $2, updated_at = $3
             WHERE key = $4
             RETURNING *`,
            [value, category, new Date(), key]
          );
          
          if (result.rows.length > 0) {
            return {
              id: result.rows[0].id || 0,
              key: result.rows[0].key,
              value: result.rows[0].value,
              category: result.rows[0].category,
              createdAt: result.rows[0].created_at,
              updatedAt: result.rows[0].updated_at,
              agencyId: null // Add missing field required by type
            };
          }
        } else {
          // Insert with raw SQL
          const result = await pool.query(
            `INSERT INTO settings (key, value, category, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [key, value, category, new Date(), new Date()]
          );
          
          if (result.rows.length > 0) {
            return {
              id: result.rows[0].id || 0,
              key: result.rows[0].key,
              value: result.rows[0].value,
              category: result.rows[0].category,
              createdAt: result.rows[0].created_at,
              updatedAt: result.rows[0].updated_at,
              agencyId: null // Add missing field required by type
            };
          }
        }
        
        throw new Error("Failed to update setting");
      }
    } catch (error) {
      console.error("Error updating setting:", error);
      throw new Error("Failed to update setting");
    }
  }

  // Super Admin methods
  async getAllAgencies(): Promise<any[]> {
    try {
      const result = await pool.query(`
        SELECT * FROM agencies
        ORDER BY name ASC
      `);
      
      return result.rows.map(row => ({
        id: row.id,
        name: row.name,
        contactName: row.contact_name,
        contactEmail: row.contact_email,
        contactPhone: row.contact_phone,
        rlaNumber: row.rla_number,
        logoUrl: row.logo_url,
        active: row.active === true || row.active === 1, // Handle both boolean and integer
        createdAt: row.created_at || new Date(),
        updatedAt: row.updated_at || new Date()
      }));
    } catch (error) {
      console.error("Error fetching all agencies:", error);
      // Return empty array if the table doesn't exist or there's an error
      return [];
    }
  }
  
  async createAgency(agencyData: {
    name: string;
    contactName: string;
    contactEmail: string;
    contactPhone?: string;
    rlaNumber?: string;
    logoUrl?: string;
    active?: boolean;
  }): Promise<any> {
    try {
      const result = await pool.query(`
        INSERT INTO agencies (
          name, 
          contact_name, 
          contact_email, 
          contact_phone, 
          rla_number, 
          logo_url, 
          active,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING *
      `, [
        agencyData.name,
        agencyData.contactName,
        agencyData.contactEmail,
        agencyData.contactPhone || null,
        agencyData.rlaNumber || null,
        agencyData.logoUrl || null,
        agencyData.active === undefined ? true : agencyData.active
      ]);
      
      const row = result.rows[0];
      
      return {
        id: row.id,
        name: row.name,
        contactName: row.contact_name,
        contactEmail: row.contact_email,
        contactPhone: row.contact_phone,
        rlaNumber: row.rla_number,
        logoUrl: row.logo_url,
        active: row.active === true || row.active === 1,
        createdAt: row.created_at || new Date(),
        updatedAt: row.updated_at || new Date()
      };
    } catch (error) {
      console.error("Error creating agency:", error);
      throw new Error("Failed to create agency");
    }
  }
  
  async getAgency(id: number): Promise<any | undefined> {
    try {
      const result = await pool.query(`
        SELECT * FROM agencies 
        WHERE id = $1
      `, [id]);
      
      if (result.rows.length === 0) {
        return undefined;
      }
      
      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        contactName: row.contact_name,
        contactEmail: row.contact_email,
        contactPhone: row.contact_phone,
        rlaNumber: row.rla_number,
        logoUrl: row.logo_url,
        active: row.active === true || row.active === 1, // Handle both boolean and integer
        createdAt: row.created_at || new Date(),
        updatedAt: row.updated_at || new Date()
      };
    } catch (error) {
      console.error("Error fetching agency:", error);
      return undefined;
    }
  }
  
  async updateAgency(id: number, data: any): Promise<any | undefined> {
    try {
      // Build the SET clause dynamically based on the data
      const setValues = [];
      const queryParams = [];
      let paramCounter = 1;
      
      if (data.name !== undefined) {
        setValues.push(`name = $${paramCounter++}`);
        queryParams.push(data.name);
      }
      
      if (data.contactName !== undefined) {
        setValues.push(`contact_name = $${paramCounter++}`);
        queryParams.push(data.contactName);
      }
      
      if (data.contactEmail !== undefined) {
        setValues.push(`contact_email = $${paramCounter++}`);
        queryParams.push(data.contactEmail);
      }
      
      if (data.contactPhone !== undefined) {
        setValues.push(`contact_phone = $${paramCounter++}`);
        queryParams.push(data.contactPhone);
      }
      
      if (data.rlaNumber !== undefined) {
        setValues.push(`rla_number = $${paramCounter++}`);
        queryParams.push(data.rlaNumber);
      }
      
      if (data.logoUrl !== undefined) {
        setValues.push(`logo_url = $${paramCounter++}`);
        queryParams.push(data.logoUrl);
      }
      
      if (data.active !== undefined) {
        setValues.push(`active = $${paramCounter++}`);
        queryParams.push(data.active);
      }
      
      setValues.push(`updated_at = $${paramCounter++}`);
      queryParams.push(new Date());
      
      // Add the ID as the last parameter
      queryParams.push(id);
      
      if (setValues.length === 0) {
        throw new Error("No data provided for update");
      }
      
      const query = `
        UPDATE agencies
        SET ${setValues.join(", ")}
        WHERE id = $${paramCounter}
        RETURNING *
      `;
      
      const result = await pool.query(query, queryParams);
      
      if (result.rows.length === 0) {
        return undefined;
      }
      
      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        contactName: row.contact_name,
        contactEmail: row.contact_email,
        contactPhone: row.contact_phone,
        rlaNumber: row.rla_number,
        logoUrl: row.logo_url,
        active: row.active === true || row.active === 1, // Handle both boolean and integer
        createdAt: row.created_at || new Date(),
        updatedAt: row.updated_at || new Date()
      };
    } catch (error) {
      console.error("Error updating agency:", error);
      return undefined;
    }
  }
  
  async getAllTransactions(): Promise<Transaction[]> {
    try {
      // Use raw query with JOIN to get transaction data with agency name
      const query = `
        SELECT t.*, a.name as agency_name
        FROM transactions t
        LEFT JOIN agencies a ON t.agency_id = a.id
        ORDER BY t.listed_date DESC
      `;
      
      const result = await pool.query(query);
      
      return result.rows.map(row => ({
        id: row.id,
        propertyAddress: row.property_address || '',
        propertySuburb: row.property_suburb || '',
        propertyType: row.property_type || '',
        bedrooms: row.bedrooms || 0,
        bathrooms: row.bathrooms || 0,
        price: row.price || '$0',
        status: row.status || '',
        agentId: row.agent_id,
        agentName: row.agent_name || '',
        listedDate: row.listed_date ? new Date(row.listed_date) : new Date(),
        transactionDate: row.transaction_date ? new Date(row.transaction_date) : undefined,
        createdAt: row.created_at ? new Date(row.created_at) : new Date(),
        updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
        agencyId: row.agency_id,
        // Include agency name from JOIN
        agencyName: row.agency_name || 'Unknown Agency',
        // Add missing fields required by type with defaults
        propertyState: '',
        propertyPostcode: '',
        propertyDescription: '',
        carSpaces: 0,
        landSize: 0,
        buildingSize: 0
      }));
    } catch (error) {
      console.error("Error in getAllTransactions:", error);
      // Fall back to regular getTransactions without agency data if the JOIN fails
      const transactions = await this.getTransactions();
      return transactions;
    }
  }
}

// Create and export the storage instance
export const storage = new DatabaseStorage();