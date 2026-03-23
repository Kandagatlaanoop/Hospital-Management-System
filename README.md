# LifeCare Hospital Management System ❤️‍🩹

A full-stack web application designed for managing hospital operations efficiently. Built with **Bootstrap 5**, **Node.js/Express**, and **MySQL**.

## ✨ Features

- **Role-based Access Control**: Distinct interfaces for Admin, Doctor, and Patient roles.
- **Interactive Dashboard**: Real-time statistics, quick action links, and recent appointments table.
- **Patient Management**: Full CRUD capabilities for registering, editing, viewing, and removing patients. Cascading deletes ensure data integrity.
- **Appointment Booking**: Schedule, confirm, cancel, and delete appointments effortlessly.
- **Doctor Consultations**: Doctors can manage their active appointments, record diagnoses, write prescriptions, and save consultation notes.
- **Billing & Invoices**: Generate comprehensive, itemized bills for patients. Includes a built-in print layout for professional invoices.
- **Reports & Analytics**: Visual bar charts breakdown appointment statuses, and tables track individual doctor performance.
- **Security**: Personal profile management with immediate password change requirements.

## 🛠️ Technology Stack

- **Frontend**: HTML5, Vanilla JavaScript (ES6+), Bootstrap 5, Custom CSS with Glassmorphism Dark Theme.
- **Backend**: Node.js, Express.js.
- **Database**: MySQL (with `mysql2` robust connection pooling).
- **Architecture**: Single Page Application (SPA) powered by a fully RESTful JSON API.

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v14 or higher)
- [MySQL Server](https://dev.mysql.com/downloads/) (v8.0 or higher)

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Kandagatlaanoop/Hospital-Management-System.git
   cd Hospital-Management-System
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Set up the MySQL Database:**
   - Execute the provided `database.sql` script to create the `lifecare_hospital` database, configure the table schema, and insert seed data:
     ```bash
     mysql -u root -p < database.sql
     ```
   - **Important**: Open `server.js` and verify that the database connection `password` matches your local MySQL root password.

4. **Start the Express Server:**
   ```bash
   node server.js
   ```

5. **Access the Application:**
   Open your browser and navigate to:
   [http://localhost:3000](http://localhost:3000)

---

### 🔑 Demo Credentials (included in seed data)

- **Admin Account**: `admin@hospital.com` | Password: `admin123`
- **Doctor Account**: `doctor@hospital.com` | Password: `doctor123`
- **Patient Account**: `patient@hospital.com` | Password: `patient123`

---

*Developed with ❤️ as a comprehensive solution for healthcare administration.*
