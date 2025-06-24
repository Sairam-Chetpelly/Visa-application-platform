#!/bin/bash

echo "🌱 Seeding Countries and Visa Types to MongoDB..."
echo "================================================"

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB doesn't appear to be running. Please start MongoDB first."
    echo "   You can start it with: sudo systemctl start mongod"
    echo "   Or if using Docker: docker run -d -p 27017:27017 mongo"
fi

# Run the seed script
echo "🚀 Running seed script..."
cd "$(dirname "$0")"
node scripts/seed-countries-mongodb.js

echo "✅ Seed process completed!"
echo ""
echo "🔍 You can now test the dynamic continents feature:"
echo "   1. Start the backend: npm run start:backend"
echo "   2. Start the frontend: npm run dev"
echo "   3. Visit http://localhost:3000"
echo ""
echo "📡 API endpoints available:"
echo "   - GET /api/continents - Get unique continents"
echo "   - GET /api/countries - Get all countries with visa types"