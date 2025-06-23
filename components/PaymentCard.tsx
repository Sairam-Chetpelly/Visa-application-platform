"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, CreditCard, CheckCircle, Calendar, User, MapPin, Receipt } from 'lucide-react'

interface PaymentCardProps {
  payment: {
    _id: string
    razorpayOrderId: string
    razorpayPaymentId?: string
    amount: number
    currency: string
    status: string
    createdAt: string
    verifiedAt?: string
    applicationId: {
      applicationNumber: string
      customerId: {
        firstName: string
        lastName: string
        email: string
      }
      countryId: {
        name: string
        flagEmoji: string
      }
      visaTypeId: {
        name: string
        fee: number
      }
    }
  }
  onDownload?: () => void
  showDownload?: boolean
}

export default function PaymentCard({ payment, onDownload, showDownload = true }: PaymentCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'created':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = currency === 'INR' ? '₹' : '$'
    return `${symbol}${amount.toFixed(2)}`
  }

  const handleDownloadReceipt = () => {
    // Create a printable receipt
    const receiptWindow = window.open('', '_blank')
    if (!receiptWindow) return

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Receipt - ${payment.applicationId.applicationNumber}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px;
              line-height: 1.6;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid #2563eb; 
              padding-bottom: 20px; 
              margin-bottom: 30px;
            }
            .logo { 
              font-size: 24px; 
              font-weight: bold; 
              color: #2563eb; 
              margin-bottom: 10px;
            }
            .receipt-title { 
              font-size: 20px; 
              margin: 10px 0;
              color: #333;
            }
            .receipt-info { 
              background: #f8f9fa; 
              padding: 15px; 
              border-radius: 8px; 
              margin: 20px 0;
            }
            .info-row { 
              display: flex; 
              justify-content: space-between; 
              margin: 8px 0;
              padding: 5px 0;
            }
            .info-row.total { 
              border-top: 2px solid #2563eb; 
              font-weight: bold; 
              font-size: 18px;
              margin-top: 15px;
              padding-top: 15px;
            }
            .status { 
              display: inline-block;
              padding: 4px 12px; 
              border-radius: 20px; 
              font-size: 12px; 
              font-weight: bold;
              background: #dcfce7;
              color: #166534;
            }
            .footer { 
              text-align: center; 
              margin-top: 40px; 
              padding-top: 20px; 
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 12px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">🌍 VisaFlow</div>
            <div class="receipt-title">Payment Receipt</div>
            <div>Receipt #: ${payment.razorpayOrderId}</div>
          </div>
          
          <div class="receipt-info">
            <div class="info-row">
              <span>Application Number:</span>
              <span><strong>${payment.applicationId.applicationNumber}</strong></span>
            </div>
            <div class="info-row">
              <span>Customer Name:</span>
              <span>${payment.applicationId.customerId.firstName} ${payment.applicationId.customerId.lastName}</span>
            </div>
            <div class="info-row">
              <span>Email:</span>
              <span>${payment.applicationId.customerId.email}</span>
            </div>
            <div class="info-row">
              <span>Country:</span>
              <span>${payment.applicationId.countryId.flagEmoji} ${payment.applicationId.countryId.name}</span>
            </div>
            <div class="info-row">
              <span>Visa Type:</span>
              <span>${payment.applicationId.visaTypeId.name}</span>
            </div>
            <div class="info-row">
              <span>Payment Date:</span>
              <span>${formatDate(payment.verifiedAt || payment.createdAt)}</span>
            </div>
            <div class="info-row">
              <span>Payment ID:</span>
              <span>${payment.razorpayPaymentId || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span>Status:</span>
              <span class="status">${payment.status.toUpperCase()}</span>
            </div>
            <div class="info-row total">
              <span>Total Amount:</span>
              <span>${formatCurrency(payment.amount, payment.currency)}</span>
            </div>
          </div>
          
          <div class="footer">
            <p>This is a computer-generated receipt. No signature required.</p>
            <p>For any queries, contact support@visaflow.com</p>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>
          
          <div class="no-print" style="text-align: center; margin-top: 30px;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer;">Print Receipt</button>
            <button onclick="window.close()" style="padding: 10px 20px; background: #6b7280; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">Close</button>
          </div>
        </body>
      </html>
    `

    receiptWindow.document.write(receiptHTML)
    receiptWindow.document.close()
    
    if (onDownload) {
      onDownload()
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-blue-600" />
            Payment Receipt
          </CardTitle>
          <Badge className={getStatusColor(payment.status)}>
            {payment.status === 'paid' && <CheckCircle className="h-3 w-3 mr-1" />}
            {payment.status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Receipt Header */}
        <div className="text-center pb-4 border-b">
          <div className="text-2xl font-bold text-blue-600 mb-2">🌍 VisaFlow</div>
          <div className="text-sm text-gray-600">Receipt #{payment.razorpayOrderId}</div>
        </div>

        {/* Application Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <div>
                <div className="text-sm text-gray-600">Customer</div>
                <div className="font-medium">
                  {payment.applicationId.customerId.firstName} {payment.applicationId.customerId.lastName}
                </div>
                <div className="text-sm text-gray-500">{payment.applicationId.customerId.email}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <div>
                <div className="text-sm text-gray-600">Destination</div>
                <div className="font-medium">
                  {payment.applicationId.countryId.flagEmoji} {payment.applicationId.countryId.name}
                </div>
                <div className="text-sm text-gray-500">{payment.applicationId.visaTypeId.name}</div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <div className="text-sm text-gray-600">Payment Date</div>
                <div className="font-medium">{formatDate(payment.verifiedAt || payment.createdAt)}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-gray-500" />
              <div>
                <div className="text-sm text-gray-600">Payment ID</div>
                <div className="font-medium text-xs">{payment.razorpayPaymentId || 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Application Number:</span>
            <span className="font-medium">{payment.applicationId.applicationNumber}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Visa Fee:</span>
            <span className="font-medium">{formatCurrency(payment.amount, payment.currency)}</span>
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total Paid:</span>
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(payment.amount, payment.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Download Button */}
        {showDownload && (
          <div className="flex justify-center pt-4">
            <Button onClick={handleDownloadReceipt} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download Receipt
            </Button>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 pt-4 border-t">
          <p>This is a computer-generated receipt. No signature required.</p>
          <p>For any queries, contact support@visaflow.com</p>
        </div>
      </CardContent>
    </Card>
  )
}