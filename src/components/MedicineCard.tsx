import React, { useState } from "react";
import { Medicine, Exchange } from "../types";
import { useApp } from "./AppContext";
import { QRCodeSVG } from "qrcode.react"; // Standard React 19-safe render sub-component
import { MapPin, ShieldCheck, Heart, AlertTriangle, QrCode, ClipboardCheck } from "lucide-react";
import PaymentModal from "./PaymentModal";
import { apiClient } from "../utils/apiClient";
interface MedicineCardProps {
  key?: string | number;
  medicine: Medicine;
  onActionComplete?: () => void;
  onEdit?: (med: Medicine) => void;
  onDelete?: (id: string) => void;
}
export default function MedicineCard({ medicine, onActionComplete, onEdit, onDelete }: MedicineCardProps) {
  const { currentUser, toast } = testHookHelper();
  
  // Local hook helpers wrapper to prevent React 19 context binding latency
  function testHookHelper() {
    return useApp();
  }
  const [qrOpen, setQrOpen] = useState(false);
  const [favorite, setFavorite] = useState(() => {
    const saved = localStorage.getItem(`mediloop_fav_${medicine.id}`);
    const saved = localStorage.getItem(`medialert_fav_${medicine.id}`);
    return saved === "true";
  });
  
  const [activePaymentExchange, setActivePaymentExchange] = useState<Exchange | null>(null);
  const toggleFavorite = () => {
    const state = !favorite;
    setFavorite(state);
    localStorage.setItem(`mediloop_fav_${medicine.id}`, String(state));
    localStorage.setItem(`medialert_fav_${medicine.id}`, String(state));
    toast.show(state ? "Added to favorites!" : "Removed from favorites", "info");
  };
  const today = new Date("2026-06-10");
  const expiry = new Date(medicine.expiryDate);
  const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  // Determine Expiry Colors & Badges
  // Green: > 90 days. Yellow: 30-90 days. Red: < 30 days
  let expiryColorClass = "text-emerald-600 bg-emerald-50 border-emerald-100";
  let borderClass = "border-slate-100 focus-within:ring-teal-100";
  let indicatorColor = "bg-emerald-500";
  if (medicine.status === "Expired") {
    expiryColorClass = "text-rose-600 bg-rose-50 border-rose-100";
    borderClass = "border-rose-100 opacity-75 focus-within:ring-rose-500/20";
    indicatorColor = "bg-rose-500";
  } else if (diffDays <= 30) {
    expiryColorClass = "text-rose-600 bg-rose-50 border-rose-100 animate-pulse-slow";
    borderClass = "border-amber-200 shadow-amber-50 focus-within:ring-amber-200/50";
    indicatorColor = "bg-rose-500";
  } else if (diffDays <= 90) {
    expiryColorClass = "text-amber-600 bg-amber-50 border-amber-100";
    borderClass = "border-amber-100 focus-within:ring-amber-100";
    indicatorColor = "bg-amber-400";
  }
  const handleTransactionRequest = async (transactionType: "Exchange" | "Donate" | "Buy") => {
    if (!currentUser) {
      toast.show("Please login to request or swap medicines", "warning");
      return;
    }
    if (medicine.status === "Expired") {
      toast.show("Expired medicines cannot be exchanged core safety rules", "error");
      return;
    }
    const handlingFee = transactionType === "Buy" ? 150 : 0; // ₹150 delivery/handling fee for standard buys
    try {
      const resp = await fetch("/api/exchanges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicineId: medicine.id,
          requestedBy: currentUser.id,
          type: transactionType,
          recipientLocation: currentUser.username === "MedUser" ? "MVP Colony" : "Dwaraka Nagar",
          amount: handlingFee
        })
      const resp = await apiClient.post<Exchange>("/api/exchanges", {
        medicineId: medicine.id,
        requestedBy: currentUser.id,
        type: transactionType,
        recipientLocation: currentUser.username === "MedUser" ? "MVP Colony" : "Dwaraka Nagar",
        amount: handlingFee
      });
      if (resp.ok) {
        const exchange: Exchange = await resp.json();
        const exchange = await resp.json();
        
        if (transactionType === "Buy") {
          // Open Payment gateway checkout modal directly
          setActivePaymentExchange(exchange);
        } else {
          toast.show(`Seamless request registered! Matched logistics at ${medicine.location}.`, "success");
          if (onActionComplete) onActionComplete();
        }
      } else {
        const err = await resp.json();
        const err = await resp.json() as any;
        toast.show(err.error || "Request failed", "error");
      }
    } catch (err) {
      console.error(err);
      toast.show("Gateway matching error", "error");
    }
  };
  const handleVerifyMedicine = async () => {
    try {
      const resp = await fetch(`/api/medicines/${medicine.id}/verify`, {
        method: "POST"
      });
      const resp = await apiClient.post(`/api/medicines/${medicine.id}/verify`);
      if (resp.ok) {
        toast.show("Medicine listing successfully verified", "success");
        if (onActionComplete) onActionComplete();
      }
    } catch (err) {
      console.error(err);
    }
  };
  // Generate QR Payload String
  const qrMockPayload = JSON.stringify({
    med: medicine.medicineName,
    manufacturer: medicine.manufacturer,
    batch: medicine.batchNumber,
    exp: medicine.expiryDate,
    status: medicine.status,
    origin: "MediLoop-Trust"
    origin: "MediAlert-Trust"
  });
  const isOwner = currentUser?.id === medicine.listedBy;
  const isAdmin = currentUser?.role === "admin";
  return (
    <div id={`medicine-card-${medicine.id}`} className={`bg-white rounded-2xl border ${borderClass} shadow-md overflow-hidden relative flex flex-col font-sans transition-all duration-300 hover:shadow-xl`}>
      
      {/* Top Banner Expiry Status indicator */}
      <div className="absolute top-3.5 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 z-10 shadow-sm bg-white border border-slate-100">
        <span className={`h-2 w-2 rounded-full ${indicatorColor}`} />
        <span className="text-slate-800">
          {medicine.status === "Expired" ? "Expired Disposal" : diffDays <= 30 ? "Urgent Swap" : "Quality Safe"}
        </span>
      </div>
      {/* Prescription Requirement Tag */}
      {medicine.prescriptionRequired && (
        <div className="absolute top-3.5 right-3.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-100 z-10 shadow-sm flex items-center gap-1">
          <span>Rx Needed</span>
        </div>
      )}
      {/* Main Image Section */}
      <div className="relative h-44 bg-slate-100 overflow-hidden group">
        <img 
          src={medicine.medicineImages[0] || "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&q=80"} 
          alt={medicine.medicineName} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        
        {/* Verification Status Flag Overlay */}
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium py-1 px-2.5 rounded-lg flex items-center gap-1.5">
          {medicine.verified ? (
            <>
              <ShieldCheck className="h-3.5 w-3.5 text-teal-400" />
              <span>Drug Verified</span>
            </>
          ) : (
            <>
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
              <span>Pending Verify Check</span>
            </>
          )}
        </div>
        {/* Favorite heart overlay button */}
        <button 
          onClick={toggleFavorite}
          className="absolute bottom-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full text-slate-500 hover:text-rose-600 shadow-md transition-all focus:outline-none"
        >
          <Heart className={`h-4 w-4 ${favorite ? "fill-rose-500 text-rose-500" : ""}`} />
        </button>
      </div>
      {/* Description Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          
          <div className="flex justify-between items-start gap-1">
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm tracking-tight line-clamp-1">{medicine.medicineName}</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{medicine.manufacturer}</p>
            </div>
            <button 
              onClick={() => setQrOpen(!qrOpen)}
              className="p-1.5 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-500 transition focus:outline-none shrink-0"
              title="Show Safety Label QR"
            >
              <QrCode className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-slate-500 line-clamp-2 min-h-[2.5rem] leading-normal">{medicine.description}</p>
          {/* Quick Specifications Metadata */}
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100/50">
            <div>BATCH: <span className="font-bold text-slate-800">{medicine.batchNumber}</span></div>
            <div>QTY: <span className="font-bold text-slate-800">{medicine.quantity} strips</span></div>
            <div className="col-span-2">LOCATION: <span className="font-bold text-slate-800 flex items-center gap-0.5 inline-flex"><MapPin className="h-3 w-3 inline text-teal-600 shrink-0" />{medicine.location}</span></div>
          </div>
          {/* Expiry Badge and Days Counter */}
          <div className={`p-2 rounded-xl border text-center text-xs font-bold leading-normal flex items-center justify-between ${expiryColorClass}`}>
            <span>Expiry Date:</span>
            <div className="text-right">
              <span className="block">{new Date(medicine.expiryDate).toLocaleDateString("en-IN", { month: "short", year: "numeric", day: "numeric" })}</span>
              <span className="text-[9px] block font-medium uppercase tracking-wider">
                {medicine.status === "Expired" ? "Expired drug" : `${diffDays} days left`}
              </span>
            </div>
          </div>
          {/* Expanded QR Safety Box */}
          {qrOpen && (
            <div className="p-3 bg-slate-900 text-white rounded-xl flex gap-3 items-center animate-fade-in border border-slate-800">
              <div className="bg-white p-1 rounded-lg shrink-0">
                <QRCodeSVG value={qrMockPayload} size={65} />
              </div>
              <div className="text-left font-sans leading-normal">
                <span className="text-[10px] font-bold text-emerald-400 block tracking-wider uppercase">MediLoop Safety Label</span>
                <span className="text-[9px] text-slate-300 block font-mono mt-0.5">BATCH: {medicine.batchNumber}</span>
                <span className="text-[9px] text-slate-400 leading-none block mt-1">Scan barcode to verify pharmaceutical registry.</span>
              </div>
            </div>
          )}
        </div>
        {/* Action Button Set */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 grid grid-cols-1 gap-2">
          {isOwner ? (
            <div className="grid grid-cols-2 gap-2 w-full text-xs font-semibold">
              <button
                onClick={() => onEdit?.(medicine)}
                className="py-2 hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl transition focus:outline-none"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete?.(medicine.id)}
                className="py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition focus:outline-none"
              >
                Delete
              </button>
            </div>
          ) : isAdmin && !medicine.verified ? (
            <button
              onClick={handleVerifyMedicine}
              className="w-full inline-flex items-center justify-center gap-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition cursor-pointer"
            >
              <ClipboardCheck className="h-4 w-4" />
              Approve Listing (Admin)
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleTransactionRequest("Exchange")}
                disabled={medicine.status === "Expired"}
                className="py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-sm shadow-teal-600/20 hover:shadow-lg transition cursor-pointer"
              >
                Swap Exchange
              </button>
              <button
                onClick={() => handleTransactionRequest("Buy")}
                disabled={medicine.status === "Expired"}
                className="py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-sm transition cursor-pointer"
              >
                Buy (₹150 Fee)
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Razorpay Simulated checkout block overlay */}
      {activePaymentExchange && (
        <PaymentModal 
          exchange={activePaymentExchange}
          onSuccess={(updated) => {
            setActivePaymentExchange(null);
            if (onActionComplete) onActionComplete();
          }}
          onClose={() => {
            setActivePaymentExchange(null);
            if (onActionComplete) onActionComplete();
          }}
        />
      )}
    </div>
  );
}
