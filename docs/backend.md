# Backend Architecture & Modular Directory Structure
## Project: Jewellery & Cosmetics E-commerce REST API (Sanab)

This document outlines the complete modular, feature-based, and Clean Architecture directory structure for the Node.js + Express.js + TypeScript backend API. It isolates domains into independent module capsules containing their own database models, controllers, services, repositories, validators, and DTOs.

---

## 1. Directory Tree Overview

```text
backend/
├── src/                           # Backend Application Source Directory
│   ├── app.ts                     # Express App Config (Registers security, routes, middlewares, error boundaries)
│   ├── server.ts                  # Server Entry Point (Establishes DB connection, runs HTTP server listener)
│   │
│   ├── config/                    # Global Configuration Declarations (dotenv checked, typed exports)
│   │   ├── app.config.ts          # Port, Host, Node Environment definitions
│   │   ├── database.config.ts     # MongoDB credentials & Connection settings
│   │   ├── jwt.config.ts          # Tokens lifetime, secrets, rolling parameters
│   │   ├── cors.config.ts         # CORS whitelist parameters
│   │   ├── rate-limit.config.ts   # Rate limit presets for standard vs. OTP request rates
│   │   ├── cloudinary.config.ts   # Cloudinary integration keys
│   │   ├── swagger.config.ts      # Swagger doc definitions & UI setups
│   │   ├── env.ts                 # Sanitization of process.env variables (using cleanEnv/zod)
│   │   └── index.ts               # Configuration aggregator export
│   │
│   ├── database/                  # Core Database Operations
│   │   ├── connection.ts          # Mongoose connections management script
│   │   ├── seed/                  # Seeding scripts (Mock products, admin account provisioning)
│   │   ├── migrations/            # Data migration scripts
│   │   ├── indexes/               # Centralized text search or multi-field indexing pipelines
│   │   └── plugins/               # Reusable Mongoose schemas plugins
│   │       ├── paginate.plugin.ts # Shared pagination query builder plugin
│   │       └── slug.plugin.ts     # Slug generation plugin for categories & products
│   │
│   ├── modules/                   # Isolated Domain Features (Encapsulated Clean Architecture Modules)
│   │   ├── auth/                  # Identity, OTP generation & Verification
│   │   ├── users/                 # Customer details & Address book management
│   │   ├── products/              # Product listings, variant configuration & SKU inventory
│   │   ├── categories/            # Jewellery Collections & Cosmetic categories tree
│   │   ├── orders/                # Cart checkout, shipping state tracker & payment triggers
│   │   ├── payments/              # Stripe & Razorpay webhook endpoints & verification logic
│   │   ├── reviews/               # Product ratings & client review feedbacks
│   │   ├── coupons/               # Marketing discount codes calculation engine
│   │   ├── cms/                   # Carousel banners, FAQ grids, brand story management
│   │   ├── upload/                # Image uploads processing to Cloudinary
│   │   └── dashboard/             # Admin console analytics, KPIs & low stock reports
│   │
│   ├── shared/                    # Reusable Utilities & Modules shared across features
│   │   ├── api/
│   │   │   ├── ApiResponse.ts     # Standardized JSON response envelope
│   │   │   ├── ApiError.ts        # Unified base Error format
│   │   │   └── pagination.ts      # Helper functions to build paginated structures
│   │   ├── auth/
│   │   │   ├── jwt.ts             # Sign and verify JWT helpers
│   │   │   ├── password.ts        # Encrypt and compare hashes (bcrypt)
│   │   │   └── roles.ts           # Customer vs Admin permissions constants
│   │   ├── cloudinary/            # Cloudinary asset uploader wrapper
│   │   ├── email/                 # Transporter config to dispatch OTP email alerts (SendGrid/Nodemailer)
│   │   ├── sms/                   # Transporter config to dispatch OTP SMS alerts (Twilio)
│   │   ├── logger/                # Central logger (Winston + Morgan hooks)
│   │   ├── exceptions/            # Custom HTTP exceptions (BadRequestException, NotFoundException)
│   │   └── index.ts
│   │
│   ├── routes/                    # API Route Aggregation Layer
│   │   ├── index.ts               # Main router root (aggregates public and admin)
│   │   ├── public.routes.ts       # Customer/Visitor routes routing table
│   │   └── admin.routes.ts        # Operations panel paths (protected by admin middlewares)
│   │
│   ├── middlewares/               # Express Request Interceptors
│   │   ├── auth.middleware.ts     # Validates JWT signature, populates req.user context
│   │   ├── admin.middleware.ts    # Enforces admin role constraint checks
│   │   ├── validation.middleware.ts # Payload parsing middleware (using Joi/Zod validator)
│   │   ├── error.middleware.ts    # Global exception wrapper returning standardized ApiError response
│   │   ├── rate-limit.middleware.ts # Standard rate limits validator middleware
│   │   └── not-found.middleware.ts # 404 router catcher
│   │
│   ├── utils/                     # Generic Helpers (No Domain Business Rules)
│   │   ├── slugify.ts             # URL-safe text sanitizer
│   │   ├── sanitize.ts            # Strips malicious scripts or markup tags
│   │   ├── date.ts                # Date formatting and comparison utilities
│   │   └── generate-id.ts         # Cryptographic SKU/Invoice id generator
│   │
│   ├── constants/                 # Immutable application definitions
│   │   ├── roles.ts               # Role access strings
│   │   ├── status.ts              # Order state codes (Processing, Shipped, Delivered)
│   │   └── messages.ts            # Fixed system error alerts and validation messages
│   │
│   ├── types/                     # Shared TypeScript Interface Wrappers
│   │   ├── api.ts                 # Interfaces for API responses
│   │   ├── jwt.ts                 # Decoded token data payloads definition
│   │   └── request.ts             # Express Request extension parameters (attaches user context)
│   │
│   ├── validations/               # Global schemas (Pagination, shared query limits)
│   │
│   ├── events/                    # Event Dispatchers (EventEmitter mappings)
│   │   ├── product-created.event.ts
│   │   └── order-completed.event.ts
│   │
│   ├── jobs/                      # Scheduled Tasks (Cron jobs)
│   │   ├── clean-temp.job.ts      # Deletes temporary local uploaded file caches
│   │   └── db-backup.job.ts       # Runs scheduled snapshots of database collections
│   │
│   ├── queues/                    # Background Worker queues (BullMQ/Redis)
│   │   ├── email.queue.ts         # Asynchronous marketing email execution
│   │   └── notification.queue.ts  # Webhooks and push notification tasks execution
│   │
│   └── docs/                      # API Specification Files
│       ├── swagger/               # OpenAPI fragments
│       └── postman/               # JSON Collections exports
│
├── storage/                       # Local Temporary Directory (for multer file buffers)
│   ├── temp/
│   └── uploads/                   # Local file backup if Cloudinary is bypassed
│
├── logs/                          # Error and tracking log archives (Winston output)
├── tests/                         # Root tests
│   ├── unit/                      # Architecture logic unit test suites
│   ├── integration/               # Database and controller endpoints tests
│   └── e2e/                       # End-to-end user-flow scenarios
│
├── scripts/                       # Maintenance and CLI operations scripts
│   ├── create-admin-cli.ts        # Provision new administrators from SSH console
│   └── seed-data.ts               # Triggers DB setup execution
│
├── .env                           # Local environment configuration settings
├── .env.example                   # Empty template indicating required configurations
├── package.json                   # Script configurations & system dependency lists
├── tsconfig.json                  # Compiler specs and paths aliases maps
└── README.md
```

---

## 2. Encapsulated Module Architecture

Every domain feature under `/modules` is completely isolated, following a Clean Architecture design pattern. Developers can develop, test, and scale a single module with minimal coupling to the rest of the application.

### 2.1 Mapped Domain Module Structure (e.g. `modules/products`)
```text
modules/products/
├── controllers/
│   └── product.controller.ts      # Exposes routes, parses request parameters, delegates to service
├── services/
│   └── product.service.ts         # Contains business rules, handles variants pricing, inventory locks
├── repositories/
│   └── product.repository.ts      # Direct database interactions, isolates Mongoose model commands
├── models/
│   └── product.model.ts           # Mongoose schemas, properties, DB indices
├── routes/
│   └── product.routes.ts          # Route bindings specific to products
├── validators/
│   └── product.validation.ts      # Validation schemas (using Zod) for inputs
├── dto/                           # Data Transfer Objects (contracts for inputs and outputs)
│   ├── create-product.dto.ts      # Validated parameters to instantiate new products
│   ├── update-product.dto.ts      # Permitted parameters to update active products
│   └── product-response.dto.ts    # Sanitized properties returned to public client
├── interfaces/                    # TypeScript interfaces for database structures
├── types/                         # Local type mappings
├── constants/                     # Local constants (e.g., variant maximum limits)
├── mappers/                       # Maps database records to clean client-facing DTO structures
├── events/                        # Local event handlers (e.g., triggers low stock alert email)
├── docs/                          # Local Swagger OpenAPI description fragments
├── tests/                         # Local tests for the module
│   ├── product.service.spec.ts
│   └── product.controller.spec.ts
└── index.ts                       # Entry point (exposes public interface for this module)
```

---

## 3. Data & Request Flow Lifecycle

Requests follow a unidirectional path, keeping concerns separated at each layer:

```text
HTTP Request (e.g., POST /api/products)
      │
      ▼
Express Route (src/routes/admin.routes.ts)
      │
      ▼
Validation Middleware (src/middlewares/validation.middleware.ts)
      │
      ▼
Controller (modules/products/controllers/product.controller.ts)
      │
      ▼
Service (modules/products/services/product.service.ts)
      │
      ▼
Repository (modules/products/repositories/product.repository.ts)
      │
      ▼
Mongoose Model / MongoDB Database
      │
      ▼
Repository (Maps data using module-level mappers)
      │
      ▼
Service (Processes output, runs additional business verification)
      │
      ▼
Controller (Wraps output in standard ApiResponse envelope)
      │
      ▼
HTTP Standard JSON Response
```
