// Test API Client
import fetch from 'node-fetch'

const API_BASE_URL = "http://localhost:3001/api"

async function testApiEndpoints() {
  console.log('🧪 Testing API endpoints...')
  
  try {
    // Test health endpoint
    console.log('\n1. Testing health endpoint...')
    const healthResponse = await fetch(`${API_BASE_URL}/health`)
    const healthData = await healthResponse.json()
    console.log('✅ Health:', healthData.status)
    
    // Test continents endpoint
    console.log('\n2. Testing continents endpoint...')
    const continentsResponse = await fetch(`${API_BASE_URL}/continents`)
    const continentsData = await continentsResponse.json()
    console.log('✅ Continents:', continentsData)
    
    // Test countries endpoint
    console.log('\n3. Testing countries endpoint...')
    const countriesResponse = await fetch(`${API_BASE_URL}/countries`)
    const countriesData = await countriesResponse.json()
    console.log(`✅ Countries: ${countriesData.length} countries loaded`)
    console.log('First country:', countriesData[0]?.name)
    
    console.log('\n🎉 All API endpoints are working!')
    
  } catch (error) {
    console.error('❌ API Test Error:', error.message)
  }
}

testApiEndpoints()