import React, { useState, useEffect } from "react";
import { Medicine, VIZAG_LOCATIONS, MEDICINE_CATEGORIES } from "../types";
import { useApp } from "../components/AppContext";
import MedicineCard from "../components/MedicineCard";
import MedicineForm from "../components/MedicineForm";
import { Search, Map, SlidersHorizontal, PlusSquare, MapPin } from "lucide-react";

export default function Marketplace() {
  const { currentUser, toast } = useApp();

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);

  // Search/Filters states
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sortBy, setSortBy] = useState("expiryDate"); // expiryDate, quantity, createdAt

  // Interactive Form visibility
  const [formOpen, setFormOpen] = useState(false);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append("search", search);
      if (selectedCategory) queryParams.append("category", selectedCategory);
      if (selectedLocation) queryParams.append("location", selectedLocation);
      if (selectedStatus) queryParams.append("status", selectedStatus);

      const response = await fetch(`/api/medicines?${queryParams.toString()}`);
      if (response.ok) {
        let list: Medicine[] = await response.json();
        
        // Apply frontend sorting if needed
        list.sort((a, b) => {
          if (sortBy === "expiryDate") {
            return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
          } else if (sortBy === "quantity") {
            return b.quantity - a.quantity;
          } else {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
        });

        // Hide expired drugs on search pages as they cannot be exchanged under medical safety guidelines
        const activeList = list.filter(m => m.status !== "Expired");
        setMedicines(activeList);
      }
    } catch (err) {
      console.error(err);
      toast.show("Could not load medicines catalog", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, [search, selectedCategory, selectedLocation, selectedStatus, sortBy]);

  const handleListingCreated = () => {
    setFormOpen(false);
    fetchMedicines();
  };

  return (
    <div id="marketplace-page" className="min-h-screen bg-slate-50 py-8 lg:py-12 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Marketplace banner section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-teal-800 to-teal-700 p-6 md:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-1/4 h-32 w-32 bg-emerald-400 filter blur-3xl opacity-20" />
          <div className="space-y-1 relative">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Ecosystem Marketplace</h1>
            <p className="text-xs md:text-sm text-teal-100">Browse drug listings verified near Visakhapatnam healthcare circles. No expired medicines allowed.</p>
          </div>
          <button
            onClick={() => {
              if (!currentUser) {
                toast.show("Please login to create a medicine listing", "warning");
              } else {
                setFormOpen(!formOpen);
              }
            }}
            className="inline-flex items-center gap-1.5 px-5 py-3 bg-white text-teal-800 hover:text-teal-950 font-bold rounded-xl text-xs shadow-md transition-all shrink-0 cursor-pointer"
          >
            <PlusSquare className="h-4.5 w-4.5" />
            {formOpen ? "Close Panel" : "List Unused Medicine"}
          </button>
        </div>

        {/* Listing Panel Form Overlay */}
        {formOpen && currentUser && (
          <div className="animate-slide-in">
            <MedicineForm 
              onSuccess={handleListingCreated}
              onCancel={() => setFormOpen(false)}
            />
          </div>
        )}

        {/* Search controls grid */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-5 gap-3.5 items-center">
          
          {/* Query search input box */}
          <div className="col-span-1 md:col-span-2 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4.5 w-4.5" />
            <input 
              type="text"
              placeholder="Search medicine brand, manufacturer, batch..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-sans transition"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Category Selector dropdown */}
          <div>
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs transition"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {MEDICINE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Location Selector dropdown */}
          <div>
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs transition"
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
            >
              <option value="">All Locations (Vizag)</option>
              {VIZAG_LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          </div>

          {/* Sorting metrics selector */}
          <div>
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs transition"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="expiryDate">Soonest Expiry First</option>
              <option value="quantity">Largest Quantity first</option>
              <option value="createdAt">Newest listed first</option>
            </select>
          </div>

        </div>

        {/* Content body split: map matched node coordinates + listing catalog */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Match Point indicator sidebar */}
          <div className="space-y-4 lg:col-span-1">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 border border-slate-700 shadow-md">
              <span className="text-[10px] font-extrabold text-teal-400 uppercase tracking-widest block mb-4">Visakhapatnam Matches</span>
              <div className="space-y-4">
                <div className="flex gap-2.5 items-start">
                  <MapPin className="h-5 w-5 text-teal-400 shrink-0 mt-0.5" />
                  <div className="text-left leading-tight">
                    <span className="text-xs font-bold block text-slate-100">KGH Liaison Center</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Primary logistics matched at King George Hospital, Vizag Port area.</span>
                  </div>
                </div>
                
                <div className="flex gap-2.5 items-start">
                  <MapPin className="h-5 w-5 text-teal-400 shrink-0 mt-0.5" />
                  <div className="text-left leading-tight">
                    <span className="text-xs font-bold block text-slate-100">Dwaraka zone hub</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">SevenHills matched drop point assisting inner Dwaraka colony.</span>
                  </div>
                </div>

                <div className="flex gap-2.5 items-start">
                  <MapPin className="h-5 w-5 text-teal-400 shrink-0 mt-0.5" />
                  <div className="text-left leading-tight">
                    <span className="text-xs font-bold block text-slate-100">Rushikonda Tech hub</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Secondary matching express cabinet in IT park.</span>
                  </div>
                </div>
              </div>

              {/* Geographic simulation container */}
              <div className="mt-6 pt-5 border-t border-slate-700">
                <div className="h-32 bg-slate-950/60 rounded-xl relative overflow-hidden flex items-center justify-center border border-slate-700 text-slate-500">
                  <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
                  <SlidersHorizontal className="h-8 w-8 text-teal-500 animate-pulse-slow" />
                  <span className="text-[8px] font-mono text-teal-400 absolute bottom-2 tracking-widest">MAP COORDINATES REFRESHED</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main drug list results catalog */}
          <div className="lg:col-span-3 space-y-6">
            
            {loading ? (
              // Loading skeleton screens
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(n => (
                  <div key={n} className="h-80 bg-white border border-slate-100 rounded-2xl animate-pulse flex flex-col p-4 justify-between">
                    <div className="h-36 bg-slate-100 rounded-xl" />
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-100 rounded w-2/3" />
                      <div className="h-3 bg-slate-100 rounded w-1/3" />
                    </div>
                    <div className="h-10 bg-slate-100 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : medicines.length === 0 ? (
              <div className="text-center py-16 bg-white border border-slate-100 rounded-2xl space-y-3">
                <Search className="h-12 w-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-800 text-sm">No Active Medicines Matched</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">Try refining your search keyword, category, or region filters. Note that expired listings are automatically hidden to maintain medical safety rules.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {medicines.map((med) => (
                  <div key={med.id} className="animate-fade-in">
                    <MedicineCard 
                      medicine={med}
                      onActionComplete={fetchMedicines}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Total count status bar */}
            {!loading && medicines.length > 0 && (
              <div className="text-center text-xs text-slate-400 font-medium">
                Showing {medicines.length} verified Active listings in Visakhapatnam region. Expiry checks execute automatically.
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
