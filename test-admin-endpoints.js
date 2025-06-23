#!/usr/bin/env node

/**
 * Test Admin Dashboard Endpoints
 * 
 * This script tests all the admin dashboard endpoints to ensure they're working correctly.
 */

import fetch from 'node-fetch'
import dotenv from 'dotenv'

dotenv.config()

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

async function testAdminEndpoints() {
  try {
    console.log('🧪 Testing Admin Dashboard Endpoints...\n')

    // First, login as admin to get a token
    console.log('1. Logging in as admin...')
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

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`)
    }

    const loginData = await loginResponse.json()
    console.log('✅ Login successful')
    console.log(`   User: ${loginData.user.firstName} ${loginData.user.lastName}`)
    console.log(`   Role: ${loginData.user.userType}`)

    const token = loginData.token

    // Test endpoints
    const endpoints = [
      { name: 'Dashboard Stats', url: '/dashboard/stats' },
      { name: 'Applications', url: '/applications' },
      { name: 'Employees', url: '/employees' },
      { name: 'Customers', url: '/customers' },
      { name: 'Payments', url: '/payments' },
      { name: 'Countries', url: '/countries' }
    ]

    console.log('\n2. Testing endpoints...')
    console.log('─'.repeat(50))

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${API_BASE_URL}${endpoint.url}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          const count = Array.isArray(data) ? data.length : 'N/A'
          console.log(`✅ ${endpoint.name.padEnd(20)}: ${response.status} (${count} items)`)
        } else {
          console.log(`❌ ${endpoint.name.padEnd(20)}: ${response.status} - ${response.statusText}`)
        }
      } catch (error) {
        console.log(`❌ ${endpoint.name.padEnd(20)}: Error - ${error.message}`)
      }
    }

    console.log('\n3. Testing specific data...')
    console.log('─'.repeat(50))

    // Test dashboard stats specifically
    try {
      const statsResponse = await fetch(`${API_BASE_URL}/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (statsResponse.ok) {
        const stats = await statsResponse.json()
        console.log('📊 Dashboard Stats:')
        console.log(`   Total Applications: ${stats.totalApplications || 0}`)
        console.log(`   Total Customers: ${stats.totalCustomers || 0}`)
        console.log(`   Active Employees: ${stats.activeEmployees || 0}`)
        console.log(`   Total Revenue: $${stats.totalRevenue || 0}`)
        console.log(`   Total Payments: ${stats.totalPayments || 0}`)
      }
    } catch (error) {
      console.log(`❌ Stats test failed: ${error.message}`)
    }

    // Test employees endpoint specifically
    try {
      const employeesResponse = await fetch(`${API_BASE_URL}/employees`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (employeesResponse.ok) {
        const employees = await employeesResponse.json()
        console.log(`\n👥 Employees (${employees.length}):`)
        employees.slice(0, 3).forEach(emp => {
          console.log(`   - ${emp.firstName} ${emp.lastName} (${emp.role || 'No role'}) - ${emp.status}`)
        })
      }
    } catch (error) {
      console.log(`❌ Employees test failed: ${error.message}`)
    }

    // Test customers endpoint specifically
    try {
      const customersResponse = await fetch(`${API_BASE_URL}/customers`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (customersResponse.ok) {
        const customers = await customersResponse.json()
        console.log(`\n👤 Customers (${customers.length}):`)
        customers.slice(0, 3).forEach(customer => {
          console.log(`   - ${customer.firstName} ${customer.lastName} (${customer.email}) - ${customer.status}`)
        })
      }
    } catch (error) {
      console.log(`❌ Customers test failed: ${error.message}`)
    }

    console.log('\n🎉 Admin endpoints test completed!')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Troubleshooting Tips:')
      console.log('   1. Make sure the backend server is running: npm run dev:server')
      console.log('   2. Check if MongoDB is running')
      console.log('   3. Verify the API_BASE_URL in .env file')
      console.log('   4. Run: npm run setup:mongodb to seed data')
    }
    
    process.exit(1)
  }
}

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testAdminEndpoints()
}

export { testAdminEndpoints }