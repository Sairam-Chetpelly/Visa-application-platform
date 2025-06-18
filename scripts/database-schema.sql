-- Create database
CREATE DATABASE IF NOT EXISTS visa_management_system;
USE visa_management_system;

-- Users table (for all user types)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    user_type ENUM('customer', 'employee', 'admin') NOT NULL,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Customer profiles
CREATE TABLE customer_profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    date_of_birth DATE,
    place_of_birth VARCHAR(100),
    nationality VARCHAR(50),
    gender ENUM('male', 'female', 'other'),
    marital_status ENUM('single', 'married', 'divorced', 'widowed'),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(50),
    passport_number VARCHAR(50),
    passport_issue_date DATE,
    passport_expiry_date DATE,
    passport_issue_place VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Employee profiles
CREATE TABLE employee_profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL,
    department VARCHAR(50),
    hire_date DATE,
    salary DECIMAL(10,2),
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Countries and visa types
CREATE TABLE countries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(3) NOT NULL,
    flag_emoji VARCHAR(10),
    processing_time_min INT DEFAULT 15,
    processing_time_max INT DEFAULT 30,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE visa_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    country_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    fee DECIMAL(10,2) NOT NULL,
    processing_time_days INT DEFAULT 30,
    required_documents JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (country_id) REFERENCES countries(id)
);

-- Visa applications
CREATE TABLE visa_applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_number VARCHAR(20) UNIQUE NOT NULL,
    customer_id INT NOT NULL,
    country_id INT NOT NULL,
    visa_type_id INT NOT NULL,
    status ENUM('draft', 'submitted', 'under_review', 'approved', 'rejected', 'resent') DEFAULT 'draft',
    priority ENUM('low', 'normal', 'high') DEFAULT 'normal',
    assigned_to INT,
    
    -- Travel Information
    purpose_of_visit TEXT,
    intended_arrival_date DATE,
    intended_departure_date DATE,
    accommodation_details TEXT,
    
    -- Employment Information
    occupation VARCHAR(100),
    employer VARCHAR(200),
    employer_address TEXT,
    monthly_income DECIMAL(10,2),
    
    -- Additional Information
    previous_visits TEXT,
    criminal_record BOOLEAN DEFAULT FALSE,
    medical_conditions TEXT,
    additional_info TEXT,
    
    -- Application tracking
    submitted_at TIMESTAMP NULL,
    reviewed_at TIMESTAMP NULL,
    approved_at TIMESTAMP NULL,
    rejection_reason TEXT,
    resend_reason TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (country_id) REFERENCES countries(id),
    FOREIGN KEY (visa_type_id) REFERENCES visa_types(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id)
);

-- Document uploads
CREATE TABLE application_documents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT NOT NULL,
    document_type ENUM('passport', 'photo', 'financial_docs', 'employment_letter', 'travel_itinerary', 'other') NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT,
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES visa_applications(id) ON DELETE CASCADE
);

-- Application status history
CREATE TABLE application_status_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by INT NOT NULL,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES visa_applications(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id)
);

-- Notifications
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    application_id INT,
    type ENUM('email', 'sms', 'system') NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (application_id) REFERENCES visa_applications(id) ON DELETE SET NULL
);

-- System settings
CREATE TABLE system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_by INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_type ON users(user_type);
CREATE INDEX idx_applications_customer ON visa_applications(customer_id);
CREATE INDEX idx_applications_status ON visa_applications(status);
CREATE INDEX idx_applications_assigned ON visa_applications(assigned_to);
CREATE INDEX idx_applications_number ON visa_applications(application_number);
CREATE INDEX idx_documents_application ON application_documents(application_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_status_history_application ON application_status_history(application_id);
