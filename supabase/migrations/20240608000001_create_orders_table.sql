-- Create orders table to track user purchases
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Link to portraits being purchased. Using JSONB for flexibility as items might expand later.
  -- Alternatively, a junction table order_items could be used if more structure is needed.
  items JSONB, -- Example: [{ "type": "portrait", "id": "uuid", "price": 500 }, { "type": "merch", "id": "prod_123", "price": 1500 }]
  amount INT NOT NULL, -- Total amount in smallest currency unit (e.g., cents)
  currency VARCHAR(3) NOT NULL, -- ISO currency code (e.g., 'USD')
  status TEXT NOT NULL DEFAULT 'pending_payment', -- e.g., pending_payment, processing, completed, payment_failed, refunded, canceled
  payment_intent_id TEXT, -- Store the ID from the payment provider (mock or real)
  payment_method_details JSONB, -- Store details about the payment method used (e.g., last4 digits for mock)
  metadata JSONB, -- Any additional metadata related to the order
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add comments to clarify column purposes
COMMENT ON COLUMN orders.items IS 'JSONB array containing items in the order (e.g., portraits, merchandise)';
COMMENT ON COLUMN orders.amount IS 'Total order amount in the smallest currency unit (e.g., cents)';
COMMENT ON COLUMN orders.currency IS 'ISO 4217 currency code (e.g., USD, EUR)';
COMMENT ON COLUMN orders.status IS 'Current status of the order lifecycle';
COMMENT ON COLUMN orders.payment_intent_id IS 'Reference ID from the payment provider (mock or real)';
COMMENT ON COLUMN orders.payment_method_details IS 'Details about the payment method used, potentially masked';

-- Create index for querying orders by user
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders(user_id);

-- Create index for querying orders by status
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);

-- Enable RLS (Row Level Security)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policies for orders table
-- Allow users to view only their own orders
CREATE POLICY orders_select_policy ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert orders only for themselves (backend service role might bypass this)
CREATE POLICY orders_insert_policy ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
-- Allow users to update specific fields of their own orders if needed (e.g., cancel before processing)
-- This policy might need refinement based on application logic.
-- Restrict updates primarily to backend service roles.
CREATE POLICY orders_update_policy ON orders
  FOR UPDATE USING (auth.uid() = user_id);
  
-- Allow users to delete their orders (potentially restricted based on status)
-- Restrict deletes primarily to backend service roles or specific conditions.
CREATE POLICY orders_delete_policy ON orders
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp for orders
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on orders table
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_orders_updated_at(); 