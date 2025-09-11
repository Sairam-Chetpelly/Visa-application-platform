const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';
let authToken = '';

async function testSystem() {
  console.log('🔍 Testing Complete System...\n');

  try {
    // 1. Test Health
    console.log('1. Testing Health Endpoint...');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health:', health.data.status);

    // 2. Test Login
    console.log('\n2. Testing Login...');
    const login = await axios.post(`${BASE_URL}/login`, {
      email: 'customer@example.com',
      password: 'password123'
    });
    authToken = login.data.token;
    console.log('✅ Login successful, user:', login.data.user.firstName);

    // 3. Test Countries
    console.log('\n3. Testing Countries...');
    const countries = await axios.get(`${BASE_URL}/countries`);
    console.log('✅ Countries loaded:', countries.data.length);

    // 4. Test Dynamic Forms
    console.log('\n4. Testing Dynamic Forms...');
    const forms = await axios.get(`${BASE_URL}/dynamic-forms?country=United%20States&visaType=Tourist`);
    console.log('✅ Dynamic form loaded:', forms.data.formName);

    // 5. Test Applications
    console.log('\n5. Testing Applications...');
    const apps = await axios.get(`${BASE_URL}/applications`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Applications loaded:', apps.data.data.length);

    // 6. Test Create Application
    console.log('\n6. Testing Create Application...');
    const newApp = await axios.post(`${BASE_URL}/applications`, {
      countryId: countries.data[0].id,
      visaTypeId: countries.data[0].visa_types[0].id
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Application created:', newApp.data.applicationNumber);

    // 7. Test Payment
    console.log('\n7. Testing Payment...');
    const payment = await axios.post(`${BASE_URL}/applications/${newApp.data.applicationId}/create-payment`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Payment created, fee:', payment.data.fee);

    // 8. Test Submit
    console.log('\n8. Testing Submit...');
    const submit = await axios.post(`${BASE_URL}/applications/${newApp.data.applicationId}/submit`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Application submitted:', submit.data.message);

    console.log('\n🎉 All tests passed! System is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testSystem();