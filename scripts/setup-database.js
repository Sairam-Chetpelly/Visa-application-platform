// Database setup script
import mysql from "mysql2/promise"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  multipleStatements: true,
}

async function setupDatabase() {
  let connection

  try {
    console.log("🔌 Connecting to MySQL...")
    connection = await mysql.createConnection(dbConfig)
    console.log("✅ Connected to MySQL successfully!")

    // Create database if it doesn't exist
    console.log("🗄️  Creating database...")
    await connection.execute("CREATE DATABASE IF NOT EXISTS visa_management_system")
    console.log("✅ Database created/verified!")

    // Use the database
    await connection.execute("USE visa_management_system")

    // Read and execute schema
    console.log("📋 Setting up database schema...")
    const schemaPath = path.join(__dirname, "database-schema.sql")
    const schema = fs.readFileSync(schemaPath, "utf8")

    // Split schema into individual statements
    const statements = schema.split(";").filter((stmt) => stmt.trim().length > 0)

    for (const statement of statements) {
      if (statement.trim()) {
        await connection.execute(statement)
      }
    }
    console.log("✅ Database schema created!")

    // Read and execute seed data
    console.log("🌱 Seeding database with initial data...")
    const seedPath = path.join(__dirname, "seed-data.sql")
    const seedData = fs.readFileSync(seedPath, "utf8")

    // Split seed data into individual statements
    const seedStatements = seedData.split(";").filter((stmt) => stmt.trim().length > 0)

    for (const statement of seedStatements) {
      if (statement.trim()) {
        try {
          await connection.execute(statement)
        } catch (error) {
          // Ignore duplicate entry errors for seed data
          if (!error.message.includes("Duplicate entry")) {
            throw error
          }
        }
      }
    }
    console.log("✅ Database seeded with initial data!")

    // Verify setup
    console.log("🔍 Verifying database setup...")
    const [tables] = await connection.execute("SHOW TABLES")
    console.log(`✅ Found ${tables.length} tables:`)
    tables.forEach((table) => {
      console.log(`   - ${Object.values(table)[0]}`)
    })

    // Check for sample data
    const [users] = await connection.execute("SELECT COUNT(*) as count FROM users")
    const [countries] = await connection.execute("SELECT COUNT(*) as count FROM countries")
    console.log(`✅ Sample data: ${users[0].count} users, ${countries[0].count} countries`)

    console.log("\n🎉 Database setup completed successfully!")
    console.log("\n📝 Default login credentials:")
    console.log("   Admin: admin@visaflow.com / password123")
    console.log("   Employee: alice@visaflow.com / password123")
    console.log("   Customer: john.smith@email.com / password123")
  } catch (error) {
    console.error("❌ Database setup failed:", error.message)

    if (error.code === "ER_ACCESS_DENIED_ERROR") {
      console.log("\n💡 Database connection tips:")
      console.log("   1. Make sure MySQL is running")
      console.log("   2. Check your .env file has correct DB_PASSWORD")
      console.log("   3. Verify MySQL user has proper permissions")
      console.log("   4. Try connecting with: mysql -u root -p")
    }

    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

// Run setup if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase()
}

export { setupDatabase }
