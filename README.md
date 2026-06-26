# MediAlert - Connecting Care. Reducing Waste.

MediAlert is a secure, modern medicine exchange and expiry management ecosystem designed to prevent life-saving drug waste by matching unused, verified medicine strips with families in need.

The application has been engineered to run in a **hybrid mode**:
1. **Full-Stack Mode**: Communicates with a local Node/Express database server.
2. **Client-Side Simulation (GitHub Pages)**: Automatically detects when hosted on static services (like GitHub Pages) or when the server is unreachable, seamlessly falling back to a client-side database simulation stored in `localStorage`. All features (login, listing medicines, swap matching, payments, notifications, and receipt downloads) continue to function perfectly!

---

## Key Features

- **Ecosystem Marketplace**: Browse and search medicine listings verified near Visakhapatnam drop points (KGH, SevenHills, CARE). Expired medicines are automatically hidden.
- **Dynamic Expiry Status Monitoring**: Colors indicate drug freshness (Green: safe, Yellow: warning, Red: urgent expiry check).
- **Rx Prescription Verification**: Prescription-only items require admin review and validation before becoming public.
- **Secure Simulated Checkout**: Standard checkout handling fee payment workflow simulated via Razorpay.
- **Invoice Downloads**: Generate and download invoice text receipts directly in-browser.
- **Real-Time Notification Alerts**: Users receive notifications on listing approvals, transaction matches, and expiry warnings.

---

## Run Locally

### Prerequisites
- [Node.js](https://nodejs.org) (v18 or higher)

### Setup & Run
1. **Clone the repository** (or navigate to the project directory)
2. **Install dependencies**:
   ```bash
   npm install
