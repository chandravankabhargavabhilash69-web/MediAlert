import { apiMock } from "./apiMock";
// Determine if we should bypass the real backend and use mock database
const isStaticHost = 
  typeof window !== "undefined" && 
  (window.location.hostname.endsWith(".github.io") || 
   window.location.search.includes("mock=true"));
// Helper to determine if we should fall back
let forceMockFallback = false;
// Unified Response object to match standard fetch interfaces
export interface ApiResponse<T> {
  ok: boolean;
  status: number;
  json: () => Promise<T>;
}
function makeMockResponse<T>(data: T, status: number = 200): ApiResponse<T> {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data
  };
}
export const apiClient = {
  get: async <T>(url: string): Promise<ApiResponse<T>> => {
    const isMock = isStaticHost || forceMockFallback;
    if (isMock) {
      return handleMockRoute<T>("GET", url);
    }
    try {
      const resp = await fetch(url);
      return resp as any;
    } catch (err) {
      console.warn("Connection to backend failed. Falling back to local storage mock database.", err);
      forceMockFallback = true;
      return handleMockRoute<T>("GET", url);
    }
  },
  post: async <T>(url: string, body?: any): Promise<ApiResponse<T>> => {
    const isMock = isStaticHost || forceMockFallback;
    if (isMock) {
      return handleMockRoute<T>("POST", url, body);
    }
    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined
      });
      return resp as any;
    } catch (err) {
      console.warn("Connection to backend failed. Falling back to local storage mock database.", err);
      forceMockFallback = true;
      return handleMockRoute<T>("POST", url, body);
    }
  },
  put: async <T>(url: string, body: any): Promise<ApiResponse<T>> => {
    const isMock = isStaticHost || forceMockFallback;
    if (isMock) {
      return handleMockRoute<T>("PUT", url, body);
    }
    try {
      const resp = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      return resp as any;
    } catch (err) {
      console.warn("Connection to backend failed. Falling back to local storage mock database.", err);
      forceMockFallback = true;
      return handleMockRoute<T>("PUT", url, body);
    }
  },
  delete: async <T>(url: string): Promise<ApiResponse<T>> => {
    const isMock = isStaticHost || forceMockFallback;
    if (isMock) {
      return handleMockRoute<T>("DELETE", url);
    }
    try {
      const resp = await fetch(url, { method: "DELETE" });
      return resp as any;
    } catch (err) {
      console.warn("Connection to backend failed. Falling back to local storage mock database.", err);
      forceMockFallback = true;
      return handleMockRoute<T>("DELETE", url);
    }
  }
};
// Helper function to route virtual endpoints to apiMock
async function handleMockRoute<T>(method: string, url: string, body?: any): Promise<ApiResponse<any>> {
  // Parse URL and search params
  const cleanUrl = url.split("?")[0];
  const queryStr = url.split("?")[1] || "";
  const queryParams = new URLSearchParams(queryStr);
  try {
    // 1. AUTHENTICATION
    if (cleanUrl === "/api/auth/login" && method === "POST") {
      const data = await apiMock.login(body.username, body.password);
      return makeMockResponse(data);
    }
    if (cleanUrl === "/api/auth/register" && method === "POST") {
      const data = await apiMock.register(body.username, body.email);
      return makeMockResponse(data, 201);
    }
    // 2. MEDICINES
    if (cleanUrl === "/api/medicines" && method === "GET") {
      const filters = {
        search: queryParams.get("search") || undefined,
        category: queryParams.get("category") || undefined,
        location: queryParams.get("location") || undefined,
        status: queryParams.get("status") || undefined,
        listedBy: queryParams.get("listedBy") || undefined
      };
      const data = await apiMock.getMedicines(filters);
      return makeMockResponse(data);
    }
    if (cleanUrl.startsWith("/api/medicines/") && cleanUrl.endsWith("/verify") && method === "POST") {
      const parts = cleanUrl.split("/");
      const id = parts[parts.length - 2];
      const data = await apiMock.verifyMedicine(id);
      return makeMockResponse(data);
    }
    if (cleanUrl.startsWith("/api/medicines/") && method === "GET") {
      const id = cleanUrl.split("/").pop()!;
      const data = await apiMock.getMedicineById(id);
      return makeMockResponse(data);
    }
    if (cleanUrl === "/api/medicines" && method === "POST") {
      const data = await apiMock.createMedicine(body);
      return makeMockResponse(data, 201);
    }
    if (cleanUrl.startsWith("/api/medicines/") && method === "PUT") {
      const id = cleanUrl.split("/").pop()!;
      const data = await apiMock.updateMedicine(id, body);
      return makeMockResponse(data);
    }
    if (cleanUrl.startsWith("/api/medicines/") && method === "DELETE") {
      const id = cleanUrl.split("/").pop()!;
      const data = await apiMock.deleteMedicine(id);
      return makeMockResponse(data);
    }
    // 3. EXCHANGES
    if (cleanUrl === "/api/exchanges" && method === "GET") {
      const userId = queryParams.get("userId") || undefined;
      const data = await apiMock.getExchanges(userId);
      return makeMockResponse(data);
    }
    if (cleanUrl === "/api/exchanges" && method === "POST") {
      const data = await apiMock.createExchange(body);
      return makeMockResponse(data, 201);
    }
    // 4. PAYMENTS
    if (cleanUrl === "/api/payment/create-order" && method === "POST") {
      const data = await apiMock.createPaymentOrder(body);
      return makeMockResponse(data);
    }
    if (cleanUrl === "/api/payment/verify" && method === "POST") {
      const data = await apiMock.verifyPayment(body);
      return makeMockResponse(data);
    }
    // 5. ANALYTICS
    if (cleanUrl === "/api/analytics" && method === "GET") {
      const data = await apiMock.getAnalytics();
      return makeMockResponse(data);
    }
    // 6. ALERTS
    if (cleanUrl === "/api/alerts" && method === "GET") {
      const userId = queryParams.get("userId") || "";
      const data = await apiMock.getAlerts(userId);
      return makeMockResponse(data);
    }
    if (cleanUrl === "/api/alerts/mark-read" && method === "POST") {
      const userId = body.userId;
      const data = await apiMock.markAlertsRead(userId);
      return makeMockResponse(data);
    }
    // 7. CRON
    if (cleanUrl === "/api/cron/check-expiry" && method === "POST") {
      const data = await apiMock.checkExpiry();
      return makeMockResponse(data);
    }
    return makeMockResponse({ error: "Route not found in mock DB" }, 404);
  } catch (err: any) {
    console.error("Mock API execution error: ", err);
    return makeMockResponse({ error: err.message || "Mock DB Failure" }, 400);
  }
}
// Client side download trigger for plain text invoices
export function downloadClientInvoice(exchange: any) {
  const receiptContent = `=====================================================
                      MEDIALERT INVOICE
               Connecting Care. Reducing Waste.
=====================================================
Receipt ID:     RCP-${exchange.id.toUpperCase()}
Order Date:     ${new Date(exchange.createdAt).toLocaleString()}
Transaction Type: ${exchange.type}
Status:         ${exchange.status}
Payment ID:     ${exchange.paymentId || 'N/A (CASH MATCH)'}
-----------------------------------------------------
Item Details:
Medicine Name:   ${exchange.medicineName}
Delivery Area:   ${exchange.recipientLocation}
Handling Fee:    INR ${exchange.amount || '0.00'}.00
-----------------------------------------------------
Visakhapatnam Healthcare Match Point Logistics:
Matched Logistics Partner: Visakhapatnam King George Hospital (KGH) Liaison
Eco Footprint:   +0.45kg pharma wastes prevented!
=====================================================
            Thank you for helping our community!
                https://medialert-care.org
=====================================================`;
  const blob = new Blob([receiptContent], { type: "text/plain" });
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = `Invoice-${exchange.id}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(blobUrl);
}
export function isMockDatabaseActive(): boolean {
  return isStaticHost || forceMockFallback;
}
