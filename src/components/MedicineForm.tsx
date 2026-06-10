import React, { useState } from "react";
import { useApp } from "./AppContext";
import { VIZAG_LOCATIONS, MEDICINE_CATEGORIES, Medicine } from "../types";
import { AlertCircle, FilePlus2, CheckCircle2 } from "lucide-react";

interface MedicineFormProps {
  onSuccess: (newMed: Medicine) => void;
  onCancel: () => void;
  initialData?: Medicine;
}

export default function MedicineForm({ onSuccess, onCancel, initialData }: MedicineFormProps) {
  const { currentUser, toast } = useApp();
  
  const [formData, setFormData] = useState({
    medicineName: initialData?.medicineName || "",
    manufacturer: initialData?.manufacturer || "",
    batchNumber: initialData?.batchNumber || "",
    manufactureDate: initialData?.manufactureDate || new Date().toISOString().split("T")[0],
    expiryDate: initialData?.expiryDate || "",
    quantity: initialData?.quantity || 10,
    category: initialData?.category || MEDICINE_CATEGORIES[0],
    prescriptionRequired: initialData?.prescriptionRequired || false,
    location: initialData?.location || VIZAG_LOCATIONS[0],
    description: initialData?.description || "",
    medicineImages: initialData?.medicineImages || []
  });

  const [imageUrlInput, setImageUrlInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Expiry check warning helper
  const [isNearExpiryWarning, setIsNearExpiryWarning] = useState(false);

  const handleDateChange = (dateVal: string) => {
    setFormData(prev => ({ ...prev, expiryDate: dateVal }));
    
    // Check if expiry is <30 days from reference simulation date (2026-06-10)
    const today = new Date("2026-06-10");
    const expiry = new Date(dateVal);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0 && diffDays <= 30) {
      setIsNearExpiryWarning(true);
    } else {
      setIsNearExpiryWarning(false);
    }
  };

  const handleAddImage = () => {
    if (!imageUrlInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      medicineImages: [...prev.medicineImages, imageUrlInput.trim()]
    }));
    setImageUrlInput("");
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      medicineImages: prev.medicineImages.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.medicineName.trim() || !formData.expiryDate || !formData.location || formData.quantity <= 0) {
      toast.show("Please fill in all mandatory medicine details", "error");
      return;
    }

    if (isNearExpiryWarning) {
      const confirmWarning = window.confirm("⚠️ This medicine is expiring in less than 30 days. Are you sure you want to list this? Expired medicines cannot be exchanged.");
      if (!confirmWarning) return;
    }

    setSubmitting(true);
    try {
      const isEdit = !!initialData;
      const apiEndpoint = isEdit ? `/api/medicines/${initialData.id}` : "/api/medicines";
      const method = isEdit ? "PUT" : "POST";

      const payload = {
        ...formData,
        listedBy: currentUser?.id || "usr_1"
      };

      const resp = await fetch(apiEndpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (resp.ok) {
        const savedMed = await resp.json();
        toast.show(isEdit ? "Listing updated successfully!" : "Medicine listed successfully!", "success");
        onSuccess(savedMed);
      } else {
        const err = await resp.json();
        toast.show(err.error || "Save list action aborted", "error font-sans");
      }
    } catch (err) {
      console.error(err);
      toast.show("Connection error executing listing", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form id="medicine-listing-form" onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xl space-y-6 font-sans text-slate-800">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="h-10 w-10 bg-teal-50 flex items-center justify-center rounded-xl text-teal-600">
          <FilePlus2 className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-base">
            {initialData ? "Edit Medicine Listing" : "List Unused Medicine"}
          </h3>
          <p className="text-xs text-slate-500">Provide medical details carefully to preserve community security.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Name and manufacturer */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Medicine Name <span className="text-rose-500">*</span></label>
            <input 
              type="text"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm transition"
              placeholder="e.g. Paracetamol 650mg, Ceftriaxone 1g"
              value={formData.medicineName}
              onChange={e => setFormData(p => ({ ...p, medicineName: e.target.value }))}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Manufacturer / Drug Brand</label>
            <input 
              type="text"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm transition"
              placeholder="e.g. Cipla, GSK, Pfizer"
              value={formData.manufacturer}
              onChange={e => setFormData(p => ({ ...p, manufacturer: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Batch Number</label>
              <input 
                type="text"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm transition"
                placeholder="BATCH-1029"
                value={formData.batchNumber}
                onChange={e => setFormData(p => ({ ...p, batchNumber: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Quantity (Units) <span className="text-rose-500">*</span></label>
              <input 
                type="number"
                min="1"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm transition"
                placeholder="10"
                value={formData.quantity}
                onChange={e => setFormData(p => ({ ...p, quantity: Math.max(1, Number(e.target.value)) }))}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Medicine Category</label>
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm transition"
              value={formData.category}
              onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}
            >
              {MEDICINE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Expiry alerts and details */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Manufacture Date</label>
              <input 
                type="date"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs transition"
                value={formData.manufactureDate}
                onChange={e => setFormData(p => ({ ...p, manufactureDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Expiry Date <span className="text-rose-500">*</span></label>
              <input 
                type="date"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs transition focus:border-red-500"
                value={formData.expiryDate}
                onChange={e => handleDateChange(e.target.value)}
              />
            </div>
          </div>

          {/* Prompt warning box if <30 days */}
          {isNearExpiryWarning && (
            <div className="p-3 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl flex gap-2 items-start text-xs animate-pulse-slow">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5 text-amber-600" />
              <div>
                <span className="font-bold">Urgent Warning:</span>
                <p className="mt-0.5 leading-normal">Expiry date is less than 30 days. Listing requires double-state user confirmation. Over-the-counter medicine distribution could be limited.</p>
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Primary Match Location <span className="text-rose-500">*</span></label>
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm transition"
              value={formData.location}
              onChange={e => setFormData(p => ({ ...p, location: e.target.value }))}
            >
              {VIZAG_LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide mt-1 block">Visakhapatnam green zone municipal coordination network.</span>
          </div>

          {/* Toggle for prescription REQUIRED */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Requires Rx Prescription?</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Checked list demands Admin verification.</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={formData.prescriptionRequired} 
                onChange={e => setFormData(p => ({ ...p, prescriptionRequired: e.target.checked }))} 
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Description text */}
      <div>
        <label className="text-xs font-bold text-slate-700 block mb-1">Storage Condition & Extra Description</label>
        <textarea 
          rows={3}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm transition"
          placeholder="Stated instructions: e.g. Store below 25C. Sealed in cool dark cabinet. Strip with index of 13 remaining."
          value={formData.description}
          onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
        />
      </div>

      {/* Images integration */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-slate-700 block mb-1">Medicine Image (URLs)</label>
        <div className="flex gap-2">
          <input 
            type="url"
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs transition"
            placeholder="paste direct image url link (e.g. https://domain.com/pill.jpg)"
            value={imageUrlInput}
            onChange={e => setImageUrlInput(e.target.value)}
          />
          <button
            type="button"
            onClick={handleAddImage}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold focus:outline-none shrink-0"
          >
            Add Image
          </button>
        </div>
        
        {/* Render quick image previews */}
        <div className="flex gap-2.5 overflow-x-auto py-1">
          {formData.medicineImages.map((img, idx) => (
            <div key={idx} className="relative h-14 w-14 border border-slate-200 rounded-lg overflow-hidden shrink-0 group">
              <img src={img} alt="preview" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                className="absolute inset-0 bg-rose-600/80 hover:bg-rose-700/90 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Remove
              </button>
            </div>
          ))}
          {formData.medicineImages.length === 0 && (
            <span className="text-[10px] text-slate-400 italic font-medium">No custom images added. Falling back to medical stock placeholder.</span>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-bold transition focus:outline-none"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-800 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition flex items-center gap-1.5 focus:outline-none disabled:opacity-50"
        >
          {submitting ? "Processing..." : initialData ? "Save Update" : "Publish Listing"}
        </button>
      </div>
    </form>
  );
}
