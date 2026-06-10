import React, { useState, useEffect } from "react";
import { useApp } from "../components/AppContext";
import { Medicine, Exchange, AnalyticsStats } from "../types";
import MedicineForm from "../components/MedicineForm";
import MedicineCard from "../components/MedicineCard";
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis
} from "recharts";
import { 
  LayoutDashboard, ClipboardList, ShieldCheck, Heart, AlertCircle, 
  Trash2, Download, RefreshCw, Calendar, Users, Ban
} from "lucide-react";

export default function Dashboard() {
  const { currentUser, triggerExpiryCheck, toast } = useApp();

  const [activeTab, setActiveTab] = useState<"overview" | "listings" | "exchanges" | "admin">("overview");

  // State data caches
  const [analytics, setAnalytics] = useState<AnalyticsStats | null>(null);
  const [myMedicines, setMyMedicines] = useState<Medicine[]>([]);
  const [myExchanges, setMyExchanges] = useState<Exchange[]>([]);
  const [allMedicinesPending, setAllMedicinesPending] = useState<Medicine[]>([]);

  // Editing logic toggle
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);

  const loadDashboardData = async () => {
    if (!currentUser) return;
    try {
      // 1. Fetch Analytics overview
      const analyticsResp = await fetch("/api/analytics");
      if (analyticsResp.ok) {
        const stats = await analyticsResp.json();
        setAnalytics(stats);
      }

      // 2. Fetch my listings matches
      // Pass listedBy query parameter
      const myMedResp = await fetch(`/api/medicines?listedBy=${currentUser.id}`);
      if (myMedResp.ok) {
        const meds = await myMedResp.json();
        setMyMedicines(meds);
      }

      // 3. Fetch exchanges transactions
      const excResp = await fetch(`/api/exchanges?userId=${currentUser.id}`);
      if (excResp.ok) {
        const list = await excResp.json();
        setMyExchanges(list);
      }

      // 4. Fetch all listings requiring admin approval if user is Admin
      if (currentUser.role === "admin") {
        const allPendingResp = await fetch("/api/medicines");
        if (allPendingResp.ok) {
          const listAll: Medicine[] = await allPendingResp.json();
          // Filter those unverified (pending prescription approval check)
          setAllMedicinesPending(listAll.filter(m => !m.verified));
        }
      }

    } catch (err) {
      console.error(err);
      toast.show("Dashboard synchronization failed", "error");
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [currentUser]);

  const handleCronSimulation = async () => {
    const updatedCount = await triggerExpiryCheck();
    loadDashboardData();
  };

  const handleEditMedicine = (med: Medicine) => {
    setEditingMedicine(med);
    setActiveTab("listings"); // redirect to listings tab to show editing form
  };

  const handleDeleteListing = async (id: string) => {
    const doubleCheck = window.confirm("Are you sure you want to delete this medicine listing? This action is permanent.");
    if (!doubleCheck) return;

    try {
      const resp = await fetch(`/api/medicines/${id}`, { method: "DELETE" });
      if (resp.ok) {
        toast.show("Listing removed safely", "success");
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditSuccess = () => {
    setEditingMedicine(null);
    loadDashboardData();
  };

  const handleDownloadInvoice = (excId: string) => {
    window.location.href = `/api/exchanges/${excId}/pdf`;
  };

  const isAdmin = currentUser?.role === "admin";

  return (
    <div id="dashboard-container" className="min-h-screen bg-slate-50 py-8 lg:py-12 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* User identification header panel */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-gradient-to-tr from-teal-700 to-teal-500 rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-md">
              {currentUser?.username.charAt(0).toUpperCase()}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-900">{currentUser?.username}'s Center</h1>
                <span className="text-[10px] bg-teal-50 text-teal-700 border border-teal-100 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {currentUser?.role} Mode
                </span>
              </div>
              <p className="text-xs text-slate-500">Manage medicine expiries, transactions, and environmental savings metrics.</p>
            </div>
          </div>
          
          {/* Quick triggers action */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleCronSimulation}
              className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow transition-all cursor-pointer"
              title="Runs daily cron check"
            >
              <RefreshCw className="h-4 w-4" />
              Simulate Daily Cron Check
            </button>
          </div>
        </div>

        {/* Categories Tab Navigation bar */}
        <div className="flex border-b border-slate-200 gap-6">
          <button
            onClick={() => { setEditingMedicine(null); setActiveTab("overview"); }}
            className={`border-b-2 pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 focus:outline-none transition-all ${
              activeTab === "overview" ? "border-teal-600 text-teal-700" : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            Overview Analytics
          </button>
          <button
            onClick={() => { setActiveTab("listings"); }}
            className={`border-b-2 pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 focus:outline-none transition-all ${
              activeTab === "listings" ? "border-teal-600 text-teal-700" : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <ClipboardList className="h-4 w-4" />
            My Listings ({myMedicines.length})
          </button>
          <button
            onClick={() => { setEditingMedicine(null); setActiveTab("exchanges"); }}
            className={`border-b-2 pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 focus:outline-none transition-all ${
              activeTab === "exchanges" ? "border-teal-600 text-teal-700" : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            Exchanges Match logs ({myExchanges.length})
          </button>
          {isAdmin && (
            <button
              onClick={() => { setEditingMedicine(null); setActiveTab("admin"); }}
              className={`border-b-2 pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 focus:outline-none transition-all ${
                activeTab === "admin" ? "border-teal-600 text-teal-700" : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <Calendar className="h-4 w-4" />
              Admin Portal ({allMedicinesPending.length} pending)
            </button>
          )}
        </div>

        {/* Dynamic Inner Tab Display Switch */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-fade-in">
            {/* Quick stats mini summaries */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-left">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Uploads Listed</span>
                <div className="flex justify-between items-baseline mt-2">
                  <span className="text-3xl font-extrabold text-slate-900">{analytics?.countTotal || 0}</span>
                  <span className="text-xs text-teal-600 font-bold">Rescued medicines</span>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-left">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Eco Prevention rate</span>
                <div className="flex justify-between items-baseline mt-2">
                  <span className="text-3xl font-extrabold text-slate-900">{analytics?.countVerified || 0}</span>
                  <span className="text-xs text-teal-600 font-bold">100% drug verified</span>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-left">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Healthy Exchanges</span>
                <div className="flex justify-between items-baseline mt-2">
                  <span className="text-3xl font-extrabold text-teal-600">{analytics?.successExchanges || 0}</span>
                  <span className="text-xs text-rose-600 font-bold flex items-center gap-0.5"><Heart className="h-3 w-3 fill-rose-500 text-rose-500" /> Preventing waste</span>
                </div>
              </div>
            </div>

            {/* Charts representation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Expiry distribution pie pool */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block mb-4">Expiry Risk Pool Distribution</span>
                <div className="h-64">
                  {analytics && analytics.distribution && analytics.distribution.some(d => d.value > 0) ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.distribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {analytics.distribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-slate-400">Loading risk metrics pool...</div>
                  )}
                </div>
              </div>

              {/* Recent activity timeline log */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-left overflow-hidden flex flex-col justify-between">
                <div>
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block mb-4">Ecosystem Transaction Stream</span>
                  <div className="space-y-4">
                    {analytics?.recentActivities && analytics.recentActivities.length > 0 ? (
                      analytics.recentActivities.map((act, idx) => (
                        <div key={idx} className="flex gap-3 items-center border-b border-slate-50 pb-3">
                          <div className="h-2.5 w-2.5 rounded-full bg-teal-500 shrink-0" />
                          <div className="flex-grow text-xs leading-none">
                            <p className="text-slate-800 font-semibold">{act.text}</p>
                            <span className="text-[10px] text-slate-400 block mt-1">Simulation Time: {act.time}</span>
                          </div>
                          <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-bold capitalize">
                            {act.status}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-slate-400">No transactions recorded inside simulation database yet.</div>
                    )}
                  </div>
                </div>
                
                {/* Visual quote indicator */}
                <div className="pt-4 mt-4 border-t border-slate-100 text-[11px] text-slate-400 italic">
                  * Note: Real-time logistics logs are matching nearby hospitals under the Visakhapatnam Green Care framework automatically.
                </div>
              </div>

            </div>
          </div>
        )}

        {activeTab === "listings" && (
          <div className="space-y-6 animate-fade-in text-left">
            
            {editingMedicine ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-teal-50 p-4 rounded-xl border border-teal-100">
                  <span className="text-xs font-bold text-teal-800">You are currently editing a published listing</span>
                  <button 
                    onClick={() => setEditingMedicine(null)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-700 focus:outline-none"
                  >
                    Discard Changes
                  </button>
                </div>
                <MedicineForm 
                  initialData={editingMedicine}
                  onSuccess={handleEditSuccess}
                  onCancel={() => setEditingMedicine(null)}
                />
              </div>
            ) : (
              /* Display owned uploads */
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-extrabold text-slate-900 text-sm tracking-wide">My Rescued Medicine Uploads</h3>
                  <span className="text-xs text-slate-400">{myMedicines.length} listings</span>
                </div>

                {myMedicines.length === 0 ? (
                  <div className="p-12 border border-dashed rounded-2xl text-center space-y-3 bg-white">
                    <ClipboardList className="h-9 w-9 text-slate-300 mx-auto" />
                    <h4 className="text-sm font-bold">No registered uploads</h4>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">Help reduce pharmaceutical toxic waste. Click on list medicine on marketplace to start.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myMedicines.map((med) => (
                      <MedicineCard 
                        key={med.id} 
                        medicine={med}
                        onActionComplete={loadDashboardData}
                        onEdit={handleEditMedicine}
                        onDelete={handleDeleteListing}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {activeTab === "exchanges" && (
          <div className="space-y-6 animate-fade-in text-left">
            <h3 className="font-extrabold text-slate-900 text-sm tracking-wide">Matches Transaction Logs</h3>
            
            {myExchanges.length === 0 ? (
              <div className="p-12 border border-dashed rounded-2xl text-center space-y-3 bg-white">
                <ShieldCheck className="h-9 w-9 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold">No active match requests found</h4>
                <p className="text-xs text-slate-400">Discover active medicine boxes in the marketplace and request swaps.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100">
                {myExchanges.map((exc) => (
                  <div key={exc.id} className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50/50 transition">
                    <div className="space-y-1 text-left">
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-slate-950 text-sm">{exc.medicineName}</h4>
                        <span className="text-[9px] bg-slate-900 text-white font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                          {exc.type}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono">ID: {exc.id.toUpperCase()} • DATE: {new Date(exc.createdAt).toLocaleDateString()}</p>
                      <p className="text-xs text-slate-500">Logistics status: <span className="font-semibold text-slate-800">{exc.status} matched at {exc.recipientLocation}</span></p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {exc.status === "Paid" && (
                        <button
                          onClick={() => handleDownloadInvoice(exc.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold focus:outline-none"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Get PDF Receipt
                        </button>
                      )}
                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                        exc.status === "Paid" || exc.status === "Approved" ? "bg-emerald-50 text-emerald-600" : "bg-teal-50 text-teal-600"
                      }`}>
                        {exc.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "admin" && isAdmin && (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="p-5 bg-slate-900 text-white rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-slate-800">
              <div className="space-y-1">
                <span className="text-xs font-bold text-teal-400 block tracking-wider uppercase">Administrative Control Node</span>
                <p className="text-xs text-slate-300">You are viewing the Visakhapatnam Drug Safety authorization deck. Approve prescription listings below.</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700 leading-tight">
                  <span className="block font-bold">Active Drugs</span>
                  <span className="text-teal-400 block font-extrabold text-sm mt-0.5">{analytics?.countTotal || 0}</span>
                </div>
                <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700 leading-tight">
                  <span className="block font-bold">Unchecked rx</span>
                  <span className="text-rose-400 block font-extrabold text-sm mt-0.5">{allMedicinesPending.length}</span>
                </div>
              </div>
            </div>

            {/* Approvals check table */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm tracking-wide">Prescription Approval Requests ({allMedicinesPending.length})</h3>
              
              {allMedicinesPending.length === 0 ? (
                <div className="p-12 border border-dashed rounded-2xl text-center space-y-2 bg-white">
                  <ShieldCheck className="h-9 w-9 text-emerald-600 mx-auto" />
                  <h4 className="text-sm font-bold">All prescriptions cleared!</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">No unverified prescription uploads found inside the municipal database.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allMedicinesPending.map((med) => (
                    <MedicineCard 
                      key={med.id}
                      medicine={med}
                      onActionComplete={loadDashboardData}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Extra telemetry info card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center gap-3.5 text-xs text-slate-500 leading-normal">
              <AlertCircle className="h-5 w-5 text-teal-600 shrink-0" />
              <span>Safety Note: Under Visakhapatnam health legislation, drug verification audits require checking batch number sequence structures against corporate pharmaceutical directories. Use simulated cron checker to verify listing status.</span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
