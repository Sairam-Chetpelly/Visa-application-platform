#!/usr/bin/env node

// Test script for password reset functionality
const API_BASE_URL = "http://localhost:3001/api"

async function testPasswordReset() {
  console.log("🧪 Testing Password Reset Functionality")
  console.log("=====================================")

  try {
    // Test 1: Forgot Password
    console.log("\n1. Testing Forgot Password...")
    const forgotResponse = await fetch(`${API_BASE_URL}/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "test@example.com" // Use a test email
      }),
    })

    if (forgotResponse.ok) {
      const forgotData = await forgotResponse.json()
      console.log("✅ Forgot Password endpoint working:", forgotData.message)
    } else {
      const error = await forgotResponse.json()
      console.log("❌ Forgot Password failed:", error.error)
    }

    // Test 2: Health Check
    console.log("\n2. Testing Server Health...")
    const healthResponse = await fetch(`${API_BASE_URL}/health`)
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json()
      console.log("✅ Server is healthy:", healthData.status)
      console.log("📊 Database:", healthData.database)
      console.log("📈 Data counts:", healthData.data)
    } else {
      console.log("❌ Server health check failed")
    }

    // Test 3: Countries endpoint
    console.log("\n3. Testing Countries endpoint...")
    const countriesResponse = await fetch(`${API_BASE_URL}/countries`)
    
    if (countriesResponse.ok) {
      const countries = await countriesResponse.json()
      console.log(`✅ Countries endpoint working: ${countries.length} countries found`)
    } else {
      const error = await countriesResponse.json()
      console.log("❌ Countries endpoint failed:", error.error)
    }

  } catch (error) {
    console.error("❌ Network Error:", error.message)
    console.log("\n💡 Make sure the backend server is running:")
    console.log("   cd /home/sairam/Desktop/Visa-application-platform")
    console.log("   node scripts/backend-server.js")
  }

  console.log("\n🏁 Test completed!")
}

// Run the test
testPasswordReset()