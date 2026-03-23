-- LifeCare Hospital Management System — Database Setup
-- Run this file to create the database and tables

CREATE DATABASE IF NOT EXISTS lifecare_hospital;
USE lifecare_hospital;

-- Users table (admins, doctors, patients)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'doctor', 'patient') NOT NULL,
    specialization VARCHAR(100) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    phone VARCHAR(20) NOT NULL,
    blood_group VARCHAR(5) NOT NULL,
    address VARCHAR(255) DEFAULT '',
    registered_by VARCHAR(20),
    date DATE NOT NULL,
    FOREIGN KEY (registered_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id VARCHAR(20) PRIMARY KEY,
    patient_id VARCHAR(20) NOT NULL,
    doctor_id VARCHAR(20) NOT NULL,
    date DATE NOT NULL,
    time VARCHAR(10) NOT NULL,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    notes TEXT DEFAULT NULL,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
    id VARCHAR(20) PRIMARY KEY,
    appointment_id VARCHAR(20) NOT NULL,
    diagnosis VARCHAR(255) NOT NULL,
    medicines TEXT NOT NULL,
    notes TEXT DEFAULT NULL,
    date DATE NOT NULL,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
);

-- Bills table
CREATE TABLE IF NOT EXISTS bills (
    id VARCHAR(20) PRIMARY KEY,
    patient_id VARCHAR(20) NOT NULL,
    total DECIMAL(10, 2) NOT NULL DEFAULT 0,
    date DATE NOT NULL,
    generated_by VARCHAR(20),
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Bill items table
CREATE TABLE IF NOT EXISTS bill_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bill_id VARCHAR(20) NOT NULL,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE
);

-- ==================== SEED DATA ====================

INSERT IGNORE INTO users (id, name, email, password, role, specialization) VALUES
('admin1', 'Dr. Sarah Mitchell', 'admin@hospital.com', 'admin123', 'admin', NULL),
('doc1', 'Dr. James Wilson', 'doctor@hospital.com', 'doctor123', 'doctor', 'Cardiology'),
('doc2', 'Dr. Emily Chen', 'emily@hospital.com', 'doctor123', 'doctor', 'Neurology'),
('pat1', 'John Smith', 'patient@hospital.com', 'patient123', 'patient', NULL);

INSERT IGNORE INTO patients (id, name, age, gender, phone, blood_group, address, registered_by, date) VALUES
('p1', 'John Smith', 45, 'Male', '555-0101', 'O+', '123 Oak Ave', 'admin1', '2026-03-20'),
('p2', 'Mary Johnson', 32, 'Female', '555-0102', 'A+', '456 Elm St', 'admin1', '2026-03-21'),
('p3', 'Robert Davis', 58, 'Male', '555-0103', 'B-', '789 Pine Rd', 'admin1', '2026-03-22');

INSERT IGNORE INTO appointments (id, patient_id, doctor_id, date, time, status, notes) VALUES
('a1', 'p1', 'doc1', '2026-03-24', '10:00', 'confirmed', 'Follow-up checkup'),
('a2', 'p2', 'doc2', '2026-03-25', '14:30', 'pending', 'Initial consultation');
