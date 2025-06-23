#!/usr/bin/env node

/**
 * Quick Backend Test Script
 */

import fetch from 'node-fetch'

const API_BASE_URL = 'http://localhost:3001/api'

async function testBackend() {
  console.log('🧪 Testing Backend Server...\n')

  try {
    console.log('1. Testing health endpoint...')
    const response = await fetch(`${API_BASE_URL}/health`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Backend is running!')
      console.log(`   Status: ${data.status}`)
      console.log(`   Database: ${data.database}`)
      console.log(`   Countries: ${data.data?.countries || 0}`)
      console.log(`   Visa Types: ${data.data?.visaTypes || 0}`)
    } else {
      console.log(`❌ Backend responded with status: ${response.status}`)
    }
  } catch (error) {
    console.log('❌ Backend is not running or not accessible')
    console.log('💡 Please start the backend server with:')
    console.log('   cd scripts && node backend-server.js')
    console.log('   OR')
    console.log('   npm run dev:server')
  }
}

testBackend()