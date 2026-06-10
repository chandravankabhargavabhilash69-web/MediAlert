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
              </p>

              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                <Link
                  to="/marketplace"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 cursor-pointer"
                >
                  Explore Marketplace
                  <ArrowRight className="h-4.5 w-4.5" />
                </Link>
                {!currentUser && (
                  <Link
                    to="/auth"
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white border border-slate-200 text-slate-700 hover:text-teal-600 hover:bg-slate-50 rounded-xl text-sm font-semibold shadow-sm transition-all hover:-translate-y-0.5"
                  >
                    Register Profile
                  </Link>
                )}
              </div>
              
              {/* Trust badges */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-center lg:justify-start gap-6 text-xs text-slate-400 font-medium">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4.5 w-4.5 text-teal-600" />
                  <span>Verified Drug Batch</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <UserCheck className="h-4.5 w-4.5 text-teal-600" />
                  <span>KGH Logistics matched</span>
                </div>
              </div>
            </div>

            {/* Right block: Graphic representation of startup app */}
            <div className="flex justify-center relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 bg-teal-300 rounded-full filter blur-3xl opacity-30 animate-pulse-slow" />
              <div className="relative bg-white/90 backdrop-blur border border-slate-100/80 p-6 rounded-3xl shadow-2xl w-full max-w-md animate-float font-sans">
                
                {/* Header widget */}
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block">Live Exchange Stream</span>
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                </div>

                <div className="space-y-4">
                  {/* Dynamic Match Card Block */}
                  <div className="flex gap-3.5 items-center p-3 border border-emerald-100 bg-emerald-50/40 rounded-2xl relative">
                    <img 
                      src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100&q=80" 
                      alt="Medic" 
                      className="h-12 w-12 rounded-xl object-cover" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 text-left leading-normal">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase">Rescued Safe Swap</span>
                      <h4 className="text-xs font-bold text-slate-900 block mt-0.5">Amoxicillin 500mg</h4>
                      <p className="text-[10px] text-slate-400">Match in MVP Colony • CARE Hospitals</p>
                    </div>
                    <span className="text-xs font-bold text-slate-900 shrink-0">₹0 (Free)</span>
                  </div>

                  {/* Dynamic Match Card Block B */}
                  <div className="flex gap-3.5 items-center p-3 border border-slate-100 bg-slate-50/50 rounded-2xl relative">
                    <img 
                      src="https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=100&q=80" 
                      alt="Medic" 
                      className="h-12 w-12 rounded-xl object-cover" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 text-left leading-normal">
                      <span className="text-[10px] font-bold text-teal-600 uppercase">Donation</span>
                      <h4 className="text-xs font-bold text-slate-900 block mt-0.5">Paracetamol 650mg</h4>
                      <p className="text-[10px] text-slate-400">Match in Dwaraka Nagar • SevenHills</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 shrink-0">Verified</span>
                  </div>
                </div>

                {/* Footer status widget */}
                <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                  <span className="text-[11px] text-slate-400 font-bold block">480+ swaps preventing pharmaceutical landfill leaching.</span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white border-y border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((st, i) => (
              <div key={i} className="text-center space-y-1">
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 block tracking-tight">{st.value}</span>
                <span className="text-xs sm:text-sm text-slate-500 font-medium block">{st.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          
          <div className="max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-extrabold text-teal-600 uppercase tracking-widest block">Safe Ecosystem</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">Key Ecosystem Core Features</h2>
            <p className="text-sm text-slate-500 leading-normal">MediLoop is built to solve prescription handling security and local matching coordination.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feat, i) => (
              <div 
                key={i} 
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition duration-200 text-left space-y-4"
              >
                <div className="h-12 w-12 bg-teal-50 flex items-center justify-center rounded-xl">
                  {feat.icon}
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-bold text-slate-900 text-base">{feat.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-normal">{feat.description}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-teal-600 uppercase tracking-wide block">Got doubts?</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-slate-100 rounded-2xl bg-slate-50/50 overflow-hidden transition-all duration-300">
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full flex justify-between items-center px-6 py-4.5 text-left font-bold text-slate-900 text-xs sm:text-sm focus:outline-none"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`h-4.5 w-4.5 text-slate-400 transition-transform duration-300 ${activeFaq === i ? "rotate-180" : ""}`} />
                </button>
                {activeFaq === i && (
                  <div className="px-6 pb-5 pt-1 text-xs text-slate-500 leading-relaxed border-t border-slate-100 bg-white">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Healthcare Partners Section */}
      <section className="py-12 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Governed in coordination with</span>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70">
            <span className="text-sm font-extrabold text-slate-600 bg-white border px-4 py-2 rounded-xl text-center">Apollo Hospitals</span>
            <span className="text-sm font-extrabold text-slate-600 bg-white border px-4 py-2 rounded-xl text-center">CARE Hospitals</span>
            <span className="text-sm font-extrabold text-slate-600 bg-white border px-4 py-2 rounded-xl text-center">SevenHills Hospital</span>
            <span className="text-sm font-extrabold text-slate-600 bg-white border px-4 py-2 rounded-xl text-center">Visakhapatnam King George Hospital (KGH)</span>
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="relative py-20 bg-gradient-to-r from-teal-800 to-teal-700 overflow-hidden text-center text-white">
        
        {/* Glow decoration */}
        <div className="absolute top-0 right-1/4 -z-10 h-72 w-72 bg-emerald-400 blur-3xl opacity-20" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6 relative">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Ready to minimize medicine waste?</h2>
          <p className="text-sm text-teal-100 max-w-xl mx-auto leading-relaxed">
            Create your account today, verify your medicine strips, and help your neighbors in Visakhapatnam access key treatments safely.
          </p>
          <div className="pt-2">
            <Link
              to="/marketplace"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-teal-800 rounded-xl text-sm font-bold shadow-xl hover:-translate-y-0.5 transition cursor-pointer"
            >
              Start Swapping Now
              <ArrowRight className="h-4.5 w-4.5" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
