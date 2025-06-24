#!/bin/bash

# Fresh Migration Script for Visa Application Platform
# This script will create a completely fresh database with sample data

echo "🚀 Visa Application Platform - Fresh Migration"
echo "=============================================="
echo ""
echo "This will:"
echo "  ✅ Clear all existing data"
echo "  ✅ Create fresh database schema"
echo "  ✅ Insert sample countries and visa types"
echo "  ✅ Create admin, employee, and customer accounts"
echo "  ✅ Generate sample applications"
echo "  ✅ Set up system settings"
echo ""

# Check if MongoDB is running
echo "🔍 Checking MongoDB connection..."
if ! mongosh --eval "db.runCommand('ping')" --quiet > /dev/null 2>&1; then
    echo "❌ MongoDB is not running or not accessible"
    echo "💡 Please start MongoDB first:"
    echo "   sudo systemctl start mongod"
    echo "   # or"
    echo "   brew services start mongodb/brew/mongodb-community"
    exit 1
fi

echo "✅ MongoDB is running"
echo ""

# Ask for confirmation
read -p "⚠️  This will DELETE all existing data. Continue? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Migration cancelled"
    exit 1
fi

echo ""
echo "🚀 Starting fresh migration..."
echo ""

# Run the migration
node run-migration.js

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Migration completed successfully!"
    echo ""
    echo "🚀 Next steps:"
    echo "  1. Start the backend server: npm run server"
    echo "  2. Start the frontend: npm run dev"
    echo "  3. Open http://localhost:3000 in your browser"
    echo ""
    echo "📝 Login with:"
    echo "  Admin: admin@visaflow.com / admin123"
    echo "  Employee: alice.johnson@visaflow.com / employee123"
    echo "  Customer: john.smith@email.com / customer123"
else
    echo ""
    echo "❌ Migration failed!"
    echo "Please check the error messages above and try again."
    exit 1
fi