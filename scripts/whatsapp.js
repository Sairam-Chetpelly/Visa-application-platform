// WhatsApp Notification Service
import fetch from 'node-fetch'

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'http://whatsapp.visionhlt.com/api/mt/SendMessage'
const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY || 'hqFsFoF2506KKuaGdOYQSQ'
const WHATSAPP_CHANNEL_ID = process.env.WHATSAPP_CHANNEL_ID || '377'
const ADMIN_WHATSAPP = process.env.ADMIN_WHATSAPP || '919226166606'

export const sendWhatsAppNotification = async (phoneNumber, message) => {
  try {
    const url = `${WHATSAPP_API_URL}?APIkey=${WHATSAPP_API_KEY}&channelId=${WHATSAPP_CHANNEL_ID}&mobile=${phoneNumber}&messageText=${encodeURIComponent(message)}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    const result = await response.text()
    console.log(`📱 WhatsApp sent to ${phoneNumber}:`, result)
    
    return { success: true, message: 'WhatsApp notification sent', response: result }
  } catch (error) {
    console.error('WhatsApp notification failed:', error)
    return { success: false, error: error.message }
  }
}

export const sendAdminWhatsAppNotification = async (message) => {
  return sendWhatsAppNotification(ADMIN_WHATSAPP, message)
}

// WhatsApp message templates
export const whatsappTemplates = {
  welcome: (userName) => `🎉 Welcome to Options Travel Services, ${userName}! Your account has been created successfully. Start your visa application journey today!`,
  
  applicationCreated: (userName, applicationNumber, country) => 
    `📋 New Application Created!\n\nHi ${userName},\nYour visa application ${applicationNumber} for ${country} has been created successfully.\n\nTrack your application status in your dashboard.`,
  
  applicationSubmitted: (userName, applicationNumber, country) =>
    `✅ Application Submitted!\n\nHi ${userName},\nYour visa application ${applicationNumber} for ${country} has been submitted and is now under review.\n\nWe'll keep you updated on the progress.`,
  
  applicationApproved: (userName, applicationNumber, country) =>
    `🎉 Visa Approved!\n\nCongratulations ${userName}!\nYour visa application ${applicationNumber} for ${country} has been APPROVED!\n\nCheck your email for further instructions.`,
  
  applicationRejected: (userName, applicationNumber, country, reason) =>
    `❌ Application Update\n\nHi ${userName},\nYour visa application ${applicationNumber} for ${country} requires attention.\n\nReason: ${reason}\n\nPlease check your dashboard for details.`,
  
  paymentReceived: (userName, amount, applicationNumber) =>
    `💳 Payment Confirmed!\n\nHi ${userName},\nWe've received your payment of ₹${amount} for application ${applicationNumber}.\n\nYour application is now being processed.`,
  
  adminNewApplication: (customerName, applicationNumber, country) =>
    `🆕 New Application Alert!\n\nCustomer: ${customerName}\nApplication: ${applicationNumber}\nCountry: ${country}\n\nPlease review and assign to a processor.`,
  
  employeeAssigned: (employeeName, applicationNumber, country) =>
    `📋 New Assignment!\n\nHi ${employeeName},\nApplication ${applicationNumber} for ${country} has been assigned to you.\n\nPlease review and process accordingly.`
}