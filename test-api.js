// Simple API test script
import fetch from 'node-fetch'

const API_BASE = 'http://localhost:3001/api'

async function testAPI() {
  console.log('🧪 Testing API endpoints...\n')
  
  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...')
    const healthResponse = await fetch(`${API_BASE}/health`)
    const healthData = await healthResponse.json()
    console.log('✅ Health check:', healthData.status)
    console.log('   Database:', healthData.database)
    console.log('   Countries:', healthData.data?.countries || 'N/A')
    console.log('   Visa Types:', healthData.data?.visaTypes || 'N/A')
    console.log()
    
    // Test countries endpoint
    console.log('2. Testing countries endpoint...')
    const countriesResponse = await fetch(`${API_BASE}/countries`)
    
    if (!countriesResponse.ok) {
      const errorData = await countriesResponse.json()
      console.log('❌ Countries endpoint failed:', errorData)
      return
    }
    
    const countries = await countriesResponse.json()
    console.log(`✅ Countries endpoint: Found ${countries.length} countries`)
    
    if (countries.length > 0) {
      const firstCountry = countries[0]
      console.log('   Sample country:', {
        id: firstCountry.id,
        name: firstCountry.name,
        visaTypes: firstCountry.visa_types?.length || 0
      })
    }
    
    console.log('\n🎉 All tests passed!')
    
  } catch (error) {
    console.error('❌ API test failed:', error.message)
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testAPI()
}

export { testAPI }