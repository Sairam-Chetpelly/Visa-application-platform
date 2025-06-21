// Test payment endpoint
import fetch from 'node-fetch'

const API_BASE = 'http://localhost:3001/api'

async function testPayment() {
  try {
    console.log('🧪 Testing payment endpoint...\n')
    
    // First login to get token
    console.log('1. Logging in...')
    const loginResponse = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'john.smith@email.com',
        password: 'password123'
      })
    })
    
    if (!loginResponse.ok) {
      const error = await loginResponse.json()
      console.log('❌ Login failed:', error)
      return
    }
    
    const loginData = await loginResponse.json()
    console.log('✅ Login successful')
    
    // Get applications
    console.log('2. Getting applications...')
    const appsResponse = await fetch(`${API_BASE}/applications`, {
      headers: { 'Authorization': `Bearer ${loginData.token}` }
    })
    
    if (!appsResponse.ok) {
      const error = await appsResponse.json()
      console.log('❌ Failed to get applications:', error)
      return
    }
    
    const applications = await appsResponse.json()
    console.log(`✅ Found ${applications.length} applications`)
    
    if (applications.length === 0) {
      console.log('⚠️  No applications found to test payment')
      return
    }
    
    const testApp = applications[0]
    console.log(`3. Testing payment for application: ${testApp.applicationNumber}`)
    
    // Test payment creation
    const paymentResponse = await fetch(`${API_BASE}/applications/${testApp._id}/create-payment`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!paymentResponse.ok) {
      const error = await paymentResponse.json()
      console.log('❌ Payment creation failed:', error)
      return
    }
    
    const paymentData = await paymentResponse.json()
    console.log('✅ Payment endpoint working:', {
      paymentRequired: paymentData.paymentRequired,
      orderId: paymentData.orderId || 'N/A',
      amount: paymentData.amount || 'N/A'
    })
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run test
testPayment()