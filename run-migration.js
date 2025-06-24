#!/usr/bin/env node

// Simple script to run the fresh migration
import { runFreshMigration } from './scripts/fresh-migration.js'

console.log('🚀 Running Fresh Database Migration...')
console.log('This will create a completely fresh database with sample data.')
console.log('')

// Run the migration
runFreshMigration()