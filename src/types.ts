export interface User {
  id: string;
  username: string;
  role: "user" | "admin";
  email?: string;
  createdAt: string;
}

export interface Medicine {
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

export interface Exchange {
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

export interface SystemNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "danger";
  read: boolean;
  createdAt: string;
}

export interface AnalyticsStats {
  countTotal: number;
  countVerified: number;
  successExchanges: number;
  distribution: { name: string; value: number; color: string }[];
  recentActivities: { text: string; time: string; status: string }[];
}

export const VIZAG_LOCATIONS = [
  "MVP Colony",
  "Dwaraka Nagar",
  "Gajuwaka",
  "Madhurawada",
  "Seethammadhara",
  "Rushikonda",
  "Akkayyapalem",
  "NAD Junction",
  "Gopalapatnam",
  "Pendurthi",
  "Beach Road",
  "Simhachalam",
  "Kurmannapalem",
  "Vizag Steel Plant Area",
  "Waltair Uplands"
];

export const VIZAG_HOSPITALS = [
  "King George Hospital (KGH)",
  "Apollo Hospitals Visakhapatnam",
  "CARE Hospitals",
  "SevenHills Hospital",
  "Medicover Hospitals",
  "Queen's NRI Hospital",
  "Pinnacle Hospitals"
];

export const MEDICINE_CATEGORIES = [
  "Analgesics",
  "Antibiotics",
  "Antidiabetics",
  "Cardiovascular",
  "Respiratory",
  "Gastrointestinal",
  "General Healthcare",
  "Vitamins & Supplements"
];
