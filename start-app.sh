#!/bin/bash

echo "🚀 Starting Visa Application Platform..."

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "❌ MongoDB is not running. Please start MongoDB first:"
    echo "   sudo systemctl start mongod"
    echo "   or"
    echo "   brew services start mongodb-community"
    exit 1
fi

echo "✅ MongoDB is running"

# Check if database is set up
echo "🔍 Checking database setup..."
if ! npm run verify-db > /dev/null 2>&1; then
    echo "⚠️  Database not set up. Setting up now..."
    npm run setup-db
fi

echo "✅ Database is ready"

# Start the backend server in background
echo "🖥️  Starting backend server..."
npm run server &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Test the API
echo "🧪 Testing API..."
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "✅ Backend API is running"
else
    echo "❌ Backend API failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Start the frontend
echo "🌐 Starting frontend..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "🎉 Application started successfully!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:3001"
echo "🏥 Health Check: http://localhost:3001/api/health"
echo ""
echo "📝 Default login credentials:"
echo "   Admin: admin@visaflow.com / password123"
echo "   Employee: alice@visaflow.com / password123"
echo "   Customer: john.smith@email.com / password123"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Services stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for processes
wait