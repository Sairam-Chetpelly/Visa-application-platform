// Test Dynamic Forms Functionality
import fetch from 'node-fetch'

const API_BASE = 'http://localhost:3001/api'

async function testDynamicForms() {
  console.log('🧪 Testing Dynamic Forms Functionality...\n')
  
  try {
    // 1. Test health endpoint
    console.log('1. Testing server health...')
    const healthResponse = await fetch(`${API_BASE}/health`)
    const health = await healthResponse.json()
    console.log(`   ✅ Server: ${health.status}`)
    console.log(`   ✅ Database: ${health.database}`)
    console.log(`   ✅ Countries: ${health.data.countries}`)
    console.log(`   ✅ Visa Types: ${health.data.visaTypes}\n`)
    
    // 2. Test countries endpoint
    console.log('2. Testing countries endpoint...')
    const countriesResponse = await fetch(`${API_BASE}/countries`)
    const countries = await countriesResponse.json()
    console.log(`   ✅ Found ${countries.length} countries`)
    
    if (countries.length > 0) {
      const firstCountry = countries[0]
      console.log(`   ✅ Sample: ${firstCountry.flagEmoji} ${firstCountry.name}`)
      console.log(`   ✅ Visa Types: ${firstCountry.visa_types.length}\n`)
      
      // 3. Test dynamic form endpoint
      if (firstCountry.visa_types.length > 0) {
        const firstVisaType = firstCountry.visa_types[0]
        console.log('3. Testing dynamic form endpoint...')
        console.log(`   Testing visa type: ${firstVisaType.name} (ID: ${firstVisaType.id})`)
        
        const formResponse = await fetch(`${API_BASE}/dynamic-forms/visa-type/${firstVisaType.id}`)
        
        if (formResponse.ok) {
          const form = await formResponse.json()
          console.log(`   ✅ Form found: ${form.formName}`)
          console.log(`   ✅ Fields: ${form.fields.length}`)
          console.log(`   ✅ Country: ${form.countryId.flagEmoji} ${form.countryId.name}`)
          console.log(`   ✅ Visa Type: ${form.visaTypeId.name} ($${form.visaTypeId.fee})`)
          
          // Show first few fields
          console.log('   📝 Sample fields:')
          form.fields.slice(0, 3).forEach((field, index) => {
            console.log(`      ${index + 1}. ${field.label} (${field.type}) ${field.required ? '*' : ''}`)
          })
        } else {
          console.log(`   ❌ Form not found: ${formResponse.status}`)
        }
      }
    }
    
    console.log('\n🎉 Dynamic Forms Test Complete!')
    console.log('\n📝 Next Steps:')
    console.log('   1. Frontend: http://localhost:3000')
    console.log('   2. Backend: http://localhost:3001/api/health')
    console.log('   3. Login with: customer@example.com / password123')
    console.log('   4. Try creating a new application')
    console.log('   5. Click "Dynamic Form" button')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testDynamicForms()