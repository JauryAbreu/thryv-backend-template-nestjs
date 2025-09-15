-- Initialize PostgreSQL database for Thryv Backend
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    identification VARCHAR(25) UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    lastname VARCHAR(50) NOT NULL,
    "dateBorn" DATE NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')) NOT NULL,
    status VARCHAR(10) CHECK (status IN ('active', 'pending', 'inactive')) DEFAULT 'pending',
    "createDate" TIMESTAMPTZ DEFAULT NOW(),
    "updateDate" TIMESTAMPTZ DEFAULT NOW(),
    "deletedAt" TIMESTAMPTZ NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_customers_identification ON customers(identification);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_create_date ON customers("createDate");
CREATE INDEX IF NOT EXISTS idx_customers_deleted_at ON customers("deletedAt");

-- Create trigger to update updateDate automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updateDate" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO customers (identification, name, lastname, "dateBorn", gender, status) VALUES
('12345678901', 'John', 'Doe', '1990-01-15', 'male', 'active'),
('23456789012', 'Jane', 'Smith', '1985-03-20', 'female', 'active'),
('34567890123', 'Bob', 'Johnson', '1992-07-10', 'male', 'pending'),
('45678901234', 'Alice', 'Williams', '1988-12-05', 'female', 'active'),
('56789012345', 'Charlie', 'Brown', '1995-09-30', 'other', 'inactive')
ON CONFLICT (identification) DO NOTHING;
