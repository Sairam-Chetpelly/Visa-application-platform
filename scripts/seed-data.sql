-- Insert sample countries
INSERT INTO countries (name, code, flag_emoji, processing_time_min, processing_time_max) VALUES
('United States', 'USA', '🇺🇸', 15, 30),
('Canada', 'CAN', '🇨🇦', 20, 40),
('United Kingdom', 'GBR', '🇬🇧', 15, 25),
('Australia', 'AUS', '🇦🇺', 20, 35),
('Germany', 'DEU', '🇩🇪', 15, 30),
('France', 'FRA', '🇫🇷', 15, 30);

-- Insert visa types for each country
INSERT INTO visa_types (country_id, name, description, fee, processing_time_days, required_documents) VALUES
-- USA visa types
(1, 'Tourist', 'B-2 Tourist/Visitor Visa', 160.00, 21, '["passport", "photo", "financial_docs", "travel_itinerary"]'),
(1, 'Business', 'B-1 Business Visa', 160.00, 21, '["passport", "photo", "financial_docs", "employment_letter"]'),
(1, 'Student', 'F-1 Student Visa', 350.00, 30, '["passport", "photo", "financial_docs", "i20_form", "sevis_receipt"]'),
(1, 'Work', 'H-1B Work Visa', 460.00, 45, '["passport", "photo", "employment_letter", "labor_certification"]'),

-- Canada visa types
(2, 'Tourist', 'Temporary Resident Visa', 100.00, 30, '["passport", "photo", "financial_docs", "travel_itinerary"]'),
(2, 'Business', 'Business Visitor Visa', 100.00, 30, '["passport", "photo", "financial_docs", "employment_letter"]'),
(2, 'Student', 'Study Permit', 150.00, 35, '["passport", "photo", "financial_docs", "acceptance_letter"]'),
(2, 'Work', 'Work Permit', 155.00, 40, '["passport", "photo", "employment_letter", "lmia"]'),

-- UK visa types
(3, 'Tourist', 'Standard Visitor Visa', 95.00, 21, '["passport", "photo", "financial_docs", "accommodation_proof"]'),
(3, 'Business', 'Business Visitor Visa', 95.00, 21, '["passport", "photo", "financial_docs", "employment_letter"]'),
(3, 'Student', 'Student Visa', 348.00, 28, '["passport", "photo", "financial_docs", "cas_letter"]'),
(3, 'Work', 'Skilled Worker Visa', 610.00, 35, '["passport", "photo", "employment_letter", "sponsorship_certificate"]');

-- Insert admin user
INSERT INTO users (email, password_hash, first_name, last_name, phone, user_type, status) VALUES
('admin@visaflow.com', '$2b$10$rQZ8kHp0rQZ8kHp0rQZ8kO', 'System', 'Administrator', '+1234567890', 'admin', 'active');

-- Insert sample employees
INSERT INTO users (email, password_hash, first_name, last_name, phone, user_type, status) VALUES
('alice@visaflow.com', '$2b$10$rQZ8kHp0rQZ8kHp0rQZ8kO', 'Alice', 'Johnson', '+1234567891', 'employee', 'active'),
('bob@visaflow.com', '$2b$10$rQZ8kHp0rQZ8kHp0rQZ8kO', 'Bob', 'Wilson', '+1234567892', 'employee', 'active'),
('carol@visaflow.com', '$2b$10$rQZ8kHp0rQZ8kHp0rQZ8kO', 'Carol', 'Davis', '+1234567893', 'employee', 'inactive');

-- Insert employee profiles
INSERT INTO employee_profiles (user_id, employee_id, role, department, hire_date, created_by) VALUES
(2, 'EMP001', 'Senior Processor', 'Visa Processing', '2023-06-15', 1),
(3, 'EMP002', 'Processor', 'Visa Processing', '2023-08-20', 1),
(4, 'EMP003', 'Junior Processor', 'Visa Processing', '2023-11-10', 1);

-- Insert sample customers
INSERT INTO users (email, password_hash, first_name, last_name, phone, user_type, status) VALUES
('john.smith@email.com', '$2b$10$rQZ8kHp0rQZ8kHp0rQZ8kO', 'John', 'Smith', '+1234567894', 'customer', 'active'),
('sarah.johnson@email.com', '$2b$10$rQZ8kHp0rQZ8kHp0rQZ8kO', 'Sarah', 'Johnson', '+1234567895', 'customer', 'active'),
('mike.davis@email.com', '$2b$10$rQZ8kHp0rQZ8kHp0rQZ8kO', 'Mike', 'Davis', '+1234567896', 'customer', 'active');

-- Insert customer profiles
INSERT INTO customer_profiles (user_id, date_of_birth, nationality, gender, address, city, country, passport_number, passport_expiry_date) VALUES
(5, '1985-03-15', 'Indian', 'male', '123 Main St', 'Mumbai', 'India', 'P1234567', '2025-03-15'),
(6, '1990-07-22', 'Canadian', 'female', '456 Oak Ave', 'Toronto', 'Canada', 'C7654321', '2026-07-22'),
(7, '1988-11-08', 'British', 'male', '789 Pine Rd', 'London', 'United Kingdom', 'B9876543', '2025-11-08');

-- Insert sample applications
INSERT INTO visa_applications (application_number, customer_id, country_id, visa_type_id, status, priority, assigned_to, purpose_of_visit, intended_arrival_date, intended_departure_date, submitted_at) VALUES
('APP001', 5, 1, 1, 'under_review', 'normal', 2, 'Tourism and sightseeing', '2024-03-15', '2024-03-30', '2024-01-15 10:30:00'),
('APP002', 6, 2, 2, 'approved', 'high', 3, 'Business meetings and conferences', '2024-02-20', '2024-02-28', '2024-01-18 14:20:00'),
('APP003', 7, 3, 3, 'under_review', 'normal', 2, 'University studies', '2024-09-01', '2025-06-30', '2024-01-20 09:15:00');

-- Insert system settings
INSERT INTO system_settings (setting_key, setting_value, description, updated_by) VALUES
('email_notifications_enabled', 'true', 'Enable email notifications for application updates', 1),
('sms_notifications_enabled', 'true', 'Enable SMS notifications for application updates', 1),
('max_file_upload_size', '5242880', 'Maximum file upload size in bytes (5MB)', 1),
('application_auto_assign', 'true', 'Automatically assign applications to available employees', 1),
('passport_expiry_warning_days', '180', 'Days before passport expiry to send warning', 1);
