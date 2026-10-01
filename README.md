# Mani Garments — Business App

A full-featured mobile-responsive React frontend for garment business management.

## Features

- **Multi-user login** with role-based access (Admin / Salesperson)
- **Dashboard** — today's sales, team performance, low-stock alerts, recent activity
- **Sales** — create bills, view invoices, filter by salesperson / payment status
- **Returns** — process returns from any invoice (cash refund / exchange / store credit)
- **Purchase** — vendor purchase orders with GST, freight, payment tracking
- **Stock / Inventory** — garment catalogue with sizes, pricing, low-stock alerts
- **Admin panel** — per-user permission toggles, store settings, sales chart, reports

## Demo Credentials

| Name   | Role       | PIN  |
|--------|------------|------|
| Mani   | Admin      | 1234 |
| Raju   | Salesperson| 1111 |
| Sunita | Salesperson| 2222 |
| Deepak | Salesperson| 3333 |

## Tech Stack

- React 18 + React Router v6
- CSS Modules (no external UI library)
- Recharts (for admin sales chart)
- Tabler Icons (CDN)
- Google Fonts — Inter

## Folder Structure

```
src/
├── components/
│   ├── ui/            # Reusable UI components (Badge, Button, Card, Toggle…)
│   └── layout/        # AppShell, TopBar, BottomNav
├── context/
│   ├── AuthContext    # Login, logout, role & permission management
│   └── AppContext     # Global state: bills, returns, purchases, stock
├── data/
│   └── staticData.js  # Seed data + helper functions
├── pages/
│   ├── LoginPage
│   ├── DashboardPage
│   ├── SalesPage / NewSalePage / ViewBillPage / EditBillPage / BillReturnPage
│   ├── ReturnsPage / NewReturnPage
│   ├── PurchasePage / NewPurchasePage
│   ├── StockPage / NewStockPage
│   ├── AdminPage / PermissionsPage
│   └── NotFoundPage
```

## Getting Started

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build for Production

```bash
npm run build
```

The `build/` folder is ready to deploy to Vercel, Netlify, or any static host.
