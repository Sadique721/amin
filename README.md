# 🔷 Sanab — Enterprise Jewellery & Cosmetics Commerce Platform

<div align="center">

![Sanab Platform](https://img.shields.io/badge/Sanab-Enterprise_v1.0-8B5CF6?style=for-the-badge&logo=shopify&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20_LTS-339933?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Aiven_Cloud-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Authorize.net](https://img.shields.io/badge/Authorize.net-Payments-0C2451?style=for-the-badge&logo=visa&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

**A production-grade, multi-gateway e-commerce platform for Jewellery & Cosmetics with live Admin Analytics**

[🚀 Quick Start](#-quick-start) · [📖 Full Blueprint](docs/ANTIGRAVITY_ENTERPRISE_BLUEPRINT.md) · [💳 Payments](#-payment-gateways--security) · [📝 API Docs](#-api-documentation)

</div>

---

## 🚀 Recent Platform Updates & Enhancements

### 💳 Authorize.net Credit Card & COD Payment System
- **Real-Time Credit Card Processing**: Integrated Authorize.net Sandbox API (`authCaptureTransaction`) for direct card authorization & settlement.
- **Rich Payment Details Persistence**: Every order stores complete payment metadata including `cardholderName`, `cardLast4`, `transactionId` (`auth_tx_...`), payment method (`Card (Authorize.net)` / `COD`), and status (`PAID` / `PENDING`).
- **Order Details Display**: Complete breakdown on Order Details page (`/account/orders/[orderId]`) with guaranteed Card Number (`•••• •••• •••• 1111`) and Transaction ID rendering.

### 📊 100% Live Admin Panel Integration
- **Admin Orders (`/admin/orders`)**: Real-time order list with actual order totals (`ord.total`), payment method badges (`Card Authorize.net` / `COD`), status dropdowns, and 1-click **View Details** navigation.
- **Admin Dashboard (`/admin`)**: Real-time KPIs (Total Revenue, Total Orders, Pending Orders count, Active Users) fetched dynamically from backend database.
- **Admin Payments (`/admin/payments`)**: Live audit log of online transactions, gateway methods, customer names, and transaction IDs.
- **Admin Tax Invoices (`/admin/invoices`)**: Compliant GST receipt statements (`INV-5D160AD1`) with 1-click PDF download/print triggers.
- **Admin Categories (`/admin/categories`)**: Full CRUD management (Create, Read, Edit, Delete) for store categories with real-time Next.js proxy route handling.

### 🛒 Checkout & Customer UX Upgrades
- **Saved Address Quick-Selector**: Auto-fetches default shipping address on mount and presents 1-click selection pills on the checkout page.
- **Wishlist Persistence & Real-time Badging**: Real-time wishlist item toggle with local storage sync and MongoDB ObjectId query resolution.
- **Hydration Safety**: React SSR hydration guards (`mounted` state) added across cart badge, wishlist counts, and admin profile settings.

### 🔐 Security & Validation Fixes
- **Express Validation Middleware**: Enhanced `validationMiddleware` to preserve Express `req.params`, eliminating parameter casting errors (`could not determine data type of parameter $1`) on status updates.
- **Unified Database Architecture**: Consolidated production MongoDB service layer with high-reliability Next.js API proxy routes.

---

## 🏗️ Architecture Overview

```
Client (Browser) → Next.js App Router (:3000 / Proxy API)
                → Express.js Backend (:10001) → PostgreSQL (Aiven Cloud) / MongoDB
                                              → Authorize.net Sandbox API
                                              → Razorpay Gateway
                                              → Cloudinary CDN
```

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 16 (App Router) + TypeScript + Tailwind + Shadcn UI | Responsive e-commerce UI & Admin Panel |
| **Backend** | Node.js + Express.js (Clean Architecture) | REST API with modular services & validators |
| **Databases** | Aiven PostgreSQL & MongoDB 7 (Mongoose ODM) | Primary persistent data stores |
| **Payments** | Authorize.net + Razorpay + Cash On Delivery (COD) | Credit Cards, UPI, Net Banking, COD |
| **Media** | Cloudinary CDN | High-resolution image upload & optimization |
| **Auth** | JWT (Access + Refresh) + Passwordless OTP | Secure customer & admin authentication |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v20+ LTS
- **PostgreSQL / MongoDB** (local or Cloud DB)

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env    # Configure your DB & credentials
npm run dev             # Starts on http://localhost:10001
```

### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev             # Starts on http://localhost:3000
```

### 3. Open the App
- 🌐 **Frontend:** http://localhost:3000
- 🔧 **Admin Panel:** http://localhost:3000/admin
- 📡 **API Health:** http://localhost:3000/api/health

---

## 📁 Project Structure

```
sanab/
├── frontend/              # Next.js 16 App Router
│   ├── app/               # Route groups: (auth), (public), (customer), admin
│   │   ├── admin/         # Admin Dashboard, Orders, Payments, Invoices, Categories, Products
│   │   └── api/[...path]/ # Catch-all server proxy router for database operations
│   ├── components/        # UI elements, Header, Footer, Layout, Product Cards
│   ├── features/          # Redux Toolkit slices (auth, products, cart, wishlist, checkout)
│   ├── services/          # Axios API client
│   └── lib/               # Database helpers & schema mappings
│
├── backend/               # Express.js Clean Architecture API
│   └── src/
│       ├── config/        # Environment & CORS configuration
│       ├── database/      # PostgreSQL & MongoDB connection, seeding
│       ├── modules/       # Domain modules
│       │   ├── auth/      # OTP & Password login
│       │   ├── users/     # Customer & admin profile management
│       │   ├── products/  # Product catalogue & inventory
│       │   ├── categories/# Category hierarchy & CRUD
│       │   ├── orders/    # Order lifecycle & admin status updates
│       │   └── cms/       # Banners & FAQs
│       └── middlewares/   # Auth, Zod validation, error handling
│
├── docs/                  # Project documentation & blueprints
└── README.md              # Project documentation
```

---

## 🗄️ Database Schemas & Models

| Model / Table | Key Fields | Purpose |
|---------------|------------|---------|
| **`users`** | `id`, `name`, `email`, `phone`, `password`, `role`, `is_active` | Customer & Admin user accounts |
| **`categories`** | `id`, `name`, `slug`, `description`, `image`, `is_active` | Product category taxonomy |
| **`products`** | `id`, `name`, `slug`, `sku`, `price`, `stock`, `images`, `category_id`, `attributes` | Inventory items & variants |
| **`orders`** | `id`, `order_number`, `user_id`, `items`, `total`, `status`, `payment_details` | Customer order transactions |
| **`banners`** | `id`, `title`, `image`, `link`, `type`, `sort_order` | Promotional CMS banners |
| **`faqs`** | `id`, `question`, `answer`, `category`, `sort_order` | Store FAQ knowledgebase |

---

## 💳 Payment Gateways & Security

- **Authorize.net Credit Card**: Integrated for online card transactions with direct settlement (`authCaptureTransaction`).
- **Cash On Delivery (COD)**: Available for domestic shipping with instant order placement.
- **Razorpay Integration**: Support for UPI, Net Banking, and Wallets.
- **Security Protections**:
  - ✅ Bcrypt password hashing (10 rounds)
  - ✅ JWT Access & Refresh Token rotation
  - ✅ Zod schema validation on every request
  - ✅ Authorize.net Merchant Credential encryption

---

## 📝 Key API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/categories` | List all active product categories |
| `POST` | `/api/categories` | Create new category (Admin) |
| `PATCH` | `/api/categories/:id` | Update category details (Admin) |
| `DELETE` | `/api/categories/:id` | Delete category (Admin) |
| `GET` | `/api/products` | List products with pagination, search & filters |
| `POST` | `/api/products` | Create product with variants (Admin) |
| `POST` | `/api/orders` | Place new customer order |
| `GET` | `/api/orders/admin/list` | Fetch all orders for admin management |
| `PATCH` | `/api/orders/admin/:id/status` | Update order processing/shipping status |
| `POST` | `/api/payments/authorize/charge` | Execute Authorize.net card transaction |

---

<div align="center">

**Built with ❤️ for the Sanab Platform**

*Enterprise Commerce & Live Admin Operations.*

</div>
