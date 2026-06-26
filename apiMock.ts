import { User, Medicine, Exchange, SystemNotification, AnalyticsStats } from "../types";
// Keys for local storage
const DB_USERS_KEY = "medialert_db_users";
const DB_MEDICINES_KEY = "medialert_db_medicines";
const DB_EXCHANGES_KEY = "medialert_db_exchanges";
const DB_NOTIFICATIONS_KEY = "medialert_db_notifications";
// Initial Seeding Data (identical to server.ts, renamed to MediAlert)
const initialUsers: User[] = [
  { id: "usr_1", username: "MedUser", role: "user", createdAt: new Date("2026-01-10").toISOString() },
  { id: "usr_admin", username: "AdminUser", role: "admin", createdAt: new Date("2026-01-01").toISOString() }
];
const initialMedicines: Medicine[] = [
  {
    id: "med_1",
    medicineName: "Amoxicillin 500mg",
    manufacturer: "GSK Pharmaceuticals",
    batchNumber: "AMX99812",
    manufactureDate: "2025-06-01",
    expiryDate: "2026-06-25", // <30 days from 2026-06-10 (current time) -> Red / Expiring soon
    quantity: 30,
    category: "Antibiotics",
    prescriptionRequired: true,
    medicineImages: ["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80"],
    location: "MVP Colony",
    description: "Unused full strips of Amoxicillin. Prescribed for chest infection, but treatment changed. Stored in climate-controlled cabinet.",
    status: "Expiring Soon",
    verified: true,
    listedBy: "usr_1",
    createdAt: new Date("2026-06-01").toISOString()
  },
  {
    id: "med_2",
    medicineName: "Paracetamol 650mg",
    manufacturer: "Crocin India",
    batchNumber: "PCT8827A",
    manufactureDate: "2025-10-15",
    expiryDate: "2026-12-30", // >90 days -> Green
    quantity: 12,
    category: "Analgesics",
    prescriptionRequired: false,
    medicineImages: ["https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400&q=80"],
    location: "Dwaraka Nagar",
    description: "Over-the-counter painkiller sheets. Fully sealed, unopened.",
    status: "Verified",
    verified: true,
    listedBy: "usr_1",
    createdAt: new Date("2026-06-02").toISOString()
  },
  {
    id: "med_3",
    medicineName: "Atorvastatin 20mg",
    manufacturer: "Pfizer Wellness",
    batchNumber: "ATV1192M",
    manufactureDate: "2025-03-10",
    expiryDate: "2026-08-05", // 30-90 days -> Yellow
    quantity: 20,
    category: "Cardiovascular",
    prescriptionRequired: true,
    medicineImages: ["https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&q=80"],
    location: "Gajuwaka",
    description: "Lipid-lowering cholesterol pills. Excess strip from grandmother's prescription. Requires verification.",
    status: "Verified",
    verified: false, // Needs Admin approval
    listedBy: "usr_1",
    createdAt: new Date("2026-06-05").toISOString()
  },
  {
    id: "med_4",
    medicineName: "Metformin 1000mg",
    manufacturer: "Abbott Laboratories",
    batchNumber: "MTF3316D",
    manufactureDate: "2025-08-20",
    expiryDate: "2027-04-10", // Green
    quantity: 60,
    category: "Antidiabetics",
    prescriptionRequired: true,
    medicineImages: ["https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&q=80"],
    location: "Madhurawada",
    description: "High quality Metformin. Sealed container of diabetic medication.",
    status: "Verified",
    verified: true,
    listedBy: "usr_1",
    createdAt: new Date("2026-06-06").toISOString()
  },
  {
    id: "med_5",
    medicineName: "Montelukast 10mg",
    manufacturer: "Cipla Health",
    batchNumber: "MTK1122C",
    manufactureDate: "2025-04-01",
    expiryDate: "2026-05-30", // Expired
    quantity: 15,
    category: "Respiratory",
    prescriptionRequired: true,
    medicineImages: ["https://images.unsplash.com/photo-1607619056574-7b8d304f2c38?w=400&q=80"],
    location: "Rushikonda",
    description: "Allergy relief medicines. Safely discarded state on dashboard alert.",
    status: "Expired",
    verified: true,
    listedBy: "usr_admin",
    createdAt: new Date("2026-05-01").toISOString()
  }
];
const initialNotifications = [
  {
    id: "not_1",
    userId: "usr_1",
    title: "👋 Welcome to MediAlert!",
    message: "Verify your profile and start contributing responsibly. Reducing pharmaceutical waste together.",
    type: "success",
    read: false,
    createdAt: new Date().toISOString()
  },
  {
    id: "not_2",
    userId: "usr_1",
    title: "⚠️ Expiry warning",
    message: "Amoxicillin 500mg batch AMX99812 is expiring in less than 30 days. Please arrange prompt checkout.",
    type: "warning",
    read: false,
    createdAt: new Date().toISOString()
  }
];
// Helper to load/save tables
function getTable<T>(key: string, initialData: T[]): T[] {
  const saved = localStorage.getItem(key);
  if (!saved) {
    localStorage.setItem(key, JSON.stringify(initialData));
    return initialData;
  }
  try {
    return JSON.parse(saved);
  } catch {
    localStorage.setItem(key, JSON.stringify(initialData));
    return initialData;
  }
}
function saveTable<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}
// Calculate expiry status based on simulator reference date 2026-06-10
const calculateStatus = (expiryDateStr: string): "Verified" | "Expiring Soon" | "Expired" => {
  const today = new Date("2026-06-10");
  const expiry = new Date(expiryDateStr);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 0) {
    return "Expired";
  } else if (diffDays <= 30) {
    return "Expiring Soon";
  } else {
    return "Verified";
  }
};
// API Route Simulation Controllers
export const apiMock = {
  // 1. AUTHENTICATION
  login: async (username: string, pass: string): Promise<any> => {
    const users = getTable<User>(DB_USERS_KEY, initialUsers);
    
    // Developer credentials
    if (username === "MedUser" && pass === "123456") {
      const user = users.find(u => u.username === "MedUser") || { id: "usr_1", username: "MedUser", role: "user", createdAt: new Date().toISOString() };
      return { token: "mock-jwt-token-meduser", user: { ...user, role: "user" } };
    }
    if (username === "AdminUser" && pass === "Admin@123") {
      const user = users.find(u => u.username === "AdminUser") || { id: "usr_admin", username: "AdminUser", role: "admin", createdAt: new Date().toISOString() };
      return { token: "mock-jwt-token-admin", user: { ...user, role: "admin" } };
    }
    // Custom users
    const matched = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (matched && pass === "123456") {
      return { token: `mock-jwt-token-${matched.id}`, user: matched };
    }
    throw new Error("Invalid username or password pattern");
  },
  register: async (username: string, email: string): Promise<any> => {
    const users = getTable<User>(DB_USERS_KEY, initialUsers);
    const notifications = getTable<SystemNotification>(DB_NOTIFICATIONS_KEY, initialNotifications as SystemNotification[]);
    const dup = users.find(u => u.username.toLowerCase() === username.toLowerCase() || u.email?.toLowerCase() === email.toLowerCase());
    if (dup) {
      throw new Error("Username or Email already exists");
    }
    const newUser: User = {
      id: "usr_" + Math.random().toString(36).substring(2, 11),
      username,
      email,
      role: "user",
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    saveTable(DB_USERS_KEY, users);
    // Welcome Alert
    notifications.push({
      id: "not_" + Date.now(),
      userId: newUser.id,
      title: "🌍 Registered Successfully",
      message: `Welcome ${username}! You can now list medicines or search for matches in Visakhapatnam.`,
      type: "success",
      read: false,
      createdAt: new Date().toISOString()
    });
    saveTable(DB_NOTIFICATIONS_KEY, notifications);
    return { message: "Registration successful!", user: newUser, token: `mock-jwt-token-${newUser.id}` };
  },
  // 2. MEDICINES
  getMedicines: async (filters: { search?: string; category?: string; location?: string; status?: string; listedBy?: string }): Promise<Medicine[]> => {
    const list = getTable<Medicine>(DB_MEDICINES_KEY, initialMedicines);
    
    // Map with computed statuses
    let filtered = list.map(m => ({
      ...m,
      status: calculateStatus(m.expiryDate)
    }));
    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(m => 
        m.medicineName.toLowerCase().includes(q) || 
        m.manufacturer.toLowerCase().includes(q) || 
        m.batchNumber.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q)
      );
    }
    if (filters.category) {
      filtered = filtered.filter(m => m.category === filters.category);
    }
    if (filters.location) {
      filtered = filtered.filter(m => m.location === filters.location);
    }
    if (filters.status) {
      filtered = filtered.filter(m => m.status === filters.status);
    }
    if (filters.listedBy) {
      filtered = filtered.filter(m => m.listedBy === filters.listedBy);
    }
    return filtered;
  },
  getMedicineById: async (id: string): Promise<Medicine> => {
    const list = getTable<Medicine>(DB_MEDICINES_KEY, initialMedicines);
    const med = list.find(m => m.id === id);
    if (!med) throw new Error("Medicine listing not found");
    med.status = calculateStatus(med.expiryDate);
    return med;
  },
  createMedicine: async (body: Partial<Medicine>): Promise<Medicine> => {
    const list = getTable<Medicine>(DB_MEDICINES_KEY, initialMedicines);
    const notifications = getTable<SystemNotification>(DB_NOTIFICATIONS_KEY, initialNotifications as SystemNotification[]);
    if (!body.medicineName || !body.expiryDate || !body.location || !body.quantity) {
      throw new Error("Missing required medicine parameters");
    }
    const calculatedStatus = calculateStatus(body.expiryDate);
    const requiresAdminApproval = body.prescriptionRequired === true;
    const newMed: Medicine = {
      id: "med_" + Math.random().toString(36).substring(2, 11),
      medicineName: body.medicineName,
      manufacturer: body.manufacturer || "Generic",
      batchNumber: body.batchNumber || "BATCH-" + Math.floor(Math.random() * 90000 + 10000),
      manufactureDate: body.manufactureDate || new Date("2026-01-01").toISOString().split("T")[0],
      expiryDate: body.expiryDate,
      quantity: Number(body.quantity),
      category: body.category || "General Healthcare",
      prescriptionRequired: !!body.prescriptionRequired,
      medicineImages: body.medicineImages && body.medicineImages.length > 0 ? body.medicineImages : ["https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&q=80"],
      location: body.location,
      description: body.description || "No extra description provided.",
      status: calculatedStatus,
      verified: !requiresAdminApproval,
      listedBy: body.listedBy || "usr_1",
      createdAt: new Date().toISOString()
    };
    list.push(newMed);
    saveTable(DB_MEDICINES_KEY, list);
    // Push notification
    if (requiresAdminApproval) {
      notifications.push({
        id: "not_" + Date.now(),
        userId: "usr_admin",
        title: "🛡️ Approval Required",
        message: `New prescription medicine '${body.medicineName}' requires validation approval as per medical guidelines.`,
        type: "info",
        read: false,
        createdAt: new Date().toISOString()
      });
    } else {
      notifications.push({
        id: "not_" + Date.now(),
        userId: newMed.listedBy,
        title: "🎉 Medicine Listed!",
        message: `Your medicine '${body.medicineName}' is now live. Category: ${body.category || "General"}.`,
        type: "success",
        read: false,
        createdAt: new Date().toISOString()
      });
    }
    saveTable(DB_NOTIFICATIONS_KEY, notifications);
    return newMed;
  },
  updateMedicine: async (id: string, body: Partial<Medicine>): Promise<Medicine> => {
    const list = getTable<Medicine>(DB_MEDICINES_KEY, initialMedicines);
    const index = list.findIndex(m => m.id === id);
    if (index === -1) throw new Error("Medicine not found");
    list[index] = {
      ...list[index],
      ...body,
      status: calculateStatus(body.expiryDate || list[index].expiryDate)
    } as Medicine;
    saveTable(DB_MEDICINES_KEY, list);
    return list[index];
  },
  deleteMedicine: async (id: string): Promise<any> => {
    const list = getTable<Medicine>(DB_MEDICINES_KEY, initialMedicines);
    const filtered = list.filter(m => m.id !== id);
    if (filtered.length === list.length) throw new Error("Medicine listing not found");
    saveTable(DB_MEDICINES_KEY, filtered);
    return { message: "Medicine Listing deleted successfully" };
  },
  verifyMedicine: async (id: string): Promise<any> => {
    const list = getTable<Medicine>(DB_MEDICINES_KEY, initialMedicines);
    const notifications = getTable<SystemNotification>(DB_NOTIFICATIONS_KEY, initialNotifications as SystemNotification[]);
    const med = list.find(m => m.id === id);
    if (!med) throw new Error("Medicine not found");
    med.verified = true;
    saveTable(DB_MEDICINES_KEY, list);
    notifications.push({
      id: "not_" + Date.now(),
      userId: med.listedBy,
      title: "🛡️ Medicine Verified",
      message: `Prescription medicine '${med.medicineName}' has been successfully approved by the administrator.`,
      type: "success",
      read: false,
      createdAt: new Date().toISOString()
    });
    saveTable(DB_NOTIFICATIONS_KEY, notifications);
    return { message: "Medicine marked verified successfully", medicine: med };
  },
  // 3. EXCHANGES
  getExchanges: async (userId?: string): Promise<Exchange[]> => {
    const list = getTable<Exchange>(DB_EXCHANGES_KEY, []);
    if (userId) {
      return list.filter(e => e.requestedBy === userId || e.ownerId === userId);
    }
    return list;
  },
  createExchange: async (body: { medicineId: string; requestedBy: string; type: "Exchange" | "Donate" | "Buy"; recipientLocation: string; amount: number }): Promise<Exchange> => {
    const list = getTable<Exchange>(DB_EXCHANGES_KEY, []);
    const medicines = getTable<Medicine>(DB_MEDICINES_KEY, initialMedicines);
    const notifications = getTable<SystemNotification>(DB_NOTIFICATIONS_KEY, initialNotifications as SystemNotification[]);
    const med = medicines.find(m => m.id === body.medicineId);
    if (!med) throw new Error("Medicine listing not found");
    if (calculateStatus(med.expiryDate) === "Expired") {
      throw new Error("Expired medicines cannot be swapped or exchanged.");
    }
    const exchange: Exchange = {
      id: "exc_" + Math.random().toString(36).substring(2, 11),
      medicineId: body.medicineId,
      medicineName: med.medicineName,
      requestedBy: body.requestedBy || "usr_1",
      ownerId: med.listedBy,
      type: body.type || "Exchange",
      status: body.type === "Buy" ? "Pending" : "Approved",
      amount: Number(body.amount) || 0,
      recipientLocation: body.recipientLocation || "Visakhapatnam Local",
      createdAt: new Date().toISOString()
    };
    list.push(exchange);
    saveTable(DB_EXCHANGES_KEY, list);
    if (body.type !== "Buy") {
      med.quantity = Math.max(0, med.quantity - 1);
      saveTable(DB_MEDICINES_KEY, medicines);
    }
    // Owner notification
    notifications.push({
      id: "not_" + Date.now(),
      userId: med.listedBy,
      title: "🤝 Swap Interest!",
      message: `Someone interested in '${med.medicineName}' requested a '${body.type}' exchange in ${body.recipientLocation}.`,
      type: "success",
      read: false,
      createdAt: new Date().toISOString()
    });
    saveTable(DB_NOTIFICATIONS_KEY, notifications);
    return exchange;
  },
  // 4. PAYMENTS
  createPaymentOrder: async (body: { amount: number; currency: string; exchangeId: string }): Promise<any> => {
    if (!body.exchangeId) throw new Error("Exchange transaction ID is required");
    const dummyOrderId = "order_rzp_" + Math.floor(Math.random() * 9000000 + 1000000);
    return {
      id: dummyOrderId,
      amount: body.amount ? body.amount * 100 : 15000,
      currency: body.currency || "INR",
      exchangeId: body.exchangeId
    };
  },
  verifyPayment: async (body: { razorpay_order_id: string; razorpay_payment_id: string; exchangeId: string }): Promise<any> => {
    const list = getTable<Exchange>(DB_EXCHANGES_KEY, []);
    const medicines = getTable<Medicine>(DB_MEDICINES_KEY, initialMedicines);
    const notifications = getTable<SystemNotification>(DB_NOTIFICATIONS_KEY, initialNotifications as SystemNotification[]);
    const currentExchange = list.find(e => e.id === body.exchangeId);
    if (!currentExchange) throw new Error("Exchange transaction record not found");
    currentExchange.status = "Paid";
    currentExchange.paymentId = body.razorpay_payment_id || "pay_rzp_mock_" + Math.floor(Math.random() * 9000 + 1000);
    saveTable(DB_EXCHANGES_KEY, list);
    const med = medicines.find(m => m.id === currentExchange.medicineId);
    if (med) {
      med.quantity = Math.max(0, med.quantity - 1);
      saveTable(DB_MEDICINES_KEY, medicines);
    }
    notifications.push({
      id: "not_" + Date.now(),
      userId: currentExchange.requestedBy,
      title: "💰 Payment Succeeded",
      message: `Payment of ₹${currentExchange.amount || '150'} verified. Exchange parcel is on its way to ${currentExchange.recipientLocation}!`,
      type: "success",
      read: false,
      createdAt: new Date().toISOString()
    });
    saveTable(DB_NOTIFICATIONS_KEY, notifications);
    return { verified: true, exchange: currentExchange };
  },
  // 5. ANALYTICS
  getAnalytics: async (): Promise<AnalyticsStats> => {
    const medicines = getTable<Medicine>(DB_MEDICINES_KEY, initialMedicines);
    const exchanges = getTable<Exchange>(DB_EXCHANGES_KEY, []);
    const countTotal = medicines.length;
    const countVerified = medicines.filter(m => m.verified).length;
    let greenCount = 0;
    let yellowCount = 0;
    let redCount = 0;
    medicines.forEach(m => {
      const state = calculateStatus(m.expiryDate);
      if (state === "Verified") greenCount++;
      else if (state === "Expiring Soon") yellowCount++;
      else redCount++;
    });
    const successExchanges = exchanges.filter(e => e.status === "Paid" || e.status === "Approved" || e.status === "Completed").length;
    return {
      countTotal,
      countVerified,
      successExchanges,
      distribution: [
        { name: "Safe (>90 Days)", value: greenCount, color: "#10B981" },
        { name: "Expiring (30-90 Days)", value: yellowCount, color: "#FBBF24" },
        { name: "Urgent (<30 Days)", value: redCount, color: "#EF4444" }
      ],
      recentActivities: exchanges.slice(-5).map(e => ({
        text: `Medicine '${e.medicineName}' swap initiated as ${e.type}`,
        time: new Date(e.createdAt).toLocaleTimeString(),
        status: e.status
      }))
    };
  },
  // 6. ALERTS / NOTIFICATIONS
  getAlerts: async (userId: string): Promise<SystemNotification[]> => {
    const list = getTable<SystemNotification>(DB_NOTIFICATIONS_KEY, initialNotifications as SystemNotification[]);
    return list.filter(n => n.userId === userId);
  },
  markAlertsRead: async (userId: string): Promise<any> => {
    const list = getTable<SystemNotification>(DB_NOTIFICATIONS_KEY, initialNotifications as SystemNotification[]);
    list.forEach(n => {
      if (n.userId === userId) {
        n.read = true;
      }
    });
    saveTable(DB_NOTIFICATIONS_KEY, list);
    return { success: true };
  },
  // 7. CRON RUN
  checkExpiry: async (): Promise<any> => {
    const list = getTable<Medicine>(DB_MEDICINES_KEY, initialMedicines);
    const notifications = getTable<SystemNotification>(DB_NOTIFICATIONS_KEY, initialNotifications as SystemNotification[]);
    let expiriesUpdated = 0;
    list.forEach(m => {
      const priorStatus = m.status;
      const computed = calculateStatus(m.expiryDate);
      if (priorStatus !== computed) {
        m.status = computed;
        expiriesUpdated++;
        if (computed === "Expired") {
          notifications.push({
            id: "not_cron_" + Date.now() + Math.random().toString(36).substring(2, 6),
            userId: m.listedBy,
            title: "❌ Medicine Expired Removed",
            message: `Your listing '${m.medicineName}' has expired and is automatically flagged for disposal as of current simulation time.`,
            type: "danger",
            read: false,
            createdAt: new Date().toISOString()
          });
        }
      }
    });
    if (expiriesUpdated > 0) {
      saveTable(DB_MEDICINES_KEY, list);
      saveTable(DB_NOTIFICATIONS_KEY, notifications);
    }
    return { success: true, updatedCount: expiriesUpdated };
  }
};
