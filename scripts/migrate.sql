-- Drop existing tables if they exist
DROP TABLE IF EXISTS sales_stats;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS agents; 
DROP TABLE IF EXISTS users;

-- Create agents table
CREATE TABLE agents (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT
);

-- Create transactions table 
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  property_address TEXT NOT NULL,
  property_suburb TEXT NOT NULL,
  property_type TEXT NOT NULL,
  bedrooms INTEGER DEFAULT 0,
  bathrooms INTEGER DEFAULT 0,
  price NUMERIC NOT NULL,
  agent_id INTEGER NOT NULL,
  agent_name TEXT,
  status TEXT NOT NULL DEFAULT 'Pending',
  transaction_date TIMESTAMP NOT NULL DEFAULT NOW(),
  listed_date TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create sales stats table
CREATE TABLE sales_stats (
  id SERIAL PRIMARY KEY,
  total_sold INTEGER NOT NULL,
  total_revenue NUMERIC NOT NULL,
  avg_price NUMERIC NOT NULL,
  avg_days_on_market INTEGER NOT NULL,
  period_start TIMESTAMP NOT NULL,
  period_end TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user'
);

-- Insert sample agent
INSERT INTO agents (name, email, phone) 
VALUES ('John Smith', 'john.smith@belleproperty.com', '+61 400 123 456');