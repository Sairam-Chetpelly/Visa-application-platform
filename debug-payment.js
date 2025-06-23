#!/usr/bin/env node

/**
 * Payment Gateway Debug Script
 * 
 * This script helps debug payment gateway issues
 */

import fetch from 'node-fetch'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

async function debugPaymentGateway() {
  console.log('🔍 Debugging Payment Gateway Issues...\n')

  try {
    // 1. Check if backend server is running
    console.log('1. Checking backend server...')
    try {
      const healthResponse = await fetch(`${API_BASE_URL}/health`)
      if (healthResponse.ok) {
        const healthData = await healthResponse.json()
        console.log('✅ Backend server is running')
        console.log(`   Database: ${healthData.database}`)
        console.log(`   Countries: ${healthData.data?.countries || 0}`)
      } else {
        console.log('❌ Backend server responded with error:', healthResponse.status)
        return
      }
    } catch (error) {
      console.log('❌ Backend server is not running or not accessible')
      console.log('💡 Please start the backend server with: npm run dev:server')
      return
    }

    // 2. Test login to get authentication token
    console.log('\n2. Testing authentication...')
    let authToken = null
    try {
      const loginResponse = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'john.smith@email.com',
          password: 'password123'
        })
      })

      if (loginResponse.ok) {
        const loginData = await loginResponse.json()
        authToken = loginData.token
        console.log('✅ Authentication successful')
        console.log(`   User: ${loginData.user.firstName} ${loginData.user.lastName}`)
      } else {
        console.log('❌ Authentication failed')
        return
      }
    } catch (error) {
      console.log('❌ Authentication error:', error.message)
      return
    }

    // 3. Test countries endpoint
    console.log('\n3. Testing countries endpoint...')
    try {
      const countriesResponse = await fetch(`${API_BASE_URL}/countries`)
      if (countriesResponse.ok) {
        const countries = await countriesResponse.json()
        console.log(`✅ Countries loaded: ${countries.length} countries`)
        
        if (countries.length > 0) {
          const firstCountry = countries[0]
          console.log(`   Sample country: ${firstCountry.name}`)
          console.log(`   Visa types: ${firstCountry.visa_types?.length || 0}`)
        }
      } else {
        console.log('❌ Countries endpoint failed')
      }
    } catch (error) {
      console.log('❌ Countries error:', error.message)
    }

    // 4. Test application creation
    console.log('\n4. Testing application creation...')
    let applicationId = null
    try {
      const countries = await fetch(`${API_BASE_URL}/countries`).then(r => r.json())
      if (countries.length > 0 && countries[0].visa_types?.length > 0) {
        const country = countries[0]
        const visaType = country.visa_types[0]

        const applicationData = {
          countryId: country.id,
          visaTypeId: visaType.id,
          personalInfo: {
            firstName: 'Test',
            lastName: 'User',
            dateOfBirth: '1990-01-01',
            nationality: 'Indian',
            gender: 'male'
          },
          contactInfo: {
            email: 'test@example.com',
            phone: '+1234567890',
            address: '123 Test St',
            city: 'Test City',
            postalCode: '12345'
          },
          passportInfo: {
            passportNumber: 'TEST123456',
            passportExpiryDate: '2025-12-31',
            passportIssuePlace: 'Test City'
          },
          travelInfo: {
            purposeOfVisit: 'Tourism',
            intendedArrival: '2024-06-01',
            intendedDeparture: '2024-06-15',
            accommodationDetails: 'Test Hotel'
          },
          employmentInfo: {
            occupation: 'Software Engineer',
            employer: 'Test Company',
            monthlyIncome: 5000
          },
          additionalInfo: {
            previousVisits: '',
            criminalRecord: false,
            additionalInfo: ''
          }
        }

        const appResponse = await fetch(`${API_BASE_URL}/applications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(applicationData)
        })

        if (appResponse.ok) {
          const appData = await appResponse.json()
          applicationId = appData.applicationId
          console.log('✅ Application created successfully')
          console.log(`   Application ID: ${applicationId}`)
          console.log(`   Application Number: ${appData.applicationNumber}`)
        } else {
          const errorData = await appResponse.json()
          console.log('❌ Application creation failed:', errorData.error)
          return
        }
      }
    } catch (error) {
      console.log('❌ Application creation error:', error.message)
      return
    }

    // 5. Test payment order creation
    console.log('\n5. Testing payment order creation...')
    try {
      const paymentResponse = await fetch(`${API_BASE_URL}/applications/${applicationId}/create-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      })

      if (paymentResponse.ok) {
        const paymentData = await paymentResponse.json()
        console.log('✅ Payment order creation successful')
        console.log(`   Payment Required: ${paymentData.paymentRequired}`)
        
        if (paymentData.paymentRequired) {
          console.log(`   Order ID: ${paymentData.orderId}`)
          console.log(`   Amount: ₹${paymentData.amount / 100}`)
          console.log(`   Razorpay Key: ${paymentData.key ? 'Configured' : 'Not configured'}`)
        } else {
          console.log('   Application submitted without payment (Razorpay not configured)')
        }
      } else {
        const errorData = await paymentResponse.json()
        console.log('❌ Payment order creation failed:', errorData.error)
        console.log('   Details:', errorData.details)
      }
    } catch (error) {
      console.log('❌ Payment order error:', error.message)
    }

    console.log('\n🎉 Debug completed!')
    console.log('\n📋 Next Steps:')
    console.log('   1. If Razorpay is not configured, the app will work without payment')
    console.log('   2. To enable payments, add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env')
    console.log('   3. Make sure the backend server is running: npm run dev:server')
    console.log('   4. Check browser console for any JavaScript errors')

  } catch (error) {
    console.error('❌ Debug script failed:', error.message)
  }
}

// Run debug if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  debugPaymentGateway()
}

export { debugPaymentGateway }