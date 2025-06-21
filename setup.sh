#!/bin/bash

echo "🚀 Setting up Visa Application Platform..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed. Please install MySQL first."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🔧 Setting up environment variables..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file from .env.example"
    echo "⚠️  Please update the .env file with your actual values:"
    echo "   - Database password"
    echo "   - JWT secret"
    echo "   - Razorpay keys"
    echo "   - Email credentials (optional)"
    echo ""
    read -p "Press Enter to continue after updating .env file..."
fi

echo "🗄️  Setting up database..."
npm run setup-db

echo "🎉 Setup complete!"
echo ""
echo "To start the application:"
echo "1. Start the backend server: npm run server:dev"
echo "2. In another terminal, start the frontend: npm run dev"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "Default login credentials:"
echo "- Admin: admin@visaflow.com / password123"
echo "- Employee: alice@visaflow.com / password123"
echo "- Customer: john.smith@email.com / password123"