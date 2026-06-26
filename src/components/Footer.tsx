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
              <img src="/logo.svg" alt="MediAlert" className="h-9 w-9 bg-white/10 rounded-lg p-1" />
              <span className="text-xl font-bold text-white tracking-tight">
                Medi<span className="text-teal-400">Loop</span>
                Medi<span className="text-teal-400">Alert</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-400">
            <div className="text-xs space-y-2">
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-teal-400" />
                <span>vsp-team@mediloop.care</span>
                <span>vsp-team@medialert.care</span>
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
          <p>© 2026 MediAlert Project. All rights reserved. Designed for Visakhapatnam Green Municipal Care.</p>
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
