"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

// Common country codes without plus sign
const countryCodes = [
  { code: "1", country: "US/CA" },
  { code: "44", country: "UK" },
  { code: "91", country: "IN" },
  { code: "61", country: "AU" },
  { code: "49", country: "DE" },
  { code: "86", country: "CN" },
  { code: "81", country: "JP" },
  { code: "971", country: "UAE" },
]

interface PhoneInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function PhoneInput({ 
  value, 
  onChange, 
  className, 
  ...props 
}: PhoneInputProps) {
  // Extract country code and phone number from value
  const parsePhoneValue = (val: string) => {
    // Remove any plus sign if present
    const cleanVal = val.replace(/^\+/, '')
    
    // Try to match country codes
    for (const cc of countryCodes) {
      if (cleanVal.startsWith(cc.code)) {
        return {
          countryCode: cc.code,
          phoneNumber: cleanVal.substring(cc.code.length)
        }
      }
    }
    
    // Default to India code if no match
    return { countryCode: "91", phoneNumber: cleanVal }
  }

  const { countryCode, phoneNumber } = parsePhoneValue(value || "91")

  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(`${e.target.value}${phoneNumber}`)
  }

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(`${countryCode}${e.target.value}`)
  }

  return (
    <div className={cn("flex", className)}>
      <select
        value={countryCode}
        onChange={handleCountryCodeChange}
        className="flex-shrink-0 w-[80px] rounded-l-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
      >
        {countryCodes.map((cc) => (
          <option key={cc.code} value={cc.code}>
            {cc.code} {cc.country}
          </option>
        ))}
      </select>
      <Input
        type="tel"
        placeholder="Phone number"
        value={phoneNumber}
        onChange={handlePhoneNumberChange}
        className="rounded-l-none"
        {...props}
      />
    </div>
  )
}