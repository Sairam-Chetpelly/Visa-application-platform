"use client"

import React, { useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, Shield, CheckCircle } from 'lucide-react'

declare global {
  interface Window {
    Razorpay: any
  }
}

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  paymentData: {
    orderId: string
    amount: number
    currency: string
    key: string
    applicationNumber: string
    visaType: string
    country: string
  } | null
  onPaymentSuccess: (paymentData: any) => void
  onPaymentError: (error: any) => void
}

export default function PaymentModal({
  isOpen,
  onClose,
  paymentData,
  onPaymentSuccess,
  onPaymentError
}: PaymentModalProps) {
  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const handlePayment = () => {
    if (!paymentData || !window.Razorpay) {
      onPaymentError({ message: 'Payment gateway not loaded' })
      return
    }

    const options = {
      key: paymentData.key,
      amount: paymentData.amount,
      currency: paymentData.currency,
      name: 'VisaFlow',
      description: `${paymentData.country} ${paymentData.visaType} Visa`,
      order_id: paymentData.orderId,
      handler: function (response: any) {
        onPaymentSuccess({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature
        })
      },
      prefill: {
        name: 'Visa Applicant',
        email: 'applicant@example.com',
        contact: '9999999999'
      },
      notes: {
        application_number: paymentData.applicationNumber,
        visa_type: paymentData.visaType,
        country: paymentData.country
      },
      theme: {
        color: '#2563eb'
      },
      modal: {
        ondismiss: function() {
          onPaymentError({ message: 'Payment cancelled by user' })
        }
      }
    }

    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  if (!paymentData) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Complete Payment
          </DialogTitle>
          <DialogDescription>
            Complete your visa application by making the payment
          </DialogDescription>
        </DialogHeader>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment Details</CardTitle>
            <CardDescription>Application: {paymentData.applicationNumber}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Country:</span>
              <span className="font-medium">{paymentData.country}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Visa Type:</span>
              <span className="font-medium">{paymentData.visaType}</span>
            </div>
            <div className="flex justify-between items-center border-t pt-4">
              <span className="text-lg font-semibold">Total Amount:</span>
              <span className="text-lg font-bold text-green-600">
                ₹{(paymentData.amount / 100).toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          <Shield className="h-4 w-4 text-blue-600" />
          <span>Secure payment powered by Razorpay</span>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handlePayment} className="flex-1">
            <CreditCard className="h-4 w-4 mr-2" />
            Pay Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}