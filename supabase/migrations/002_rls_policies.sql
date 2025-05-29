-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mr_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can insert profiles" ON profiles FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update all profiles" ON profiles FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Products policies
CREATE POLICY "All authenticated users can view products" ON products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and warehouse staff can manage products" ON products FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'warehouse'))
);

-- Batches policies
CREATE POLICY "All authenticated users can view batches" ON batches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and warehouse staff can manage batches" ON batches FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'warehouse'))
);

-- Stock transactions policies
CREATE POLICY "Users can view their own transactions" ON stock_transactions FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.uid() = from_user_id OR 
    auth.uid() = to_user_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can insert their own transactions" ON stock_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all transactions" ON stock_transactions FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- MR stock policies
CREATE POLICY "MRs can view their own stock" ON mr_stock FOR SELECT USING (auth.uid() = mr_id);
CREATE POLICY "Admins can view all MR stock" ON mr_stock FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins and warehouse can manage MR stock" ON mr_stock FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'warehouse'))
);

-- Alerts policies
CREATE POLICY "Users can view their own alerts" ON alerts FOR SELECT USING (
    auth.uid() = user_id OR user_id IS NULL OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can update their own alerts" ON alerts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can insert alerts" ON alerts FOR INSERT WITH CHECK (true);
