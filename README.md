# 🔷 Antigravity — Enterprise Jewellery & Cosmetics Commerce Platform

<div align="center">

![Antigravity](https://img.shields.io/badge/Antigravity-Enterprise_v1.0-8B5CF6?style=for-the-badge&logo=shopify&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20_LTS-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Kafka](https://img.shields.io/badge/Apache_Kafka-3.7-231F20?style=for-the-badge&logo=apachekafka&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Razorpay](https://img.shields.io/badge/Razorpay-Payments-0C2451?style=for-the-badge&logo=razorpay&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

**A production-grade, event-driven e-commerce platform for Jewellery & Cosmetics**

[🚀 Quick Start](#-quick-start) · [📖 Full Blueprint](docs/ANTIGRAVITY_ENTERPRISE_BLUEPRINT.md) · [🐳 Docker](#-docker-compose) · [📝 API Docs](#-api-documentation)

</div>

---

## 🏗️ Architecture Overview

```
Client (Browser) → Nginx → Next.js Frontend (:10002)
                         → Express.js Backend (:10001) → MongoDB / Redis / Kafka
                                                       → BullMQ Workers
                                                       → Razorpay Gateway
                                                       → Cloudinary CDN
```

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 16 (App Router) + TypeScript + Tailwind + Shadcn UI | Premium responsive UI |
| **Backend** | Node.js + Express.js (Clean Architecture) | REST API with domain modules |
| **Database** | MongoDB 7 (Mongoose ODM) | Primary data store |
| **Cache** | Redis 7 | Sessions, caching, distributed locks |
| **Events** | Apache Kafka (KafkaJS) | Domain event streaming |
| **Jobs** | BullMQ | Background email, image, notification processing |
| **Payments** | Razorpay | UPI, Cards, EMI, Wallets, QR, Net Banking |
| **Media** | Cloudinary | Image upload, optimization, CDN delivery |
| **Auth** | JWT (Access + Refresh) + Google OAuth + OTP | Multi-method authentication |
| **Monitoring** | Prometheus + Grafana + Loki | Metrics, dashboards, logs |

> 📖 **Full technical documentation:** [Antigravity Enterprise Blueprint](docs/ANTIGRAVITY_ENTERPRISE_BLUEPRINT.md) — 24-section deep-dive into architecture, schemas, events, payments, Docker, security, CI/CD, and more.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v20+ LTS
- **MongoDB** (local or Atlas — auto-fallback to in-memory if offline)
- **Redis** (optional — graceful fallback to in-memory queue)

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env    # Configure your secrets
npm run dev             # Starts on http://localhost:10001
```

### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
npx next dev -p 10002   # Starts on http://localhost:10002
```

### 3. Open the App
- 🌐 **Frontend:** http://localhost:10002
- 🔧 **Backend API:** http://localhost:10001
- 📡 **API Health:** http://localhost:10001/api/health

---

## 🐳 Docker Compose

Launch the full stack with a single command:

```bash
docker compose up --build -d
```

### Port Mapping

| Service | Port | URL |
|---------|------|-----|
| Next.js Frontend | `10002` | http://localhost:10002 |
| Express Backend | `10001` | http://localhost:10001 |
| Nginx Reverse Proxy | `10080` | http://localhost:10080 |
| MongoDB | `27017` | — |
| Mongo Express | `10081` | http://localhost:10081 |
| Redis | `6379` | — |
| Redis Insight | `10082` | http://localhost:10082 |
| Kafka | `9092` | — |
| Kafka UI | `10090` | http://localhost:10090 |
| Prometheus | `9090` | http://localhost:9090 |
| Grafana | `10030` | http://localhost:10030 |
| MailHog | `10025` | http://localhost:10025 |

```bash
docker compose down     # Stop all services
docker compose logs -f  # View live logs
```

---

## 📁 Project Structure

```
antigravity/
├── frontend/              # Next.js 16 App Router
│   ├── app/               # Route groups: (auth), (public), (customer), admin
│   ├── components/        # UI, layout, common, product components
│   ├── features/          # Redux Toolkit slices (auth, products, cart, wishlist)
│   ├── hooks/             # Custom React hooks
│   ├── services/          # Axios API client
│   ├── store/             # Redux store configuration
│   └── styles/            # Global CSS, animations, variables
│
├── backend/               # Express.js Clean Architecture API
│   └── src/
│       ├── config/        # Environment, CORS, Swagger
│       ├── database/      # MongoDB connection, seeding, plugins
│       ├── modules/       # Domain modules (12 modules)
│       │   ├── auth/      # Authentication & sessions
│       │   ├── users/     # User management
│       │   ├── products/  # Product catalogue
│       │   ├── categories/# Category hierarchy
│       │   ├── orders/    # Order lifecycle
│       │   ├── payments/  # Razorpay integration
│       │   ├── coupons/   # Discount system
│       │   ├── wishlist/  # Wishlist management
│       │   ├── reviews/   # Ratings & reviews
│       │   ├── cms/       # Banners, FAQs
│       │   ├── dashboard/ # Admin analytics
│       │   └── upload/    # Cloudinary media
│       ├── events/        # Kafka event definitions
│       ├── queues/        # BullMQ queue definitions
│       ├── middlewares/   # Auth, validation, error handling
│       └── shared/        # Logger, ApiError, utilities
│
├── docs/                  # Full enterprise documentation
│   ├── ANTIGRAVITY_ENTERPRISE_BLUEPRINT.md  # 📖 Complete blueprint
│   ├── PRD.md             # Product Requirements Document
│   ├── SRS.md             # Software Requirements Specification
│   └── implementation_plan.md
│
├── docker-compose.yml     # Full infrastructure orchestration
└── README.md              # This file
```

---

## 🗄️ Database (MongoDB)

| Collection | Purpose |
|------------|---------|
| `users` | Customer & admin accounts with sessions |
| `products` | Catalogue with variants, text indexes |
| `categories` | Hierarchical product categories |
| `orders` | Purchase orders with status tracking |
| `payments` | Razorpay transaction records |
| `coupons` | Discount codes with usage limits |
| `reviews` | Product ratings & reviews |
| `wishlists` | User wishlists |
| `banners` | CMS promotional banners |
| `faqs` | Frequently asked questions |
| `inventoryledger` | Stock movement audit trail |
| `webhooklogs` | Payment webhook idempotency |
| `otps` | OTP codes with TTL |

---

## 💳 Payment Gateway (Razorpay)

Supports all major Indian payment methods:

| Method | Examples |
|--------|---------|
| **UPI** | Google Pay, PhonePe, Paytm, BHIM |
| **Cards** | Visa, Mastercard, Amex, RuPay |
| **Net Banking** | 50+ Indian banks |
| **Wallets** | Paytm, Amazon Pay, Mobikwik |
| **EMI** | Card EMI (3/6/9/12/24 months) |
| **Pay Later** | Simpl, LazyPay, ICICI Pay Later |
| **UPI QR** | Dynamic QR codes |

---

## 🔐 Security

- ✅ Bcrypt password hashing (10 salt rounds)
- ✅ JWT access + refresh token rotation
- ✅ HMAC SHA256 payment signature verification
- ✅ Rate limiting (100 req/min per IP)
- ✅ Helmet security headers (CSP, HSTS, X-Frame-Options)
- ✅ CORS strict origin whitelist
- ✅ Zod input validation on every endpoint
- ✅ Webhook idempotency with `webhooklogs`
- ✅ Active device session auditing & remote revocation

---

## 📊 Demo Data

On first startup, the backend automatically seeds:

- **8 Categories:** Gold Rings, Diamond Necklaces, Luxury Earrings, Fine Bracelets, Matte Lipsticks, Liquid Foundations, Natural Skin Creams, Eye Shadow Palettes
- **30 Premium Products:** 15 Jewellery + 15 Cosmetics items with prices, descriptions, images, and variants
- **Admin Account:** `admin@antigravity.com` / configured password

---

## 📝 API Documentation

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/public/products` | List products (search, filter, sort, paginate) |
| `GET` | `/api/public/products/:slug` | Product detail |
| `GET` | `/api/public/categories` | All categories |
| `GET` | `/api/public/products/facets` | Filter facets (brands, price ranges) |
| `GET` | `/api/public/cms/banners` | Homepage banners |
| `GET` | `/api/public/cms/faqs` | FAQ list |
| `POST` | `/api/auth/register` | User registration |
| `POST` | `/api/auth/login` | User login |
| `POST` | `/api/auth/refresh` | Token refresh |
| `POST` | `/api/auth/logout` | User logout |
| `GET` | `/api/wishlist` | User wishlist |
| `POST` | `/api/wishlist` | Add to wishlist |
| `POST` | `/api/orders` | Create order |
| `POST` | `/api/payments/create-order` | Create Razorpay order |
| `POST` | `/api/payments/verify` | Verify payment signature |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is proprietary and confidential.

---

<div align="center">

**Built with ❤️ by the Antigravity Team**

*Enterprise-grade commerce for the modern web.*

</div>
