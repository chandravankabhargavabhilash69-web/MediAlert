import React, { useState } from "react";
import { useApp } from "./AppContext";
import { CreditCard, ArrowRight, ShieldCheck, Download, Smartphone, X } from "lucide-react";
import { Exchange } from "../types";

interface PaymentModalProps {
  exchange: Exchange;
  onSuccess: (updatedExchange: Exchange) => void;
  onClose: () => void;
}

export default function PaymentModal({ exchange, onSuccess, onClose }: PaymentModalProps) {
  const { toast } = useApp();
  const [paymentStep, setPaymentStep] = useState<"method" | "processing" | "success">("method");
  const [selectedMethod, setSelectedMethod] = useState<"card" | "upi" | "netbanking">("card");
  
  // Card details mock states
  const [cardNumber, setCardNumber] = useState("4321 5567 8901 2345");
  const [cardExpiry, setCardExpiry] = useState("10/28");
  const [cardCvv, setCardCvv] = useState("123");
  
  // UPI details mock states
  const [vpaid, setVpaid] = useState("meduser@okaxis");
  
  const handlePaymentInitiation = async () => {
    try {
      // 1. Call create-order API
      const orderResp = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: exchange.amount,
          currency: "INR",
          exchangeId: exchange.id
        })
      });
      
      if (!orderResp.ok) throw new Error("Order creation failed");
      const order = await orderResp.json();
      
      // Move to processing step
      setPaymentStep("processing");
      
      // Simulate Razorpay Gateway authorization handshake (1.5 seconds)
      setTimeout(async () => {
        try {
          // 2. Call verify API on successful authorization simulation
          const verifyResp = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: order.id,
              razorpay_payment_id: "pay_rzp_mock_" + Math.random().toString(36).substr(2, 9),
              exchangeId: order.exchangeId
            })
          });
          
          if (verifyResp.ok) {
            const result = await verifyResp.json();
            setPaymentStep("success");
            onSuccess(result.exchange);
            toast.show("Payment complete! Download receipt.", "success");
          } else {
            throw new Error("Payment verification mismatch");
          }
        } catch (authErr) {
          toast.show("Payment authorized check error", "error");
          setPaymentStep("method");
        }
      }, 1800);
      
    } catch (err) {
      console.error(err);
      toast.show("Payment gateway initialization aborted", "error");
    }
  };

  const downloadReceipt = () => {
    // Directly triggers the backend plain text receipt generator
    window.location.href = `/api/exchanges/${exchange.id}/pdf`;
  };

  return (
    <div id="payment-gateway-wrapper" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
        
        {/* Header */}
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-900 text-base">MediLoop Secure Checkout</h3>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Gateway: Razorpay Native</span>
          </div>
          {paymentStep !== "processing" && (
            <button 
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Dynamic Steps */}
        {paymentStep === "method" && (
          <div className="p-6 space-y-5 flex-1">
            {/* Bill summary banner */}
            <div className="p-4 bg-teal-50 rounded-xl border border-teal-100">
              <span className="text-xs font-semibold text-teal-800 block">Transaction match summary</span>
              <h4 className="text-sm font-bold text-slate-900 mt-1">{exchange.medicineName}</h4>
              <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-teal-200/50">
                <span className="text-xs text-slate-500">Handling & Match logistics fee</span>
                <span className="text-sm font-extrabold text-teal-800">₹{exchange.amount}.00</span>
              </div>
            </div>

            {/* Select options */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Select Payment Method</span>
              
              {/* Option A: Debit/Credit cards */}
              <button
                onClick={() => setSelectedMethod("card")}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                  selectedMethod === "card" ? "border-teal-600 bg-teal-50/10 shadow-sm" : "border-slate-100 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-teal-50 flex items-center justify-center rounded-lg text-teal-600">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Credit or Debit Card</span>
                    <span className="text-[10px] text-slate-400 block">Visa, MasterCard, RuPay, Maestro</span>
                  </div>
                </div>
                <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${selectedMethod === "card" ? "border-teal-600" : "border-slate-300"}`}>
                  {selectedMethod === "card" && <div className="h-2 w-2 bg-teal-600 rounded-full" />}
                </div>
              </button>

              {/* Option B: UPI (Google Pay, PhonePe, Paytm) */}
              <button
                onClick={() => setSelectedMethod("upi")}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all mt-2.5 ${
                  selectedMethod === "upi" ? "border-teal-600 bg-teal-50/10 shadow-sm" : "border-slate-100 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-emerald-50 flex items-center justify-center rounded-lg text-emerald-600">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">UPI Instant Payment</span>
                    <span className="text-[10px] text-slate-400 block">GPay, PhonePe, Paytm, BHIM UPI</span>
                  </div>
                </div>
                <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${selectedMethod === "upi" ? "border-teal-600" : "border-slate-300"}`}>
                  {selectedMethod === "upi" && <div className="h-2 w-2 bg-teal-600 rounded-full" />}
                </div>
              </button>
            </div>

            {/* Input Details based on selection */}
            {selectedMethod === "card" ? (
              <div className="p-3.5 bg-slate-50 rounded-xl space-y-3 font-mono text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold block mb-1">CARD NUMBER</label>
                  <input 
                    type="text" 
                    value={cardNumber} 
                    onChange={e => setCardNumber(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:border-teal-600"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-1">EXPIRY</label>
                    <input 
                      type="text" 
                      value={cardExpiry} 
                      onChange={e => setCardExpiry(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:border-teal-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-1">CVV SECURE</label>
                    <input 
                      type="password" 
                      value={cardCvv} 
                      onChange={e => setCardCvv(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:border-teal-600"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-slate-50 rounded-xl space-y-2 font-mono text-xs">
                <label className="text-[10px] text-slate-400 font-bold block mb-1">UPI VIRTUAL PRIVATE ADDRESS</label>
                <input 
                  type="text" 
                  value={vpaid} 
                  onChange={e => setVpaid(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:border-teal-600"
                  placeholder="name@upi"
                />
                <span className="text-[9px] text-slate-400 font-sans block mt-1">A prompt notification will simulate on authorization step.</span>
              </div>
            )}

            {/* Pay Button */}
            <button
              onClick={handlePaymentInitiation}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-800 hover:to-teal-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 text-sm cursor-pointer"
            >
              Authorize Razorpay Payment
              <ArrowRight className="h-4 w-4" />
            </button>
            
            <div className="flex justify-center items-center gap-1.5 text-[10px] text-slate-400 font-sans text-center">
              <ShieldCheck className="h-4 w-4 text-teal-600" />
              <span>PCI-DSS Compliant Encryption Standard</span>
            </div>
          </div>
        )}

        {{
          processing: (
            <div className="p-10 text-center space-y-5 flex-grow flex flex-col justify-center items-center">
              <div className="relative flex items-center justify-center">
                <div className="h-16 w-16 rounded-full border-4 border-teal-100 border-t-teal-600 animate-spin" />
                <img src="/logo.svg" alt="Auth" className="h-7 w-7 absolute" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 text-sm">Verifying Signature Handshake</h4>
                <p className="text-xs text-slate-400">Communicating order verification with Razorpay servers...</p>
              </div>
            </div>
          ),
          success: (
            <div className="p-8 text-center space-y-6 flex-grow flex flex-col justify-center items-center">
              <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl animate-ripple shadow-md">
                ✓
              </div>
              <div className="space-y-1.5">
                <h4 className="font-extrabold text-slate-900 text-base">Payment Successful!</h4>
                <p className="text-xs text-slate-500 leading-normal px-4">
                  Seamless match point order established. Preventing waste & helping the community.
                </p>
              </div>

              {/* Transaction block */}
              <div className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-left font-mono text-[10px] text-slate-600 space-y-1">
                <div>ORDER ID: <span className="font-bold text-slate-900">OR_RZP_MATCH_881</span></div>
                <div>METHOD: <span className="font-bold text-slate-900">{selectedMethod.toUpperCase()}</span></div>
                <div>STATE: <span className="text-emerald-600 font-bold">PAID SECURE</span></div>
              </div>

              <div className="flex flex-col gap-2.5 w-full">
                <button
                  onClick={downloadReceipt}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-md hover:-translate-y-0.5 transition"
                >
                  <Download className="h-4 w-4" />
                  Download Match PDF Receipt
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-2.5 hover:bg-slate-50 text-slate-500 hover:text-slate-700 rounded-xl text-xs font-medium transition"
                >
                  Close Receipt Screen
                </button>
              </div>
            </div>
          )
        }[paymentStep as "processing" | "success"]}

      </div>
    </div>
  );
}
