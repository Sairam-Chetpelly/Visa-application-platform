// MongoDB Seed Script for Countries with Continents
import mongoose from 'mongoose'
import { Country, VisaType } from './mongodb-models.js'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/visa_management_system"

const sampleCountries = [
  // Asia
  {
    name: 'Japan',
    code: 'JPN',
    flagEmoji: '🇯🇵',
    continent: 'Asia',
    processingTimeMin: 10,
    processingTimeMax: 20,
    isActive: true
  },
  {
    name: 'Singapore',
    code: 'SGP',
    flagEmoji: '🇸🇬',
    continent: 'Asia',
    processingTimeMin: 5,
    processingTimeMax: 15,
    isActive: true
  },
  {
    name: 'Thailand',
    code: 'THA',
    flagEmoji: '🇹🇭',
    continent: 'Asia',
    processingTimeMin: 7,
    processingTimeMax: 14,
    isActive: true
  },
  {
    name: 'South Korea',
    code: 'KOR',
    flagEmoji: '🇰🇷',
    continent: 'Asia',
    processingTimeMin: 10,
    processingTimeMax: 21,
    isActive: true
  },
  
  // Europe
  {
    name: 'Germany',
    code: 'DEU',
    flagEmoji: '🇩🇪',
    continent: 'Europe',
    processingTimeMin: 15,
    processingTimeMax: 30,
    isActive: true
  },
  {
    name: 'France',
    code: 'FRA',
    flagEmoji: '🇫🇷',
    continent: 'Europe',
    processingTimeMin: 15,
    processingTimeMax: 30,
    isActive: true
  },
  {
    name: 'United Kingdom',
    code: 'GBR',
    flagEmoji: '🇬🇧',
    continent: 'Europe',
    processingTimeMin: 15,
    processingTimeMax: 25,
    isActive: true
  },
  {
    name: 'Italy',
    code: 'ITA',
    flagEmoji: '🇮🇹',
    continent: 'Europe',
    processingTimeMin: 15,
    processingTimeMax: 30,
    isActive: true
  },
  {
    name: 'Spain',
    code: 'ESP',
    flagEmoji: '🇪🇸',
    continent: 'Europe',
    processingTimeMin: 15,
    processingTimeMax: 30,
    isActive: true
  },
  
  // North America
  {
    name: 'United States',
    code: 'USA',
    flagEmoji: '🇺🇸',
    continent: 'North America',
    processingTimeMin: 15,
    processingTimeMax: 30,
    isActive: true
  },
  {
    name: 'Canada',
    code: 'CAN',
    flagEmoji: '🇨🇦',
    continent: 'North America',
    processingTimeMin: 20,
    processingTimeMax: 40,
    isActive: true
  },
  {
    name: 'Mexico',
    code: 'MEX',
    flagEmoji: '🇲🇽',
    continent: 'North America',
    processingTimeMin: 10,
    processingTimeMax: 20,
    isActive: true
  },
  
  // South America
  {
    name: 'Brazil',
    code: 'BRA',
    flagEmoji: '🇧🇷',
    continent: 'South America',
    processingTimeMin: 15,
    processingTimeMax: 30,
    isActive: true
  },
  {
    name: 'Argentina',
    code: 'ARG',
    flagEmoji: '🇦🇷',
    continent: 'South America',
    processingTimeMin: 10,
    processingTimeMax: 25,
    isActive: true
  },
  {
    name: 'Chile',
    code: 'CHL',
    flagEmoji: '🇨🇱',
    continent: 'South America',
    processingTimeMin: 10,
    processingTimeMax: 20,
    isActive: true
  },
  
  // Africa
  {
    name: 'South Africa',
    code: 'ZAF',
    flagEmoji: '🇿🇦',
    continent: 'Africa',
    processingTimeMin: 15,
    processingTimeMax: 30,
    isActive: true
  },
  {
    name: 'Egypt',
    code: 'EGY',
    flagEmoji: '🇪🇬',
    continent: 'Africa',
    processingTimeMin: 10,
    processingTimeMax: 20,
    isActive: true
  },
  {
    name: 'Morocco',
    code: 'MAR',
    flagEmoji: '🇲🇦',
    continent: 'Africa',
    processingTimeMin: 10,
    processingTimeMax: 25,
    isActive: true
  },
  
  // Oceania
  {
    name: 'Australia',
    code: 'AUS',
    flagEmoji: '🇦🇺',
    continent: 'Oceania',
    processingTimeMin: 20,
    processingTimeMax: 35,
    isActive: true
  },
  {
    name: 'New Zealand',
    code: 'NZL',
    flagEmoji: '🇳🇿',
    continent: 'Oceania',
    processingTimeMin: 15,
    processingTimeMax: 30,
    isActive: true
  }
]

const sampleVisaTypes = [
  {
    name: 'Tourist',
    description: 'Tourist/Visitor Visa for leisure travel',
    fee: 100,
    processingTimeDays: 21,
    requiredDocuments: ['passport', 'photo', 'financial_docs', 'travel_itinerary'],
    isActive: true
  },
  {
    name: 'Business',
    description: 'Business Visa for business meetings and conferences',
    fee: 150,
    processingTimeDays: 21,
    requiredDocuments: ['passport', 'photo', 'financial_docs', 'employment_letter'],
    isActive: true
  },
  {
    name: 'Student',
    description: 'Student Visa for educational purposes',
    fee: 200,
    processingTimeDays: 30,
    requiredDocuments: ['passport', 'photo', 'financial_docs', 'acceptance_letter'],
    isActive: true
  },
  {
    name: 'Work',
    description: 'Work Visa for employment purposes',
    fee: 250,
    processingTimeDays: 35,
    requiredDocuments: ['passport', 'photo', 'employment_letter', 'work_permit'],
    isActive: true
  }
]

async function seedCountriesAndVisaTypes() {
  try {
    console.log('🌱 Starting MongoDB seed process...')
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')
    
    // Clear existing data
    console.log('🧹 Clearing existing countries and visa types...')
    await Country.deleteMany({})
    await VisaType.deleteMany({})
    
    // Insert countries
    console.log('🌍 Inserting sample countries...')
    const insertedCountries = await Country.insertMany(sampleCountries)
    console.log(`✅ Inserted ${insertedCountries.length} countries`)
    
    // Insert visa types for each country
    console.log('📋 Inserting visa types for each country...')
    let totalVisaTypes = 0
    
    for (const country of insertedCountries) {
      const visaTypesForCountry = sampleVisaTypes.map(visaType => ({
        ...visaType,
        countryId: country._id
      }))
      
      await VisaType.insertMany(visaTypesForCountry)
      totalVisaTypes += visaTypesForCountry.length
    }
    
    console.log(`✅ Inserted ${totalVisaTypes} visa types`)
    
    // Display summary
    console.log('\n📊 Seed Summary:')
    console.log(`Countries: ${insertedCountries.length}`)
    console.log(`Visa Types: ${totalVisaTypes}`)
    
    // Display continents
    const continents = [...new Set(sampleCountries.map(c => c.continent))].sort()
    console.log(`Continents: ${continents.join(', ')}`)
    
    console.log('\n🎉 Seed process completed successfully!')
    
  } catch (error) {
    console.error('❌ Error during seed process:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('👋 Disconnected from MongoDB')
    process.exit(0)
  }
}

// Run the seed function
seedCountriesAndVisaTypes()