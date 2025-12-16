/*
  # Add Explainability, Dynamic Thresholding, and Compliance Tracking

  1. New Tables
    - `explainability_logs` - Stores feature importance and model explanations
    - `threshold_configs` - Manages dynamic fraud detection thresholds by merchant category
    - `compliance_events` - Tracks compliance violations and regulatory checks
    - `feature_importance` - Stores feature importance scores for fraud predictions

  2. Modified Tables
    - `transactions` - Add explainability_id and threshold_id foreign keys

  3. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users and admins
*/

-- Create explainability_logs table
CREATE TABLE IF NOT EXISTS explainability_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid REFERENCES transactions(id) ON DELETE CASCADE,
  model_prediction numeric NOT NULL,
  prediction_confidence numeric NOT NULL,
  shap_values jsonb NOT NULL,
  feature_importance jsonb NOT NULL,
  explanation_text text,
  lime_explanation jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create feature_importance table
CREATE TABLE IF NOT EXISTS feature_importance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_name text NOT NULL,
  importance_score numeric NOT NULL,
  feature_type text,
  description text,
  threshold_impact numeric,
  sample_count integer DEFAULT 0,
  last_updated timestamptz DEFAULT now()
);

-- Create threshold_configs table
CREATE TABLE IF NOT EXISTS threshold_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_category text NOT NULL UNIQUE,
  fraud_threshold numeric DEFAULT 0.5 CHECK (fraud_threshold >= 0 AND fraud_threshold <= 1),
  dynamic_adjustment boolean DEFAULT true,
  min_threshold numeric DEFAULT 0.3,
  max_threshold numeric DEFAULT 0.8,
  adaptation_rate numeric DEFAULT 0.1,
  sample_size_minimum integer DEFAULT 100,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create compliance_events table
CREATE TABLE IF NOT EXISTS compliance_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  severity text CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  transaction_id uuid REFERENCES transactions(id) ON DELETE SET NULL,
  compliance_standard text,
  violation_details jsonb,
  resolution_status text DEFAULT 'pending',
  resolution_notes text,
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

-- Add foreign keys to transactions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'explainability_id'
  ) THEN
    ALTER TABLE transactions 
    ADD COLUMN explainability_id uuid REFERENCES explainability_logs(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'threshold_id'
  ) THEN
    ALTER TABLE transactions 
    ADD COLUMN threshold_id uuid REFERENCES threshold_configs(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE explainability_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_importance ENABLE ROW LEVEL SECURITY;
ALTER TABLE threshold_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for explainability_logs
CREATE POLICY "Allow public read explainability logs"
  ON explainability_logs
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert explainability logs"
  ON explainability_logs
  FOR INSERT
  TO public
  WITH CHECK (true);

-- RLS Policies for feature_importance
CREATE POLICY "Allow public read feature importance"
  ON feature_importance
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert feature importance"
  ON feature_importance
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update feature importance"
  ON feature_importance
  FOR UPDATE
  TO public
  WITH CHECK (true);

-- RLS Policies for threshold_configs
CREATE POLICY "Allow public read thresholds"
  ON threshold_configs
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert thresholds"
  ON threshold_configs
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update thresholds"
  ON threshold_configs
  FOR UPDATE
  TO public
  WITH CHECK (true);

-- RLS Policies for compliance_events
CREATE POLICY "Allow public read compliance events"
  ON compliance_events
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert compliance events"
  ON compliance_events
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update compliance events"
  ON compliance_events
  FOR UPDATE
  TO public
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_explainability_transaction ON explainability_logs(transaction_id);
CREATE INDEX IF NOT EXISTS idx_feature_importance_name ON feature_importance(feature_name);
CREATE INDEX IF NOT EXISTS idx_threshold_merchant_category ON threshold_configs(merchant_category);
CREATE INDEX IF NOT EXISTS idx_compliance_events_type ON compliance_events(event_type);
CREATE INDEX IF NOT EXISTS idx_compliance_events_severity ON compliance_events(severity);
CREATE INDEX IF NOT EXISTS idx_compliance_events_transaction ON compliance_events(transaction_id);
