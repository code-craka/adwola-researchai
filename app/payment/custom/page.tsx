"use client"

import { useState } from "react"

// Import the TestCardInfo component
import TestCardInfo from "@/components/payment/test-card-info"

export default function CustomPaymentPage() {
  const [showPaymentForm, setShowPaymentForm] = useState(true)

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Custom Payment</h1>

      {showPaymentForm && (
        <div className="mb-4">
          <p>This is a custom payment form placeholder.</p>
          {/* Add your custom payment form elements here */}
          <input type="text" placeholder="Card Number" className="border p-2 mr-2" />
          <input type="text" placeholder="Expiry Date" className="border p-2 mr-2" />
          <input type="text" placeholder="CVV" className="border p-2 mr-2" />
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Pay Now</button>
        </div>
      )}

      {showPaymentForm && <TestCardInfo />}
    </div>
  )
}
