import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

// Constants
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "db.json");

// Define types
interface User {
  id: string;
  username: string;
  role: "user" | "admin";
  createdAt: string;
}

interface Medicine {
  id: string;
  medicineName: string;
  manufacturer: string;
  batchNumber: string;
  manufactureDate: string;
  expiryDate: string;
  quantity: number;
  category: string;
  prescriptionRequired: boolean;
  medicineImages: string[];
  location: string;
  description: string;
  status: "Verified" | "Expiring Soon" | "Expired";
  verified: boolean;
  listedBy: string;
  createdAt: string;
}

interface Exchange {
  id: string;
  medicineId: string;
  medicineName: string;
  requestedBy: string;
  ownerId: string;
  type: "Exchange" | "Donate" | "Buy";
  status: "Pending" | "Paid" | "Approved" | "Completed" | "Cancelled";
  amount: number;
  paymentId?: string;
  recipientLocation: string;
  createdAt: string;
}

interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "danger";
  read: boolean;
  createdAt: string;
}

// Initial Seeding Data
const initialUsers = [
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

// Load Database
function loadDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const data = {
        users: initialUsers,
        medicines: initialMedicines,
        exchanges: [] as Exchange[],
        notifications: [
          {
            id: "not_1",
            userId: "usr_1",
            title: "👋 Welcome to MediLoop!",
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
        ] as Notification[]
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
      return data;
    }
    const content = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(content);
  } catch (error) {
    console.error("Database loading failed, using transient memory", error);
    return { users: initialUsers, medicines: initialMedicines, exchanges: [], notifications: [] };
  }
}

// Save Database
function saveDB(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Database write failed", error);
  }
}

// Initialize Server
async function startServer() {
  const app = express();
  app.use(express.json());

  // Security elements
  app.use((req, res, next) => {
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    next();
  });

  // Load db cache
  let db = loadDB();

  // Helper routine to recalculate Expiry Color categories based on Reference Local Time (2026-06-10)
  const calculateMedicineStatus = (expiryDateStr: string): "Verified" | "Expiring Soon" | "Expired" => {
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

  // --- API ROUTING HANDLERS ---

  // 1. AUTHENTICATION ROUTING
  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    // Demands hardcoded credentials check
    if (username === "MedUser" && password === "123456") {
      const user = db.users.find(u => u.username === "MedUser") || { id: "usr_1", username: "MedUser", role: "user" };
      return res.status(200).json({
        token: "mock-jwt-token-meduser",
        user: { ...user, role: "user" }
      });
    }

    if (username === "AdminUser" && password === "Admin@123") {
      const user = db.users.find(u => u.username === "AdminUser") || { id: "usr_admin", username: "AdminUser", role: "admin" };
      return res.status(200).json({
        token: "mock-jwt-token-admin",
        user: { ...user, role: "admin" }
      });
    }

    // Dynamic checks
    const matched = db.users.find((u: any) => u.username.toLowerCase() === username.toLowerCase());
    if (matched && password === "123456") { // allow 123456 as standard dev pass code
      return res.status(200).json({
        token: `mock-jwt-token-${matched.id}`,
        user: matched
      });
    }

    return res.status(401).json({ error: "Invalid username or password pattern" });
  });

  app.post("/api/auth/register", (req, res) => {
    const { username, email } = req.body;
    if (!username || !email) {
      return res.status(400).json({ error: "Username and email are required" });
    }

    // Check duplication
    const dup = db.users.find((u: any) => u.username.toLowerCase() === username.toLowerCase() || u.email?.toLowerCase() === email.toLowerCase());
    if (dup) {
      return res.status(409).json({ error: "Username or Email already exists" });
    }

    const newUser = {
      id: "usr_" + Math.random().toString(36).substr(2, 9),
      username,
      email,
      role: "user" as const,
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    
    // Add custom welcome alert
    db.notifications.push({
      id: "not_" + Date.now(),
      userId: newUser.id,
      title: "🌍 Registered Successfully",
      message: `Welcome ${username}! You can now list medicines or search for matches in Visakhapatnam.`,
      type: "success",
      read: false,
      createdAt: new Date().toISOString()
    });

    saveDB(db);
    return res.status(201).json({
      message: "Registration successful!",
      user: newUser,
      token: `mock-jwt-token-${newUser.id}`
    });
  });

  // 2. MEDICINE ENDPOINTS
  app.get("/api/medicines", (req, res) => {
    db = loadDB();
    const { search, category, location, status, minExpiryDays, listedBy } = req.query;
    
    let filtered: Medicine[] = [...db.medicines];

    // Auto-update status values based on current simulation date 2026-06-10
    filtered = filtered.map(m => ({
      ...m,
      status: calculateMedicineStatus(m.expiryDate)
    }));

    if (search) {
      const q = String(search).toLowerCase();
      filtered = filtered.filter(m => 
        m.medicineName.toLowerCase().includes(q) || 
        m.manufacturer.toLowerCase().includes(q) || 
        m.batchNumber.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q)
      );
    }

    if (category) {
      filtered = filtered.filter(m => m.category === String(category));
    }

    if (location) {
      filtered = filtered.filter(m => m.location === String(location));
    }

    if (status) {
      filtered = filtered.filter(m => m.status === String(status));
    }

    if (listedBy) {
      filtered = filtered.filter(m => m.listedBy === String(listedBy));
    }

    // Nearest location medicine matching indicator
    res.json(filtered);
  });

  app.get("/api/medicines/:id", (req, res) => {
    db = loadDB();
    const med = db.medicines.find((m: any) => m.id === req.params.id);
    if (!med) {
      return res.status(404).json({ error: "Medicine listing not found" });
    }
    // Refresh its status
    med.status = calculateMedicineStatus(med.expiryDate);
    res.json(med);
  });

  app.post("/api/medicines", (req, res) => {
    const { 
      medicineName, manufacturer, batchNumber, manufactureDate, expiryDate, 
      quantity, category, prescriptionRequired, medicineImages, location, description,
      listedBy 
    } = req.body;

    if (!medicineName || !expiryDate || !location || !quantity) {
      return res.status(400).json({ error: "Missing required medicine parameters" });
    }

    const calculatedStatus = calculateMedicineStatus(expiryDate);
    const requiresAdminApproval = prescriptionRequired === true;

    const newMed: Medicine = {
      id: "med_" + Math.random().toString(36).substr(2, 9),
      medicineName,
      manufacturer: manufacturer || "Generic",
      batchNumber: batchNumber || "BATCH-" + Math.floor(Math.random() * 90000 + 10000),
      manufactureDate: manufactureDate || new Date("2026-01-01").toISOString().split("T")[0],
      expiryDate,
      quantity: Number(quantity),
      category: category || "General Healthcare",
      prescriptionRequired: !!prescriptionRequired,
      medicineImages: medicineImages && medicineImages.length > 0 ? medicineImages : ["https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&q=80"],
      location,
      description: description || "No extra description provided.",
      status: calculatedStatus,
      verified: !requiresAdminApproval, // Prescription-only medications require admin check. Otherwise auto-verified
      listedBy: listedBy || "usr_1",
      createdAt: new Date().toISOString()
    };

    db.medicines.push(newMed);

    // Push notification to Admin if prescription list
    if (requiresAdminApproval) {
      db.notifications.push({
        id: "not_" + Date.now(),
        userId: "usr_admin",
        title: "🛡️ Approval Required",
        message: `New prescription medicine '${medicineName}' requires validation approval as per medical guidelines.`,
        type: "info",
        read: false,
        createdAt: new Date().toISOString()
      });
    } else {
      // General alert about listing success
      db.notifications.push({
        id: "not_" + Date.now(),
        userId: newMed.listedBy,
        title: "🎉 Medicine Listed!",
        message: `Your medicine '${medicineName}' is now live. Category: ${category || "General"}.`,
        type: "success",
        read: false,
        createdAt: new Date().toISOString()
      });
    }

    saveDB(db);
    res.status(201).json(newMed);
  });

  app.put("/api/medicines/:id", (req, res) => {
    db = loadDB();
    const index = db.medicines.findIndex((m: any) => m.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: "Medicine not found" });
    }

    db.medicines[index] = {
      ...db.medicines[index],
      ...req.body,
      status: calculateMedicineStatus(req.body.expiryDate || db.medicines[index].expiryDate)
    };

    saveDB(db);
    res.json(db.medicines[index]);
  });

  app.delete("/api/medicines/:id", (req, res) => {
    db = loadDB();
    const initialLen = db.medicines.length;
    db.medicines = db.medicines.filter((m: any) => m.id !== req.params.id);
    if (db.medicines.length === initialLen) {
      return res.status(404).json({ error: "Medicine listing not found" });
    }
    saveDB(db);
    res.json({ message: "Medicine Listing deleted successfully" });
  });

  app.post("/api/medicines/:id/verify", (req, res) => {
    db = loadDB();
    const med = db.medicines.find((m: any) => m.id === req.params.id);
    if (!med) {
      return res.status(404).json({ error: "Medicine not found" });
    }

    med.verified = true;
    
    // Add verify confirmation alert
    db.notifications.push({
      id: "not_" + Date.now(),
      userId: med.listedBy,
      title: "🛡️ Medicine Verified",
      message: `Prescription medicine '${med.medicineName}' has been successfully approved by the administrator.`,
      type: "success",
      read: false,
      createdAt: new Date().toISOString()
    });

    saveDB(db);
    res.json({ message: "Medicine marked verified successfully", medicine: med });
  });

  // 3. EXCHANGE & DONATE TRANSACTION ENDPOINTS
  app.get("/api/exchanges", (req, res) => {
    db = loadDB();
    const { userId } = req.query;
    
    let list = [...db.exchanges];
    if (userId) {
      list = list.filter((e: any) => e.requestedBy === userId || e.ownerId === userId);
    }
    res.json(list);
  });

  app.post("/api/exchanges", (req, res) => {
    const { medicineId, requestedBy, type, recipientLocation, amount } = req.body;
    db = loadDB();

    const med = db.medicines.find((m: any) => m.id === medicineId);
    if (!med) {
      return res.status(404).json({ error: "Medicine listing not found" });
    }

    if (med.status === "Expired") {
      return res.status(400).json({ error: "Expired medicines cannot be swapped or exchanged." });
    }

    const exchange: Exchange = {
      id: "exc_" + Math.random().toString(36).substr(2, 9),
      medicineId,
      medicineName: med.medicineName,
      requestedBy: requestedBy || "usr_1",
      ownerId: med.listedBy,
      type: type || "Exchange",
      status: type === "Buy" ? "Pending" : "Approved", // Buy requires simulated payment completion
      amount: Number(amount) || 0,
      recipientLocation: recipientLocation || "Visakhapatnam Local",
      createdAt: new Date().toISOString()
    };

    db.exchanges.push(exchange);

    // If exchange or donate, decrease medicine count or mark completed
    if (type !== "Buy") {
      med.quantity = Math.max(0, med.quantity - 1);
      if (med.quantity === 0) {
        // Soft archive or mark as completed swap
      }
    }

    // Add alert for medicine owner
    db.notifications.push({
      id: "not_" + Date.now(),
      userId: med.listedBy,
      title: "🤝 Swallowed Interest!",
      message: `Someone interested in '${med.medicineName}' requested a '${type}' exchange in ${recipientLocation}.`,
      type: "success",
      read: false,
      createdAt: new Date().toISOString()
    });

    saveDB(db);
    res.status(201).json(exchange);
  });

  // 4. PAYMENTS & ORDER CREATION (RAZORPAY IMPLEMENTATION SIM)
  app.post("/api/payment/create-order", (req, res) => {
    const { amount, currency, exchangeId } = req.body;
    if (!exchangeId) {
      return res.status(400).json({ error: "Exchange transaction ID is required" });
    }

    // Simulate creation of a Razorpay Order
    const dummyOrderId = "order_rzp_" + Math.floor(Math.random() * 9000000 + 1000000);
    res.json({
      id: dummyOrderId,
      amount: amount ? amount * 100 : 15000, // in paisa (INR 150.00 default handling fee)
      currency: currency || "INR",
      exchangeId: exchangeId
    });
  });

  app.post("/api/payment/verify", (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, exchangeId } = req.body;
    db = loadDB();

    const currentExchange = db.exchanges.find((e: any) => e.id === exchangeId);
    if (!currentExchange) {
      return res.status(404).json({ error: "Exchange transaction record not found" });
    }

    // Mark paid & completed
    currentExchange.status = "Paid";
    currentExchange.paymentId = razorpay_payment_id || "pay_rzp_" + Math.floor(Math.random() * 9000 + 1000);

    // Update quantity for listing
    const med = db.medicines.find((m: any) => m.id === currentExchange.medicineId);
    if (med) {
      med.quantity = Math.max(0, med.quantity - 1);
    }

    // Create success alert
    db.notifications.push({
      id: "not_" + Date.now(),
      userId: currentExchange.requestedBy,
      title: "💰 Payment Succeeded",
      message: `Payment of ₹${currentExchange.amount || '150'} verified. Exchange parcel is on its way to ${currentExchange.recipientLocation}!`,
      type: "success",
      read: false,
      createdAt: new Date().toISOString()
    });

    saveDB(db);
    res.json({ verified: true, exchange: currentExchange });
  });

  // Download high-fidelity transaction invoice PDF (rendered directly as beautiful client download text format)
  app.get("/api/exchanges/:id/pdf", (req, res) => {
    db = loadDB();
    const currentExchange = db.exchanges.find((e: any) => e.id === req.params.id);
    if (!currentExchange) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    const receiptContent = `=====================================================
                      MEDILOOP INVOICE
               Connecting Care. Reducing Waste.
=====================================================
Receipt ID:     RCP-${currentExchange.id.toUpperCase()}
Order Date:     ${new Date(currentExchange.createdAt).toLocaleString()}
Transaction Type: ${currentExchange.type}
Status:         ${currentExchange.status}
Payment ID:     ${currentExchange.paymentId || 'N/A (CASH MATCH)'}
-----------------------------------------------------
Item Details:
Medicine Name:   ${currentExchange.medicineName}
Delivery Area:   ${currentExchange.recipientLocation}
Handling Fee:    INR ${currentExchange.amount || '0.00'}.00
-----------------------------------------------------
Visakhapatnam Healthcare Match Point Logistics:
Matched Logistics Partner: Visakhapatnam King George Hospital (KGH) Liaison
Eco Footprint:   +0.45kg pharma wastes prevented!
=====================================================
            Thank you for helping our community!
                https://mediloop-care.org
=====================================================`;
    
    res.setHeader("Content-Disposition", `attachment; filename="Invoice-${currentExchange.id}.txt"`);
    res.setHeader("Content-Type", "text/plain");
    res.send(receiptContent);
  });

  // 5. ANALYTICS & STATS ENDPOINTS
  app.get("/api/analytics", (req, res) => {
    db = loadDB();
    
    const countTotal = db.medicines.length;
    const countVerified = db.medicines.filter((m: any) => m.verified).length;
    
    // Auto calculate expiry status counts
    let greenCount = 0;
    let yellowCount = 0;
    let redCount = 0;

    db.medicines.forEach((m: any) => {
      const state = calculateMedicineStatus(m.expiryDate);
      if (state === "Verified") greenCount++;
      else if (state === "Expiring Soon") yellowCount++;
      else redCount++;
    });

    const successExchanges = db.exchanges.filter((e: any) => e.status === "Paid" || e.status === "Approved" || e.status === "Completed").length;

    res.json({
      countTotal,
      countVerified,
      successExchanges,
      distribution: [
        { name: "Safe (>90 Days)", value: greenCount, color: "#10B981" },
        { name: "Expiring (30-90 Days)", value: yellowCount, color: "#FBBF24" },
        { name: "Urgent (<30 Days)", value: redCount, color: "#EF4444" }
      ],
      recentActivities: db.exchanges.slice(-5).map((e: any) => ({
        text: `Medicine '${e.medicineName}' swap initiated as ${e.type}`,
        time: new Date(e.createdAt).toLocaleTimeString(),
        status: e.status
      }))
    });
  });

  // 6. NOTIFICATION SYSTEM
  app.get("/api/alerts", (req, res) => {
    db = loadDB();
    const { userId } = req.query;
    if (!userId) {
      return res.json([]);
    }
    const myAlerts = db.notifications.filter((n: any) => n.userId === String(userId));
    res.json(myAlerts);
  });

  app.post("/api/alerts/mark-read", (req, res) => {
    const { userId } = req.body;
    db = loadDB();
    db.notifications.forEach((n: any) => {
      if (n.userId === userId) {
        n.read = true;
      }
    });
    saveDB(db);
    res.json({ success: true });
  });

  // 7. CRON EXPIRY MONITORING SIMULATION
  app.post("/api/cron/check-expiry", (req, res) => {
    db = loadDB();
    let expiriesUpdated = 0;
    
    db.medicines.forEach((m: any) => {
      const priorStatus = m.status;
      const computed = calculateMedicineStatus(m.expiryDate);
      if (priorStatus !== computed) {
        m.status = computed;
        expiriesUpdated++;

        if (computed === "Expired") {
          db.notifications.push({
            id: "not_cron_" + Date.now() + Math.random().toString(36).substr(2, 4),
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
      saveDB(db);
    }

    res.json({ success: true, updatedCount: expiriesUpdated });
  });

  // --- DEV & PRODUCTION BINDINGS ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MediLoop Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical server boot malfunction", err);
});
