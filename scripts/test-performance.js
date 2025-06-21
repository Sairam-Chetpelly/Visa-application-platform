#!/usr/bin/env node

/**
 * Test Employee Performance Endpoint
 * 
 * This script tests the employee performance API endpoint
 * to ensure it returns actual data.
 */

import fetch from 'node-fetch'
import dotenv from 'dotenv'

dotenv.config()

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

async function testEmployeePerformance() {
  try {
    console.log('🧪 Testing Employee Performance Endpoint...\n')

    // First, login as an employee to get a token
    console.log('1. Logging in as employee...')
    const loginResponse = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'alice@visaflow.com',
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

    // Test performance endpoint
    console.log('\n2. Fetching performance data...')
    const performanceResponse = await fetch(`${API_BASE_URL}/employee/performance`, {
      headers: {
        'Authorization': `Bearer ${loginData.token}`
      }
    })

    if (!performanceResponse.ok) {
      throw new Error(`Performance API failed: ${performanceResponse.status}`)
    }

    const performanceData = await performanceResponse.json()
    console.log('✅ Performance data retrieved successfully')
    
    console.log('\n📊 Performance Metrics:')
    console.log('─'.repeat(40))
    console.log(`Total Processed: ${performanceData.totalProcessed}`)
    console.log(`Approved: ${performanceData.approvedCount}`)
    console.log(`Rejected: ${performanceData.rejectedCount}`)
    console.log(`Current Assignments: ${performanceData.currentAssignments}`)
    console.log(`Recent Processed (30 days): ${performanceData.recentProcessed}`)
    console.log(`Approval Rate: ${performanceData.approvalRate}%`)
    console.log(`Avg Processing Time: ${performanceData.avgProcessingTime} days`)
    
    if (performanceData.role) {
      console.log(`Role: ${performanceData.role}`)
    }
    if (performanceData.employeeId) {
      console.log(`Employee ID: ${performanceData.employeeId}`)
    }
    if (performanceData.totalAssigned) {
      console.log(`Total Assigned: ${performanceData.totalAssigned}`)
    }
    if (performanceData.pendingReview) {
      console.log(`Pending Review: ${performanceData.pendingReview}`)
    }
    if (performanceData.completedToday) {
      console.log(`Completed Today: ${performanceData.completedToday}`)
    }

    console.log('\n🎉 Test completed successfully!')
    
    // Test with another employee
    console.log('\n3. Testing with second employee...')
    const login2Response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'bob@visaflow.com',
        password: 'password123'
      })
    })

    if (login2Response.ok) {
      const login2Data = await login2Response.json()
      console.log(`✅ Login successful for ${login2Data.user.firstName}`)
      
      const performance2Response = await fetch(`${API_BASE_URL}/employee/performance`, {
        headers: {
          'Authorization': `Bearer ${login2Data.token}`
        }
      })

      if (performance2Response.ok) {
        const performance2Data = await performance2Response.json()
        console.log(`📊 ${login2Data.user.firstName}'s Performance:`)
        console.log(`   Total Processed: ${performance2Data.totalProcessed}`)
        console.log(`   Approval Rate: ${performance2Data.approvalRate}%`)
        console.log(`   Current Assignments: ${performance2Data.currentAssignments}`)
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Troubleshooting Tips:')
      console.log('   1. Make sure the backend server is running: npm run dev:server')
      console.log('   2. Check if MongoDB is running')
      console.log('   3. Verify the API_BASE_URL in .env file')
    }
    
    process.exit(1)
  }
}

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testEmployeePerformance()
}

export { testEmployeePerformance }