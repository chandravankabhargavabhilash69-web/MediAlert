import React from "react";
import { Link } from "react-router-dom";
import { Recycle, Pill, Heart, Shield, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer id="app-footer-bar" className="bg-slate-900 text-slate-400 mt-auto font-sans">
      
      {/* Upper footer columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Column 1: Brand pitch and vision statement */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.svg" alt="MediLoop" className="h-9 w-9 bg-white/10 rounded-lg p-1" />
              <span className="text-xl font-bold text-white tracking-tight">
                Medi<span className="text-teal-400">Loop</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-400">
              A healthcare-green start-swap concept built to minimize medicine wastage, recycle unused medicines safely, and provide low-cost medicinal assistance to Visakhapatnam communities.
            </p>
            <div className="flex items-center gap-3 text-emerald-400 font-semibold text-xs py-1">
              <Shield className="h-4 w-4" />
              <span>Drug-Safety Verified Scheme</span>
            </div>
          </div>

          {/* Column 2: Visakhapatnam Hub Info */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Vizag Match Hubs</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex gap-2 items-start text-xs text-slate-400">
                <MapPin className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                <span>Primary Partner: King George Hospital (KGH), Visakhapatnam - 530002</span>
              </li>
              <li className="flex gap-2 items-start text-xs text-slate-400">
                <MapPin className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                <span>Zone B: SevenHills drop points (Dwaraka Nagar)</span>
              </li>
              <li className="flex gap-2 items-start text-xs text-slate-400 text-teal-300">
                <MapPin className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                <span>Nearest Matching Engine Enabled</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Navigation */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Resources</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-teal-400 transition">How it Works</Link>
              </li>
              <li>
                <Link to="/marketplace" className="hover:text-teal-400 transition">Search Marketplace</Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-teal-400 transition">Manage Medicine Expiries</Link>
              </li>
              <li className="text-slate-500">
                <span>Terms of Medical Verification</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Verification */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-3">Support Channel</h4>
            <div className="text-xs space-y-2">
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-teal-400" />
                <span>vsp-team@mediloop.care</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-teal-400" />
                <span>+91 891 2542 331</span>
              </p>
              <p className="text-[10px] text-slate-500 italic mt-1 font-medium leading-normal">
                Connecting Care. Reducing Waste. Our daily cron check operates automatically at 23:59 UTC.
              </p>
            </div>
          </div>

        </div>

        {/* Separator line */}
        <hr className="border-slate-800 my-8" />

        {/* Bottom copyright and dedication details */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© 2026 MediLoop Project. All rights reserved. Designed for Visakhapatnam Green Municipal Care.</p>
          <div className="flex items-center gap-1">
            <span>Made with</span>
            <Heart className="h-3 w-3 text-teal-400 fill-teal-400" />
            <span>for a Healthier Tomorrow</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
