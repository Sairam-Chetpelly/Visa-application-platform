#!/bin/bash

echo "🚀 Starting VisaFlow Backend Server"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Starting MongoDB..."
    # Try to start MongoDB (adjust path as needed)
    if command -v brew &> /dev/null; then
        brew services start mongodb-community
    elif command -v systemctl &> /dev/null; then
        sudo systemctl start mongod
    else
        echo "❌ Please start MongoDB manually"
        exit 1
    fi
fi

# Navigate to project directory
cd "$(dirname "$0")"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please create one based on .env.example"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the backend server
echo "🔥 Starting backend server on port 3001..."
echo "📧 Email service configured for password reset"
echo "💳 Payment gateway configured"
echo ""
echo "🌐 API Health Check: http://localhost:3001/api/health"
echo "📚 API Base URL: http://localhost:3001/api"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

node scripts/backend-server.js