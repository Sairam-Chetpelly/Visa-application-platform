"use client"

import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, Shield, CheckCircle, Loader2 } from 'lucide-react'

declare global {
  interface Window {
    Razorpay: any
  }
}

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  paymentData: any
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
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')

  // Debug logging
  console.log('💳 PaymentModal props:', { isOpen, paymentData: !!paymentData })
  
  useEffect(() => {
    console.log('💳 PaymentModal state changed:', { isOpen, paymentStatus, isProcessing })
  }, [isOpen, paymentStatus, isProcessing])

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

  useEffect(() => {
    if (!isOpen) {
      setIsProcessing(false)
      setPaymentStatus('idle')
    }
  }, [isOpen])

  const handlePayment = () => {
    if (!paymentData) {
      onPaymentError({ message: 'No payment data available' })
      return
    }

    setIsProcessing(true)
    setPaymentStatus('processing')

    // Simulate payment for development
    setTimeout(() => {
      setPaymentStatus('success')
      setTimeout(() => {
        onPaymentSuccess({
          razorpay_payment_id: 'pay_' + Date.now(),
          razorpay_order_id: paymentData.orderId || 'order_' + Date.now(),
          razorpay_signature: 'sig_' + Date.now()
        })
      }, 1000)
    }, 2000)
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
              <span className="text-sm text-gray-600">Visa Type:</span>
              <span className="font-medium">{paymentData.visaType || 'Tourist Visa'}</span>
            </div>
            <div className="flex justify-between items-center border-t pt-4">
              <span className="text-lg font-semibold">Total Amount:</span>
              <span className="text-lg font-bold text-green-600">
                ${paymentData.fee || paymentData.amount || 100}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          <Shield className="h-4 w-4 text-blue-600" />
          <span>Secure payment powered by Razorpay</span>
        </div>

        {paymentStatus === 'processing' && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
              <p className="text-sm text-gray-600">Processing your payment...</p>
              <p className="text-xs text-gray-500">Please do not close this window</p>
            </div>
          </div>
        )}

        {paymentStatus === 'success' && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-4">
              <CheckCircle className="h-8 w-8 mx-auto text-green-600" />
              <p className="text-sm text-green-600 font-medium">Payment Successful!</p>
              <p className="text-xs text-gray-500">Redirecting...</p>
            </div>
          </div>
        )}

        {paymentStatus === 'idle' && (
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handlePayment} className="flex-1" disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay Now
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}