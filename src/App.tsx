import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./components/AppContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages
import LandingPage from "./pages/LandingPage";
import Marketplace from "./pages/Marketplace";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";

// Protected Route Gateway wrapper to avoid React 19 blank flashes
function GuardedDashboard() {
  const { currentUser } = useApp();
  if (!currentUser) {
    // If not logged in, display the beautiful Auth page instead of blank or redirect crash
    return (
      <div className="space-y-4 py-8">
        <div className="max-w-md mx-auto p-4 bg-teal-50 border border-teal-100 rounded-2xl text-center text-xs text-teal-800 font-semibold">
          🔒 Dashboard screen requires authentication. Please log in or register below to gain access.
        </div>
        <AuthPage />
      </div>
    );
  }
  return <Dashboard />;
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen font-sans bg-slate-50 text-slate-800 selection:bg-teal-500/10 selection:text-teal-900 transition-colors duration-200">
          
          {/* Main Navigation Header */}
          <Navbar />

          {/* Router Content Layout */}
          <main className="flex-grow">
            <Routes>
              {/* Landing Home Page */}
              <Route path="/" element={<LandingPage />} />
              
              {/* Marketplace Explorer */}
              <Route path="/marketplace" element={<Marketplace />} />
              
              {/* Authentication Credentials entry */}
              <Route path="/auth" element={<AuthPage />} />
              
              {/* Dashboard stats center */}
              <Route path="/dashboard" element={<GuardedDashboard />} />
              
              {/* Fallback unknown routes */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Corporate Footer */}
          <Footer />

        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
