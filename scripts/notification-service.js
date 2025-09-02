// Notification Service with toggle functionality
import { SystemSettings } from './mongodb-models.js'
import { sendWhatsAppNotification } from './whatsapp.js'

// Check if a notification channel is enabled
export const isNotificationChannelEnabled = async (channel) => {
  try {
    console.log(`Checking if ${channel} notifications are enabled...`)
    const settingKey = `notifications_${channel}_enabled`
    console.log(`Looking for setting with key: ${settingKey}`)
    
    const setting = await SystemSettings.findOne({ key: settingKey })
    
    if (!setting) {
      console.log(`No setting found for ${channel}, defaulting to enabled`)
      return true
    }
    
    const isEnabled = setting.value !== 'false'
    console.log(`${channel} notifications setting found: ${setting.value} (enabled: ${isEnabled})`)
    return isEnabled
  } catch (error) {
    console.error(`Error checking notification channel status for ${channel}:`, error)
    // Default to true on error
    console.log(`Error occurred, defaulting ${channel} notifications to enabled`)
    return true
  }
}

// Enhanced notification sender that checks settings before sending
export const sendNotification = async (emailTransporter, userId, type, title, message, applicationId = null, whatsappMessage = null) => {
  try {
    // Import models
    const { User, Notification } = await import('./mongodb-models.js')
    
    // Save notification to database regardless of channel status
    await new Notification({
      userId,
      applicationId,
      type,
      title,
      message
    }).save()

    // Get user details
    const user = await User.findById(userId)
    if (!user) return

    // Check if email notifications are enabled
    if ((type === "email" || type === "system") && emailTransporter) {
      const emailEnabled = await isNotificationChannelEnabled('email')
      if (emailEnabled) {
        try {
          await emailTransporter.sendMail({
            from: `"No-Reply" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: title,
            html: `<p>${message}</p>`,
          })
          console.log(`📧 Email sent to ${user.email}: ${title}`)
        } catch (emailError) {
          console.error("Email sending failed:", emailError.message)
        }
      } else {
        console.log(`📧 Email notification skipped (disabled): ${title}`)
      }
    }

    // Check if SMS notifications are enabled
    if (type === "sms") {
      const smsEnabled = await isNotificationChannelEnabled('sms')
      if (smsEnabled) {
        // SMS implementation would go here
        console.log(`📱 SMS notification would be sent to ${user.phone}: ${title}`)
      } else {
        console.log(`📱 SMS notification skipped (disabled): ${title}`)
      }
    }

    // Check if WhatsApp notifications are enabled
    if (whatsappMessage && user.phone) {
      console.log(`📱 Checking WhatsApp notification status for message: ${title}`)
      const whatsappEnabled = await isNotificationChannelEnabled('whatsapp')
      console.log(`📱 WhatsApp notifications enabled: ${whatsappEnabled}`)
      
      if (whatsappEnabled) {
        try {
          console.log(`📱 Attempting to send WhatsApp to ${user.phone}: ${whatsappMessage.substring(0, 50)}...`)
          await sendWhatsAppNotification(user.phone, whatsappMessage)
          console.log(`📱 WhatsApp sent successfully to ${user.phone}: ${title}`)
        } catch (whatsappError) {
          console.error("📱 WhatsApp sending failed:", whatsappError.message)
          console.error("Error details:", whatsappError)
        }
      } else {
        console.log(`📱 WhatsApp notification skipped (disabled): ${title}`)
      }
    } else {
      console.log(`📱 WhatsApp notification skipped (no message or phone): ${user.phone ? 'Has phone' : 'No phone'}, ${whatsappMessage ? 'Has message' : 'No message'}`)
    }

    console.log(`📝 Notification logged for user ${userId}: ${title}`)
  } catch (error) {
    console.error("Error sending notification:", error)
  }
}

export default { sendNotification, isNotificationChannelEnabled }