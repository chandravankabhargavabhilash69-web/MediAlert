import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useApp } from "./AppContext";
import { Recycle, Pill, Bell, Menu, X, User, LogOut, LogIn, ShieldAlert } from "lucide-react";

export default function Navbar() {
  const { currentUser, logout, notifications, markNotificationsAsRead } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotifClick = () => {
    setNotifMenuOpen(!notifMenuOpen);
    if (!notifMenuOpen && unreadCount > 0) {
      markNotificationsAsRead();
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav id="app-navigation-bar" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all duration-200 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Logo Brand Section */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="h-10 w-10 overflow-hidden rounded-xl flex items-center justify-center bg-teal-50 group-hover:scale-105 transition-all duration-300">
                <img src="/logo.svg" alt="MediLoop" className="h-8 w-8" />
              </div>
              <div>
                <span className="text-xl font-bold text-slate-900 tracking-tight block">
                  Medi<span className="text-teal-600">Loop</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase block -mt-1">
                  Connecting Care
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-3">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive("/") ? "bg-teal-50 text-teal-700" : "text-slate-600 hover:text-teal-600 hover:bg-slate-50"
              }`}
            >
              Home
            </Link>
            <Link
              to="/marketplace"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive("/marketplace") ? "bg-teal-50 text-teal-700" : "text-slate-600 hover:text-teal-600 hover:bg-slate-50"
              }`}
            >
              Marketplace
            </Link>
            {currentUser && (
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/dashboard") ? "bg-teal-50 text-teal-700" : "text-slate-600 hover:text-teal-600 hover:bg-slate-50"
                }`}
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* Right Action Section */}
          <div className="hidden md:flex items-center space-x-4">
            
            {/* Dynamic Notifications bell drops */}
            {currentUser && (
              <div className="relative">
                <button
                  id="notifications-button"
                  onClick={handleNotifClick}
                  className="p-2 rounded-full text-slate-500 hover:text-teal-600 hover:bg-teal-50 transition-all duration-200 relative focus:outline-none"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Panel Box */}
                {notifMenuOpen && (
                  <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden font-sans">
                    <div className="px-4 py-3 bg-gradient-to-r from-teal-700 to-teal-600 text-white flex justify-between items-center">
                      <span className="font-semibold text-sm">System Alerts ({notifications.length})</span>
                      <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Live Simulation</span>
                    </div>
                    <div className="max-h-72 overflow-y-auto split-y divide-y divide-slate-50">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-center text-slate-400 text-sm">
                          No pending notifications
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div key={n.id} className={`p-3.5 hover:bg-slate-50 transition-colors ${!n.read ? "bg-teal-50/20" : ""}`}>
                            <div className="flex gap-2.5 items-start">
                              <span className="text-lg mt-0.5">
                                {n.type === "danger" ? "❌" : n.type === "warning" ? "⚠️" : n.type === "success" ? "🎉" : "🛡️"}
                              </span>
                              <div className="flex-1">
                                <h4 className="text-xs font-semibold text-slate-800">{n.title}</h4>
                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                                <span className="text-[10px] text-slate-400 block mt-1">
                                  {new Date(n.createdAt).toLocaleTimeString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-2 border-t border-slate-50 bg-slate-50/50 text-center">
                      <button 
                        onClick={() => setNotifMenuOpen(false)}
                        className="text-xs font-semibold text-teal-600 hover:text-teal-800 focus:outline-none"
                      >
                        Close Panel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Active User session info */}
            {currentUser ? (
              <div className="flex items-center space-x-3">
                <Link to="/dashboard" className="flex items-center space-x-2 p-1.5 hover:bg-slate-50 rounded-xl transition-all duration-200">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-teal-600 to-teal-400 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                    {currentUser.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left leading-tight">
                    <span className="text-xs font-semibold text-slate-800 block">{currentUser.username}</span>
                    <span className="text-[9px] font-bold text-teal-600 uppercase tracking-widest block">
                      {currentUser.role}
                    </span>
                  </div>
                </Link>
                <button
                  id="navbar-logout-btn"
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all duration-200"
                  title="Logout"
                >
                  <LogOut className="h-4.5 w-4.5" />
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
              >
                <LogIn className="h-4 w-4" />
                Get Started
              </Link>
            )}

          </div>

          {/* Mobile Menu Icon */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-all focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 py-3 px-4 space-y-2 animate-slide-in font-sans">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition"
          >
            Home
          </Link>
          <Link
            to="/marketplace"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition"
          >
            Marketplace
          </Link>
          {currentUser ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition"
              >
                My Dashboard
              </Link>
              <div className="border-t border-slate-50 pt-2 pb-1 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-bold">
                    {currentUser.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">{currentUser.username}</span>
                    <span className="text-[10px] text-teal-600 uppercase font-semibold">{currentUser.role}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    navigate("/");
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <Link
              to="/auth"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-teal-600"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
