#!/bin/bash

echo "🚀 Starting VisaFlow Development Environment..."

# Check if MongoDB is running
echo "📊 Checking MongoDB..."
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Starting MongoDB..."
    sudo systemctl start mongod 2>/dev/null || brew services start mongodb-community 2>/dev/null || echo "Please start MongoDB manually"
else
    echo "✅ MongoDB is running"
fi

# Setup database if needed
echo "🗄️  Setting up database..."
cd scripts
node setup-mongodb.js

# Start backend server in background
echo "🔧 Starting backend server..."
node backend-server.js &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Test backend
echo "🧪 Testing backend..."
cd ..
node test-backend.js

# Start frontend
echo "🎨 Starting frontend..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "🎉 Development environment started!"
echo ""
echo "📋 URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo "   Health:   http://localhost:3001/api/health"
echo ""
echo "👤 Test Accounts:"
echo "   Admin:    admin@visaflow.com / password123"
echo "   Employee: alice@visaflow.com / password123"
echo "   Customer: john.smith@email.com / password123"
echo ""
echo "🛠️  Troubleshooting:"
echo "   - Check browser console for errors"
echo "   - Run: node debug-payment.js"
echo "   - See: PAYMENT_TROUBLESHOOTING.md"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for user to stop
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait