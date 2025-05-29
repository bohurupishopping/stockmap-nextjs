-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'mr')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update batch remaining quantity
CREATE OR REPLACE FUNCTION update_batch_quantity()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.type IN ('godown_sale', 'mr_sale', 'stock_transfer') THEN
        UPDATE batches 
        SET remaining_quantity = remaining_quantity - NEW.quantity
        WHERE id = NEW.batch_id;
    ELSIF NEW.type = 'return' THEN
        UPDATE batches 
        SET remaining_quantity = remaining_quantity + NEW.quantity
        WHERE id = NEW.batch_id;
    ELSIF NEW.type = 'stock_in' THEN
        UPDATE batches 
        SET remaining_quantity = remaining_quantity + NEW.quantity
        WHERE id = NEW.batch_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for stock transactions
CREATE TRIGGER update_batch_quantity_trigger
    AFTER INSERT ON stock_transactions
    FOR EACH ROW EXECUTE FUNCTION update_batch_quantity();

-- Function to generate low stock alerts
CREATE OR REPLACE FUNCTION check_low_stock()
RETURNS VOID AS $$
BEGIN
    INSERT INTO alerts (type, title, message, severity, product_id, batch_id)
    SELECT 
        'low_stock',
        'Low Stock Alert',
        'Product ' || p.name || ' (Batch: ' || b.batch_number || ') is running low. Only ' || b.remaining_quantity || ' units remaining.',
        CASE 
            WHEN b.remaining_quantity = 0 THEN 'critical'
            WHEN b.remaining_quantity <= 5 THEN 'high'
            ELSE 'medium'
        END,
        b.product_id,
        b.id
    FROM batches b
    JOIN products p ON b.product_id = p.id
    WHERE b.remaining_quantity <= 10 
    AND b.is_active = true
    AND NOT EXISTS (
        SELECT 1 FROM alerts a 
        WHERE a.batch_id = b.id 
        AND a.type = 'low_stock' 
        AND a.created_at > NOW() - INTERVAL '24 hours'
    );
END;
$$ LANGUAGE plpgsql;

-- Function to generate expiry alerts
CREATE OR REPLACE FUNCTION check_expiry_alerts()
RETURNS VOID AS $$
BEGIN
    -- Expiry warnings (30 days)
    INSERT INTO alerts (type, title, message, severity, product_id, batch_id)
    SELECT 
        'expiry_warning',
        'Expiry Warning',
        'Product ' || p.name || ' (Batch: ' || b.batch_number || ') will expire on ' || b.expiry_date || '.',
        'medium',
        b.product_id,
        b.id
    FROM batches b
    JOIN products p ON b.product_id = p.id
    WHERE b.expiry_date <= CURRENT_DATE + INTERVAL '30 days'
    AND b.expiry_date > CURRENT_DATE
    AND b.remaining_quantity > 0
    AND b.is_active = true
    AND NOT EXISTS (
        SELECT 1 FROM alerts a 
        WHERE a.batch_id = b.id 
        AND a.type = 'expiry_warning' 
        AND a.created_at > NOW() - INTERVAL '7 days'
    );

    -- Expired products
    INSERT INTO alerts (type, title, message, severity, product_id, batch_id)
    SELECT 
        'expired',
        'Product Expired',
        'Product ' || p.name || ' (Batch: ' || b.batch_number || ') has expired on ' || b.expiry_date || '.',
        'critical',
        b.product_id,
        b.id
    FROM batches b
    JOIN products p ON b.product_id = p.id
    WHERE b.expiry_date <= CURRENT_DATE
    AND b.remaining_quantity > 0
    AND b.is_active = true
    AND NOT EXISTS (
        SELECT 1 FROM alerts a 
        WHERE a.batch_id = b.id 
        AND a.type = 'expired' 
        AND a.created_at > NOW() - INTERVAL '1 day'
    );
END;
$$ LANGUAGE plpgsql;
