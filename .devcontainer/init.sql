-- Initialize the database with any required extensions or initial setup
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create any initial schemas or configurations here if needed
-- This file is executed when the PostgreSQL container starts for the first time

-- Example: Create a test user (optional)
-- CREATE USER test_user WITH PASSWORD 'test_password';
-- GRANT ALL PRIVILEGES ON DATABASE finance_tracker_dev TO test_user;