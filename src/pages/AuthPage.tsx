import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../components/AppContext";
import { ShieldAlert, ArrowRight, CheckCircle2, User, Key, Mail } from "lucide-react";

export default function AuthPage() {
  const { login, register, toast } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"login" | "register" | "forgot">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // Simulated email link triggers
  const [forgotEmailSent, setForgotEmailSent] = useState(false);

  // Demo logging assistance buttons
  const triggerDemoAccount = async (role: "user" | "admin") => {
    setLoading(true);
    let u = "MedUser";
    let p = "123456";

    if (role === "admin") {
      u = "AdminUser";
      p = "Admin@123";
    }

    const ok = await login(u, p);
    setLoading(false);
    if (ok) {
      navigate("/dashboard");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (activeTab === "login") {
      const ok = await login(username, password);
      if (ok) {
        navigate("/dashboard");
      }
    } else if (activeTab === "register") {
      if (!username.trim() || !email.trim()) {
        toast.show("Username and email are mandatory!", "error");
        setLoading(false);
        return;
      }
      const ok = await register(username, email);
      if (ok) {
        navigate("/dashboard");
      }
    } else {
      // Simulate Forgot Password flow
      if (!email.trim()) {
        toast.show("Please enter an email address", "warning");
        setLoading(false);
        return;
      }
      setTimeout(() => {
        setForgotEmailSent(true);
        toast.show("Simulated reset email dispatched!", "success");
        setLoading(false);
      }, 1200);
      return;
    }

    setLoading(false);
  };

  return (
    <div id="auth-panel-wrapper" className="min-h-[80vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-slate-50 font-sans text-slate-800">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-3xl border border-slate-100 shadow-xl relative overflow-hidden">
        
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 h-24 w-24 bg-teal-500/10 rounded-full blur-xl" />

        {/* Brand header */}
        <div className="text-center space-y-2">
          <img src="/logo.svg" alt="MediLoop" className="h-12 w-12 mx-auto bg-teal-50 rounded-2xl p-1 shadow-sm" />
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {activeTab === "login" ? "Welcome back to MediLoop" : activeTab === "register" ? "Create your MediLoop profile" : "Reset Safe Password"}
          </h2>
          <p className="text-xs text-slate-400">Connecting Care. Reducing Waste.</p>
        </div>

        {/* Tabs picker */}
        {activeTab !== "forgot" && (
          <div className="flex bg-slate-50 p-1.5 rounded-xl border border-slate-100">
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all focus:outline-none ${
                activeTab === "login" ? "bg-white text-teal-800 shadow-sm" : "text-slate-400 hover:text-slate-700"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all focus:outline-none ${
                activeTab === "register" ? "bg-white text-teal-800 shadow-sm" : "text-slate-400 hover:text-slate-700"
              }`}
            >
              Register Account
            </button>
          </div>
        )}

        {/* Demo profiles quick clicks */}
        {activeTab === "login" && (
          <div className="p-4 bg-teal-50 rounded-2xl border border-teal-100 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800 uppercase tracking-wider">
              <ShieldAlert className="h-4 w-4" />
              <span>Developer Quick Logins</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-normal">Bypass typing. Click below to boot test sessions instantly:</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => triggerDemoAccount("user")}
                className="py-2 bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-800 hover:to-teal-700 text-white font-bold rounded-xl text-[10px] shadow-sm tracking-wide focus:outline-none"
              >
                MedUser (General)
              </button>
              <button
                type="button"
                onClick={() => triggerDemoAccount("admin")}
                className="py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-[10px] shadow-sm tracking-wide focus:outline-none"
              >
                AdminUser (Admin)
              </button>
            </div>
          </div>
        )}

        {/* Form content */}
        {!forgotEmailSent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Username field */}
            {activeTab !== "forgot" && (
              <div className="relative">
                <label className="text-[10px] font-bold text-slate-400 block mb-1">USERNAME OR FULL NAME</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4.5 w-4.5" />
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:border-teal-600 transition"
                    placeholder="e.g. MedUser, Ravindra"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Email field */}
            {(activeTab === "register" || activeTab === "forgot") && (
              <div className="relative">
                <label className="text-[10px] font-bold text-slate-400 block mb-1">EMAIL ADDRESS</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4.5 w-4.5" />
                  <input
                    type="email"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:border-teal-600 transition"
                    placeholder="name@gmail.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Password field */}
            {activeTab === "login" && (
              <div className="relative">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold text-slate-400">PASSWORD</label>
                  <button
                    type="button"
                    onClick={() => setActiveTab("forgot")}
                    className="text-[10px] font-bold text-teal-600 hover:text-teal-800 focus:outline-none"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4.5 w-4.5" />
                  <input
                    type="password"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:border-teal-600 transition"
                    placeholder="Enter security key password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-1 px-5 py-3.5 bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-800 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-lg hover:shadow-xl transition cursor-pointer"
            >
              {loading ? "Processing credentials..." : activeTab === "login" ? "Sign In Secure" : activeTab === "register" ? "Create Profile Register" : "Submit Password Reset"}
              <ArrowRight className="h-4 w-4" />
            </button>

          </form>
        ) : (
          /* Forgot password simulation confirmation screen */
          <div className="p-6 text-center space-y-4 animate-fade-in">
            <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xl mx-auto">
              ✓
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-slate-900 text-sm">Simulated Email Dispatched</h4>
              <p className="text-xs text-slate-500 leading-normal">We sent a reset link to <span className="font-bold">{email}</span>. Click below to return to credentials portal.</p>
            </div>
            <button
              onClick={() => {
                setForgotEmailSent(false);
                setActiveTab("login");
              }}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
            >
              Return to Login Page
            </button>
          </div>
        )}

        {/* Back option mapping */}
        {activeTab === "forgot" && !forgotEmailSent && (
          <div className="text-center mt-3">
            <button
              onClick={() => setActiveTab("login")}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 transition focus:outline-none"
            >
              Back to Login credentials
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
