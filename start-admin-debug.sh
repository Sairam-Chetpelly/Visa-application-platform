#!/bin/bash

# Admin Dashboard Debug Script
# This script helps debug admin dashboard issues

echo "🔧 Admin Dashboard Debug Script"
echo "================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

echo "✅ npm version: $(npm --version)"

# Check if MongoDB is running
if command -v mongosh &> /dev/null; then
    echo "🔍 Checking MongoDB connection..."
    if mongosh --eval "db.adminCommand('ping')" --quiet > /dev/null 2>&1; then
        echo "✅ MongoDB is running"
    else
        echo "❌ MongoDB is not running or not accessible"
        echo "💡 Start MongoDB with: sudo systemctl start mongod"
    fi
else
    echo "⚠️  MongoDB shell (mongosh) not found - cannot check MongoDB status"
fi

# Check if .env file exists
if [ -f ".env" ]; then
    echo "✅ .env file found"
    
    # Check for required environment variables
    if grep -q "MONGODB_URI" .env; then
        echo "✅ MONGODB_URI configured"
    else
        echo "⚠️  MONGODB_URI not found in .env"
    fi
    
    if grep -q "JWT_SECRET" .env; then
        echo "✅ JWT_SECRET configured"
    else
        echo "⚠️  JWT_SECRET not found in .env"
    fi
else
    echo "❌ .env file not found"
    echo "💡 Copy .env.example to .env and configure it"
fi

# Check if dependencies are installed
if [ -d "node_modules" ]; then
    echo "✅ Dependencies installed"
else
    echo "❌ Dependencies not installed"
    echo "💡 Run: npm install"
    exit 1
fi

# Check if backend server is running
echo "🔍 Checking backend server..."
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ Backend server is running"
    
    # Test admin login
    echo "🔍 Testing admin login..."
    RESPONSE=$(curl -s -X POST http://localhost:3001/api/login \
        -H "Content-Type: application/json" \
        -d '{"email":"admin@visaflow.com","password":"admin123"}')
    
    if echo "$RESPONSE" | grep -q "token"; then
        echo "✅ Admin login successful"
    else
        echo "❌ Admin login failed"
        echo "Response: $RESPONSE"
        echo "💡 Run: npm run setup:mongodb to create admin user"
    fi
else
    echo "❌ Backend server is not running"
    echo "💡 Start backend server with: npm run dev:server"
    echo ""
    echo "🚀 Starting backend server..."
    
    # Start backend server in background
    npm run dev:server &
    BACKEND_PID=$!
    
    echo "⏳ Waiting for backend server to start..."
    sleep 5
    
    # Check again
    if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
        echo "✅ Backend server started successfully"
    else
        echo "❌ Failed to start backend server"
        kill $BACKEND_PID 2>/dev/null
        exit 1
    fi
fi

# Check if frontend is running
echo "🔍 Checking frontend server..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend server is running"
    echo ""
    echo "🎉 All systems ready!"
    echo "📱 Admin Dashboard: http://localhost:3000/admin-dashboard"
    echo "🔑 Login: admin@visaflow.com / admin123"
else
    echo "❌ Frontend server is not running"
    echo "💡 Start frontend server with: npm run dev"
    echo ""
    echo "🚀 Starting frontend server..."
    npm run dev
fi