#!/usr/bin/env node

/**
 * Test Admin API Endpoints
 * 
 * This script tests the admin dashboard API endpoints to ensure they work correctly.
 */

import fetch from 'node-fetch'
import dotenv from 'dotenv'

dotenv.config()

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

async function testAdminAPI() {
  try {
    console.log('🧪 Testing Admin API Endpoints...\n')
    console.log(`API Base URL: ${API_BASE_URL}\n`)

    // Test 1: Health check
    console.log('1. Testing health endpoint...')
    try {
      const healthResponse = await fetch(`${API_BASE_URL}/health`)
      if (healthResponse.ok) {
        const healthData = await healthResponse.json()
        console.log('✅ Health check passed:', healthData.status)
      } else {
        console.log('❌ Health check failed:', healthResponse.status)
      }
    } catch (error) {
      console.log('❌ Health check error:', error.message)
      console.log('💡 Make sure the backend server is running: npm run dev:server')
      return
    }

    // Test 2: Login as admin
    console.log('\n2. Testing admin login...')
    let adminToken = null
    try {
      const loginResponse = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'admin@visaflow.com',
          password: 'password123'
        })
      })

      if (loginResponse.ok) {
        const loginData = await loginResponse.json()
        adminToken = loginData.token
        console.log('✅ Admin login successful')
        console.log(`   User: ${loginData.user.firstName} ${loginData.user.lastName}`)
        console.log(`   Type: ${loginData.user.userType}`)
      } else {
        const errorData = await loginResponse.json()
        console.log('❌ Admin login failed:', errorData.error)
        return
      }
    } catch (error) {
      console.log('❌ Admin login error:', error.message)
      return
    }

    if (!adminToken) {
      console.log('❌ No admin token received')
      return
    }

    // Test 3: Test admin endpoints
    const endpoints = [
      { name: 'Dashboard Stats', url: '/dashboard/stats' },
      { name: 'Applications', url: '/applications' },
      { name: 'Employees', url: '/employees' },
      { name: 'Customers', url: '/customers' },
      { name: 'Payments', url: '/payments' }
    ]

    console.log('\n3. Testing admin endpoints...')
    for (const endpoint of endpoints) {
      try {
        console.log(`   Testing ${endpoint.name}...`)
        const response = await fetch(`${API_BASE_URL}${endpoint.url}`, {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          const count = Array.isArray(data) ? data.length : 'N/A'
          console.log(`   ✅ ${endpoint.name}: ${count} items`)
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
          console.log(`   ❌ ${endpoint.name}: ${response.status} - ${errorData.error}`)
        }
      } catch (error) {
        console.log(`   ❌ ${endpoint.name}: ${error.message}`)
      }
    }

    console.log('\n🎉 Admin API test completed!')
    
    console.log('\n📋 Next Steps:')
    console.log('   1. If any endpoints failed, check the backend server logs')
    console.log('   2. Make sure MongoDB is running and populated with data')
    console.log('   3. Run: npm run setup:mongodb to populate test data')
    console.log('   4. Check the admin dashboard at: http://localhost:3000/admin-dashboard')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Troubleshooting Tips:')
      console.log('   1. Make sure the backend server is running: npm run dev:server')
      console.log('   2. Check if the server is running on port 3001')
      console.log('   3. Verify the API_BASE_URL in .env file')
    }
    
    process.exit(1)
  }
}

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testAdminAPI()
}

export { testAdminAPI }