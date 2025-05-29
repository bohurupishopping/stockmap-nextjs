-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- Create products table
CREATE TABLE products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    unit TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    sku TEXT UNIQUE,
    manufacturer TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create batches table
CREATE TABLE batches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    batch_number TEXT NOT NULL,
    manufacturing_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity >= 0),
    remaining_quantity INTEGER NOT NULL CHECK (remaining_quantity >= 0),
    cost_price DECIMAL(10,2),
    selling_price DECIMAL(10,2),
    supplier TEXT,
    location TEXT DEFAULT 'godown',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, batch_number)
);

-- Create stock_transactions table
CREATE TABLE stock_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('stock_in', 'stock_transfer', 'godown_sale', 'mr_sale', 'return', 'adjustment')),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    batch_id UUID REFERENCES batches(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2),
    total_amount DECIMAL(10,2),
    from_location TEXT,
    to_location TEXT,
    from_user_id UUID REFERENCES profiles(id),
    to_user_id UUID REFERENCES profiles(id),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    customer_name TEXT,
    customer_phone TEXT,
    notes TEXT,
    reference_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mr_stock table for tracking MR assigned stock
CREATE TABLE mr_stock (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    mr_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    batch_id UUID REFERENCES batches(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity >= 0),
    assigned_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(mr_id, batch_id)
);

-- Create alerts table
CREATE TABLE alerts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('low_stock', 'expiry_warning', 'expired', 'system')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    is_read BOOLEAN DEFAULT FALSE,
    user_id UUID REFERENCES profiles(id),
    product_id UUID REFERENCES products(id),
    batch_id UUID REFERENCES batches(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_batches_product_id ON batches(product_id);
CREATE INDEX idx_batches_expiry_date ON batches(expiry_date);
CREATE INDEX idx_batches_remaining_quantity ON batches(remaining_quantity);
CREATE INDEX idx_stock_transactions_type ON stock_transactions(type);
CREATE INDEX idx_stock_transactions_user_id ON stock_transactions(user_id);
CREATE INDEX idx_stock_transactions_created_at ON stock_transactions(created_at);
CREATE INDEX idx_mr_stock_mr_id ON mr_stock(mr_id);
CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_alerts_is_read ON alerts(is_read);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_batches_updated_at BEFORE UPDATE ON batches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mr_stock_updated_at BEFORE UPDATE ON mr_stock FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
