# Visa Application Management System

A comprehensive platform for managing customer visa applications and processing. This system allows customers to submit visa applications, employees to review and process them, and administrators to manage the entire system.

![Visa Application Management System](https://placeholder.svg?height=400&width=800)

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Setup Guide](#setup-guide)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [User Roles](#user-roles)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Customer Features
- User registration and login
- Dynamic visa application forms based on country
- Document upload functionality
- Application status tracking
- Email and SMS notifications
- Historical data of previous applications

### Employee Features
- Application review and processing
- Approve, reject, or request modifications
- Dashboard with application statistics
- Search and filter applications

### Admin Features
- Employee management (create, edit, delete)
- System-wide statistics and reports
- Application oversight
- Configuration management

## 🛠️ Technology Stack

- **Frontend**: React.js with Next.js
- **Backend**: Node.js with Express
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Email**: Nodemailer
- **SMS**: Twilio

## 🚀 Setup Guide

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MySQL (v8.0 or higher)

### Environment Variables

Create a `.env.local` file in the root directory for frontend environment variables:

\`\`\`
NEXT_PUBLIC_API_URL=http://localhost:3001/api
\`\`\`

Create a `.env` file in the root directory for backend environment variables:

\`\`\`
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=visa_management_system

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Twilio SMS Configuration
TWILIO_SID=your-twilio-sid
TWILIO_TOKEN=your-twilio-token
TWILIO_PHONE=+1234567890

# Server Configuration
PORT=3001
NODE_ENV=development
\`\`\`

### Database Setup

1. Create a MySQL database:

\`\`\`sql
CREATE DATABASE visa_management_system;
\`\`\`

2. Run the database schema script:

\`\`\`bash
mysql -u root -p visa_management_system < scripts/database-schema.sql
\`\`\`

3. Seed the database with initial data:

\`\`\`bash
mysql -u root -p visa_management_system < scripts/seed-data.sql
\`\`\`

### Installation

1. Clone the repository:

\`\`\`bash
git clone https://github.com/yourusername/visa-application-system.git
cd visa-application-system
\`\`\`

2. Install dependencies:

\`\`\`bash
npm install
\`\`\`

### Running the Application

1. Start the backend server:

\`\`\`bash
npm run server
\`\`\`

2. In a separate terminal, start the frontend development server:

\`\`\`bash
npm run dev
\`\`\`

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api

## 👥 User Roles

### Customer
- Email: john.smith@email.com
- Password: password123
- Access: Customer dashboard, application forms

### Employee
- Email: alice@visaflow.com
- Password: password123
- Access: Employee dashboard, application processing

### Admin
- Email: admin@visaflow.com
- Password: password123
- Access: Admin dashboard, employee management, reports

## 📁 Project Structure

\`\`\`
visa-application-system/
├── app/                    # Next.js pages and components
│   ├── admin-dashboard/    # Admin dashboard
│   ├── customer-dashboard/ # Customer dashboard
│   ├── employee-dashboard/ # Employee dashboard
│   ├── login/              # Login page
│   ├── register/           # Registration page
│   ├── new-application/    # New application page
│   ├── application-form/   # Application form
│   └── page.tsx            # Landing page
├── components/             # Reusable UI components
│   └── ui/                 # shadcn/ui components
├── hooks/                  # Custom React hooks
│   ├── useAuth.ts          # Authentication hook
│   └── useMobile.tsx       # Mobile detection hook
├── lib/                    # Utility functions
│   ├── api.ts              # API client
│   └── utils.ts            # Helper functions
├── scripts/                # Backend scripts
│   ├── backend-server.js   # Express server
│   ├── database-schema.sql # Database schema
│   └── seed-data.sql       # Sample data
├── public/                 # Static assets
├── .env.example            # Example environment variables
├── .env.local              # Frontend environment variables
├── .env                    # Backend environment variables
├── package.json            # Project dependencies
└── README.md               # Project documentation
\`\`\`

## 🔌 API Endpoints

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - Login and get JWT token

### Countries and Visa Types
- `GET /api/countries` - Get all countries and visa types

### Applications
- `GET /api/applications` - Get user applications
- `POST /api/applications` - Create a new application
- `POST /api/applications/:id/submit` - Submit an application
- `POST /api/applications/:id/status` - Update application status
- `POST /api/applications/:id/documents` - Upload documents

### Employee Management
- `POST /api/employees` - Create a new employee

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
