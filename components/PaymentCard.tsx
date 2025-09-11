import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreditCard } from "lucide-react"

import { Payment } from "@/lib/api"

interface PaymentCardProps {
  payment: Payment
}

export default function PaymentCard({ payment }: PaymentCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Receipt
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Amount:</span>
            <span className="font-bold">₹{payment.amount}</span>
          </div>
          <div className="flex justify-between">
            <span>Status:</span>
            <Badge variant={payment.status === 'paid' ? 'default' : 'secondary'}>
              {payment.status.toUpperCase()}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Payment ID:</span>
            <span className="text-sm text-gray-600">{payment.razorpayPaymentId || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span>Date:</span>
            <span className="text-sm text-gray-600">{new Date(payment.verifiedAt || payment.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}