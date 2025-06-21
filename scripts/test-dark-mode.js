#!/usr/bin/env node

/**
 * Dark Mode Test Script
 * 
 * This script helps verify that dark mode is working correctly
 * by checking for required files and configurations.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

console.log('🌙 Testing Dark Mode Implementation...\n')

// Test 1: Check if required files exist
const requiredFiles = [
  'hooks/useTheme.tsx',
  'components/ui/theme-toggle.tsx',
  'components/ui/dropdown-menu.tsx',
  'app/globals.css',
  'app/layout.tsx',
  'components/theme-demo.tsx',
  'app/theme-demo/page.tsx'
]

console.log('📁 Checking required files:')
let filesOk = true

requiredFiles.forEach(file => {
  const filePath = path.join(projectRoot, file)
  const exists = fs.existsSync(filePath)
  console.log(`   ${exists ? '✅' : '❌'} ${file}`)
  if (!exists) filesOk = false
})

if (!filesOk) {
  console.log('\n❌ Some required files are missing!')
  process.exit(1)
}

// Test 2: Check CSS variables in globals.css
console.log('\n🎨 Checking CSS variables:')
const globalsCssPath = path.join(projectRoot, 'app/globals.css')
const globalsCss = fs.readFileSync(globalsCssPath, 'utf8')

const requiredCssFeatures = [
  { name: 'Light theme variables', pattern: /--background:\s*0\s+0%\s+100%/ },
  { name: 'Dark theme variables', pattern: /\.dark\s*{[\s\S]*--background:\s*0\s+0%\s+3\.9%/ },
  { name: 'Smooth transitions', pattern: /transition.*background-color/ },
  { name: 'Custom scrollbar', pattern: /::-webkit-scrollbar/ },
  { name: 'Data theme attribute', pattern: /\[data-theme="dark"\]/ }
]

requiredCssFeatures.forEach(feature => {
  const found = feature.pattern.test(globalsCss)
  console.log(`   ${found ? '✅' : '❌'} ${feature.name}`)
})

// Test 3: Check ThemeProvider in layout
console.log('\n🏗️  Checking layout configuration:')
const layoutPath = path.join(projectRoot, 'app/layout.tsx')
const layoutContent = fs.readFileSync(layoutPath, 'utf8')

const layoutChecks = [
  { name: 'ThemeProvider import', pattern: /import.*ThemeProvider.*from.*useTheme/ },
  { name: 'ThemeProvider wrapper', pattern: /<ThemeProvider>/ },
  { name: 'suppressHydrationWarning', pattern: /suppressHydrationWarning/ },
  { name: 'Theme initialization script', pattern: /localStorage\.getItem\('theme'\)/ }
]

layoutChecks.forEach(check => {
  const found = check.pattern.test(layoutContent)
  console.log(`   ${found ? '✅' : '❌'} ${check.name}`)
})

// Test 4: Check useTheme hook
console.log('\n🪝 Checking useTheme hook:')
const useThemePath = path.join(projectRoot, 'hooks/useTheme.tsx')
const useThemeContent = fs.readFileSync(useThemePath, 'utf8')

const hookChecks = [
  { name: 'Theme type definition', pattern: /type Theme = "light" \| "dark" \| "system"/ },
  { name: 'localStorage persistence', pattern: /localStorage\.setItem\("theme"/ },
  { name: 'System theme detection', pattern: /prefers-color-scheme: dark/ },
  { name: 'Loading state', pattern: /isLoading.*boolean/ },
  { name: 'Data attribute setting', pattern: /setAttribute\("data-theme"/ }
]

hookChecks.forEach(check => {
  const found = check.pattern.test(useThemeContent)
  console.log(`   ${found ? '✅' : '❌'} ${check.name}`)
})

// Test 5: Check ThemeToggle component
console.log('\n🔄 Checking ThemeToggle component:')
const themeTogglePath = path.join(projectRoot, 'components/ui/theme-toggle.tsx')
const themeToggleContent = fs.readFileSync(themeTogglePath, 'utf8')

const toggleChecks = [
  { name: 'Icons import', pattern: /import.*Moon.*Sun.*Monitor.*from "lucide-react"/ },
  { name: 'DropdownMenu usage', pattern: /<DropdownMenu>/ },
  { name: 'Theme selection', pattern: /setTheme\("light"\)/ },
  { name: 'Current theme indicator', pattern: /{theme === ".*" && <Check/ },
  { name: 'Loading state handling', pattern: /if \(isLoading\)/ }
]

toggleChecks.forEach(check => {
  const found = check.pattern.test(themeToggleContent)
  console.log(`   ${found ? '✅' : '❌'} ${check.name}`)
})

// Test 6: Check if pages use ThemeToggle
console.log('\n📄 Checking page implementations:')
const pagesToCheck = [
  'app/page.tsx',
  'app/login/page.tsx',
  'app/register/page.tsx',
  'app/customer-dashboard/page.tsx'
]

pagesToCheck.forEach(pagePath => {
  const fullPath = path.join(projectRoot, pagePath)
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8')
    const hasThemeToggle = /<ThemeToggle/.test(content)
    console.log(`   ${hasThemeToggle ? '✅' : '⚠️ '} ${pagePath} ${hasThemeToggle ? 'has' : 'missing'} ThemeToggle`)
  }
})

console.log('\n🎉 Dark Mode Test Complete!')
console.log('\n📋 Next Steps:')
console.log('   1. Run: npm run dev')
console.log('   2. Visit: http://localhost:3000/theme-demo')
console.log('   3. Test theme switching with the toggle button')
console.log('   4. Check browser dev tools for any console errors')
console.log('   5. Test system theme changes (OS settings)')

console.log('\n💡 Tips:')
console.log('   • Use browser dev tools to simulate different color schemes')
console.log('   • Test on different devices and browsers')
console.log('   • Verify localStorage persistence across page reloads')
console.log('   • Check that all components adapt to theme changes')