import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../components/AppContext";
import { Recycle, ArrowRight, ShieldCheck, HeartPulse, UserCheck, ShieldAlert, Award, ChevronDown } from "lucide-react";
export default function LandingPage() {
  const { currentUser } = useApp();
  
  // FAQs collapse control state
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const stats = [
    { value: "480+", label: "Medicines Rescued" },
    { value: "120+", label: "Visakhapatnam Households Assisted" },
    { value: "₹45k+", label: "Pharma Out-of-Pocket Cost Saved" },
    { value: "98.4%", label: "Drug Match Verification Approval Rate" }
  ];
  const features = [
    {
      icon: <ShieldCheck className="h-6 w-6 text-teal-600" />,
      title: "Strict Drug Verification",
      description: "Our dedicated backend process checks batch listings and enforces prescription controls (Rx) under proper government guidelines."
    },
    {
      icon: <Recycle className="h-6 w-6 text-teal-600" />,
      title: "Circular Eco Swap",
      description: "List excess medicines safely. Instead of toxic landfill flushing, swap medicines or donate them directly to users in need."
    },
    {
      icon: <HeartPulse className="h-6 w-6 text-teal-600" />,
      title: "Visakhapatnam Matching",
      description: "Matched coordinate nodes mapped to Dwaraka Nagar, MVP Colony, Gajuwaka hospitals, King George Hospital, and local regions."
    }
  ];
  const faqs = [
    {
      q: "Can I list expired medicines on MediLoop?",
      a: "Absolutely not. Expired medicines are highly toxic when processed. Dynamic status checks automatically flag and block any list of expired drugs on the homepage."
    },
    {
      q: "How does the prescription (Rx) verification check work?",
      a: "Any medicine flagged as prescription-only requires scanning and administrator validation (AdminUser) in the active admin workspace before becoming public."
    },
    {
      q: "What are the shipping and handling logistics for Visakhapatnam?",
      a: "For general swaps, users coordinate exchanges locally near our hospital partner matchpoints (KGH, Care Hospitals, Apollo). For standard buys, we charge a flat ₹150 delivery and secure testing fee processed securely via Razorpay."
    }
  ];
  return (
    <div id="landing-page" className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-teal-50/10 to-slate-50/20 py-20 lg:py-28">
        
        {/* Glow decoration */}
        <div className="absolute top-0 left-1/2 -z-10 h-[600px] w-[1000px] -translate-x-1/2 bg-gradient-to-tr from-teal-100/50 to-emerald-50/30 blur-3xl opacity-60" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Block text pitch */}
            <div className="space-y-6 lg:max-w-xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 border border-teal-100 text-teal-800 rounded-full text-xs font-bold shadow-sm">
                <Award className="h-4 w-4" />
                <span>Winner: Green Municipal Med-Tech Node</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight">
                Connecting Care.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600">
                  Reducing Waste.
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-500 leading-relaxed font-medium">
                Prevent life-saving drug waste. MediLoop is a secure, modern medicine exchange and expiry management ecosystem that matches unused, verified medicines with families in Visakhapatnam.
                Prevent life-saving drug waste. MediAlert is a secure, modern medicine exchange and expiry management ecosystem that matches unused, verified medicines with families in Visakhapatnam.
              </p>
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
          <div className="max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-extrabold text-teal-600 uppercase tracking-widest block">Safe Ecosystem</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">Key Ecosystem Core Features</h2>
            <p className="text-sm text-slate-500 leading-normal">MediLoop is built to solve prescription handling security and local matching coordination.</p>
            <p className="text-sm text-slate-500 leading-normal">MediAlert is built to solve prescription handling security and local matching coordination.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
  );
}
