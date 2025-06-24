// Migration script to add continent field to existing countries
import mongoose from 'mongoose'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/visa_management_system"

// Country to continent mapping
const countryToContinentMap = {
  // Asia
  'India': 'Asia',
  'China': 'Asia',
  'Japan': 'Asia',
  'South Korea': 'Asia',
  'Thailand': 'Asia',
  'Singapore': 'Asia',
  'Malaysia': 'Asia',
  'Indonesia': 'Asia',
  'Philippines': 'Asia',
  'Vietnam': 'Asia',
  'Cambodia': 'Asia',
  'Laos': 'Asia',
  'Myanmar': 'Asia',
  'Bangladesh': 'Asia',
  'Sri Lanka': 'Asia',
  'Nepal': 'Asia',
  'Bhutan': 'Asia',
  'Maldives': 'Asia',
  'Pakistan': 'Asia',
  'Afghanistan': 'Asia',
  'Iran': 'Asia',
  'Iraq': 'Asia',
  'Saudi Arabia': 'Asia',
  'UAE': 'Asia',
  'Qatar': 'Asia',
  'Kuwait': 'Asia',
  'Bahrain': 'Asia',
  'Oman': 'Asia',
  'Yemen': 'Asia',
  'Jordan': 'Asia',
  'Lebanon': 'Asia',
  'Syria': 'Asia',
  'Israel': 'Asia',
  'Palestine': 'Asia',
  'Turkey': 'Asia',
  'Cyprus': 'Asia',
  'Georgia': 'Asia',
  'Armenia': 'Asia',
  'Azerbaijan': 'Asia',
  'Kazakhstan': 'Asia',
  'Uzbekistan': 'Asia',
  'Turkmenistan': 'Asia',
  'Kyrgyzstan': 'Asia',
  'Tajikistan': 'Asia',
  'Mongolia': 'Asia',
  'North Korea': 'Asia',
  'Taiwan': 'Asia',
  'Hong Kong': 'Asia',
  'Macau': 'Asia',
  'Brunei': 'Asia',
  'East Timor': 'Asia',

  // Europe
  'United Kingdom': 'Europe',
  'France': 'Europe',
  'Germany': 'Europe',
  'Italy': 'Europe',
  'Spain': 'Europe',
  'Portugal': 'Europe',
  'Netherlands': 'Europe',
  'Belgium': 'Europe',
  'Luxembourg': 'Europe',
  'Switzerland': 'Europe',
  'Austria': 'Europe',
  'Denmark': 'Europe',
  'Sweden': 'Europe',
  'Norway': 'Europe',
  'Finland': 'Europe',
  'Iceland': 'Europe',
  'Ireland': 'Europe',
  'Poland': 'Europe',
  'Czech Republic': 'Europe',
  'Slovakia': 'Europe',
  'Hungary': 'Europe',
  'Slovenia': 'Europe',
  'Croatia': 'Europe',
  'Bosnia and Herzegovina': 'Europe',
  'Serbia': 'Europe',
  'Montenegro': 'Europe',
  'North Macedonia': 'Europe',
  'Albania': 'Europe',
  'Greece': 'Europe',
  'Bulgaria': 'Europe',
  'Romania': 'Europe',
  'Moldova': 'Europe',
  'Ukraine': 'Europe',
  'Belarus': 'Europe',
  'Lithuania': 'Europe',
  'Latvia': 'Europe',
  'Estonia': 'Europe',
  'Russia': 'Europe',
  'Malta': 'Europe',
  'San Marino': 'Europe',
  'Vatican City': 'Europe',
  'Monaco': 'Europe',
  'Andorra': 'Europe',
  'Liechtenstein': 'Europe',

  // North America
  'United States': 'North America',
  'Canada': 'North America',
  'Mexico': 'North America',
  'Guatemala': 'North America',
  'Belize': 'North America',
  'El Salvador': 'North America',
  'Honduras': 'North America',
  'Nicaragua': 'North America',
  'Costa Rica': 'North America',
  'Panama': 'North America',
  'Cuba': 'North America',
  'Jamaica': 'North America',
  'Haiti': 'North America',
  'Dominican Republic': 'North America',
  'Bahamas': 'North America',
  'Barbados': 'North America',
  'Trinidad and Tobago': 'North America',
  'Grenada': 'North America',
  'Saint Vincent and the Grenadines': 'North America',
  'Saint Lucia': 'North America',
  'Dominica': 'North America',
  'Antigua and Barbuda': 'North America',
  'Saint Kitts and Nevis': 'North America',

  // South America
  'Brazil': 'South America',
  'Argentina': 'South America',
  'Chile': 'South America',
  'Peru': 'South America',
  'Colombia': 'South America',
  'Venezuela': 'South America',
  'Ecuador': 'South America',
  'Bolivia': 'South America',
  'Paraguay': 'South America',
  'Uruguay': 'South America',
  'Guyana': 'South America',
  'Suriname': 'South America',
  'French Guiana': 'South America',

  // Africa
  'Nigeria': 'Africa',
  'South Africa': 'Africa',
  'Egypt': 'Africa',
  'Kenya': 'Africa',
  'Ghana': 'Africa',
  'Morocco': 'Africa',
  'Algeria': 'Africa',
  'Tunisia': 'Africa',
  'Libya': 'Africa',
  'Sudan': 'Africa',
  'South Sudan': 'Africa',
  'Ethiopia': 'Africa',
  'Somalia': 'Africa',
  'Djibouti': 'Africa',
  'Eritrea': 'Africa',
  'Uganda': 'Africa',
  'Tanzania': 'Africa',
  'Rwanda': 'Africa',
  'Burundi': 'Africa',
  'Democratic Republic of the Congo': 'Africa',
  'Republic of the Congo': 'Africa',
  'Central African Republic': 'Africa',
  'Chad': 'Africa',
  'Cameroon': 'Africa',
  'Equatorial Guinea': 'Africa',
  'Gabon': 'Africa',
  'São Tomé and Príncipe': 'Africa',
  'Angola': 'Africa',
  'Zambia': 'Africa',
  'Zimbabwe': 'Africa',
  'Botswana': 'Africa',
  'Namibia': 'Africa',
  'Lesotho': 'Africa',
  'Eswatini': 'Africa',
  'Mozambique': 'Africa',
  'Malawi': 'Africa',
  'Madagascar': 'Africa',
  'Mauritius': 'Africa',
  'Seychelles': 'Africa',
  'Comoros': 'Africa',
  'Mali': 'Africa',
  'Burkina Faso': 'Africa',
  'Niger': 'Africa',
  'Senegal': 'Africa',
  'Gambia': 'Africa',
  'Guinea-Bissau': 'Africa',
  'Guinea': 'Africa',
  'Sierra Leone': 'Africa',
  'Liberia': 'Africa',
  'Ivory Coast': 'Africa',
  'Togo': 'Africa',
  'Benin': 'Africa',
  'Mauritania': 'Africa',
  'Cape Verde': 'Africa',

  // Oceania
  'Australia': 'Oceania',
  'New Zealand': 'Oceania',
  'Papua New Guinea': 'Oceania',
  'Fiji': 'Oceania',
  'Solomon Islands': 'Oceania',
  'Vanuatu': 'Oceania',
  'Samoa': 'Oceania',
  'Tonga': 'Oceania',
  'Kiribati': 'Oceania',
  'Tuvalu': 'Oceania',
  'Nauru': 'Oceania',
  'Palau': 'Oceania',
  'Marshall Islands': 'Oceania',
  'Micronesia': 'Oceania'
}

async function migrateCountries() {
  try {
    console.log('🔄 Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    const Country = mongoose.model('Country', new mongoose.Schema({
      name: String,
      code: String,
      flagEmoji: String,
      continent: String,
      processingTimeMin: Number,
      processingTimeMax: Number,
      isActive: Boolean
    }, { timestamps: true }))

    console.log('🔄 Fetching countries without continent...')
    const countries = await Country.find({ 
      $or: [
        { continent: { $exists: false } },
        { continent: null },
        { continent: '' }
      ]
    })

    console.log(`📊 Found ${countries.length} countries to update`)

    let updated = 0
    let notFound = 0

    for (const country of countries) {
      const continent = countryToContinentMap[country.name]
      
      if (continent) {
        await Country.findByIdAndUpdate(country._id, { continent })
        console.log(`✅ Updated ${country.name} -> ${continent}`)
        updated++
      } else {
        console.log(`⚠️  No continent mapping found for: ${country.name}`)
        // Set a default continent for unmapped countries
        await Country.findByIdAndUpdate(country._id, { continent: 'Other' })
        notFound++
      }
    }

    console.log(`\n📈 Migration Summary:`)
    console.log(`   ✅ Updated: ${updated} countries`)
    console.log(`   ⚠️  Unmapped: ${notFound} countries (set to 'Other')`)
    console.log(`   📊 Total processed: ${updated + notFound} countries`)

    console.log('\n🎉 Migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')
    process.exit(0)
  }
}

// Run migration
migrateCountries()