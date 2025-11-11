/*
  # Create Fraud Detection System Tables

  1. New Tables
    - `transactions`
      - `id` (uuid, primary key)
      - `transaction_id` (text, unique)
      - `amount` (numeric)
      - `timestamp` (timestamptz)
      - `location` (text)
      - `merchant` (text)
      - `merchant_category` (text)
      - `device_info` (text)
      - `ip_address` (text)
      - `fraud_score` (numeric, 0-1)
      - `is_fraudulent` (boolean)
      - `detection_reason` (text)
      - `created_at` (timestamptz)
      - `user_id` (uuid, nullable)
    
    - `fraud_reports`
      - `id` (uuid, primary key)
      - `report_date` (timestamptz)
      - `total_transactions` (integer)
      - `fraudulent_count` (integer)
      - `safe_count` (integer)
      - `report_data` (jsonb)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id text UNIQUE NOT NULL,
  amount numeric NOT NULL,
  timestamp timestamptz DEFAULT now(),
  location text,
  merchant text,
  merchant_category text,
  device_info text,
  ip_address text,
  fraud_score numeric DEFAULT 0,
  is_fraudulent boolean DEFAULT false,
  detection_reason text,
  created_at timestamptz DEFAULT now(),
  user_id uuid
);

-- Create fraud_reports table
CREATE TABLE IF NOT EXISTS fraud_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date timestamptz DEFAULT now(),
  total_transactions integer DEFAULT 0,
  fraudulent_count integer DEFAULT 0,
  safe_count integer DEFAULT 0,
  report_data jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_reports ENABLE ROW LEVEL SECURITY;

-- Policies for transactions
CREATE POLICY "Allow public read access to transactions"
  ON transactions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to transactions"
  ON transactions
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policies for fraud_reports
CREATE POLICY "Allow public read access to fraud_reports"
  ON fraud_reports
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to fraud_reports"
  ON fraud_reports
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_fraud ON transactions(is_fraudulent);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_transactions_fraud_score ON transactions(fraud_score);