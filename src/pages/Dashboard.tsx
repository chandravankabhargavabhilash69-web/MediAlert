import React, { useState, useEffect } from "react";
import { useApp } from "../components/AppContext";
import { Medicine, Exchange, AnalyticsStats } from "../types";
  LayoutDashboard, ClipboardList, ShieldCheck, Heart, AlertCircle, 
  Trash2, Download, RefreshCw, Calendar, Users, Ban
} from "lucide-react";
import { apiClient, downloadClientInvoice, isMockDatabaseActive } from "../utils/apiClient";
export default function Dashboard() {
  const { currentUser, triggerExpiryCheck, toast } = useApp();
    if (!currentUser) return;
    try {
      // 1. Fetch Analytics overview
      const analyticsResp = await fetch("/api/analytics");
      const analyticsResp = await apiClient.get<AnalyticsStats>("/api/analytics");
      if (analyticsResp.ok) {
        const stats = await analyticsResp.json();
        setAnalytics(stats);
      }
      // 2. Fetch my listings matches
      // Pass listedBy query parameter
      const myMedResp = await fetch(`/api/medicines?listedBy=${currentUser.id}`);
      const myMedResp = await apiClient.get<Medicine[]>(`/api/medicines?listedBy=${currentUser.id}`);
      if (myMedResp.ok) {
        const meds = await myMedResp.json();
        setMyMedicines(meds);
      }
      // 3. Fetch exchanges transactions
      const excResp = await fetch(`/api/exchanges?userId=${currentUser.id}`);
      const excResp = await apiClient.get<Exchange[]>(`/api/exchanges?userId=${currentUser.id}`);
      if (excResp.ok) {
        const list = await excResp.json();
        setMyExchanges(list);
      }
      // 4. Fetch all listings requiring admin approval if user is Admin
      if (currentUser.role === "admin") {
        const allPendingResp = await fetch("/api/medicines");
        const allPendingResp = await apiClient.get<Medicine[]>("/api/medicines");
        if (allPendingResp.ok) {
          const listAll: Medicine[] = await allPendingResp.json();
          // Filter those unverified (pending prescription approval check)
    if (!doubleCheck) return;
    try {
      const resp = await fetch(`/api/medicines/${id}`, { method: "DELETE" });
      const resp = await apiClient.delete(`/api/medicines/${id}`);
      if (resp.ok) {
        toast.show("Listing removed safely", "success");
        loadDashboardData();
    loadDashboardData();
  };
  const handleDownloadInvoice = (excId: string) => {
    window.location.href = `/api/exchanges/${excId}/pdf`;
  const handleDownloadInvoice = (exc: Exchange) => {
    if (isMockDatabaseActive()) {
      downloadClientInvoice(exc);
    } else {
      window.location.href = `/api/exchanges/${exc.id}/pdf`;
    }
  };
  const isAdmin = currentUser?.role === "admin";
                    <div className="flex items-center gap-3 shrink-0">
                      {exc.status === "Paid" && (
                        <button
                          onClick={() => handleDownloadInvoice(exc.id)}
                          onClick={() => handleDownloadInvoice(exc)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold focus:outline-none"
                        >
                          <Download className="h-3.5 w-3.5" />
  );
}
