# Phase-Wise Project Implementation Plan
## Project: Jewellery & Cosmetics E-commerce Web App (Sanab)

This document provides a highly detailed, step-by-step, phase-wise implementation plan for both the frontend (Next.js, TypeScript, Redux Toolkit, Tailwind) and backend (Node.js, Express, TypeScript, MongoDB) based on the SRS, PRD, and folder architecture designs.

---

## Phase 1: Environment Setup, Tooling & Core Infrastructure

### 1.1 Backend Initial Infrastructure
1.  **TypeScript & Project Scaffold**:
    *   Initialize `backend/package.json` with scripts: `dev` (ts-node-dev), `build` (tsc), `start` (node dist/server.js), `lint`, `format`.
    *   Configure `backend/tsconfig.json` with strict typing and paths aliases mapping `@/*` to `src/*`.
    *   Set up `.env` and `src/config/env.ts` verifying environments (port, db connection URI, JWT secrets, payment API keys, SMS/Email SMTP keys) using Zod.
2.  **Database Connection & Core Plugins**:
    *   Create Mongoose initializer (`src/database/connection.ts`) with retry connection logic.
    *   Write database pagination plugin (`src/database/plugins/paginate.plugin.ts`) to intercept schema queries.
    *   Write auto-slug generator plugin (`src/database/plugins/slug.plugin.ts`) utilizing `slugify`.
3.  **Global Middlewares & Exceptions**:
    *   Create Winston logger configuration (`src/shared/logger/index.ts`).
    *   Implement global Express error handler middleware (`src/middlewares/error.middleware.ts`) formatting exceptions into a standard `ApiError` envelope.
    *   Implement route not found handler (`src/middlewares/not-found.middleware.ts`).
    *   Write generic validator middleware (`src/middlewares/validation.middleware.ts`) parsing request inputs against Zod schemas.
4.  **Routing Aggregator**:
    *   Build `src/app.ts` importing `express`, `cors`, `helmet`, `morgan` and registering the base API router `src/routes/index.ts`.
    *   Initialize `src/server.ts` binding the database and launching the HTTP server.

### 1.2 Frontend Scaffolding & Shared Shells
1.  **Tooling & Linters**:
    *   Install shadcn/ui components (`button`, `input`, `dialog`, `dropdown-menu`, `card`, `select`).
    *   Configure TypeScript path mappings (`@/*` to `*`).
    *   Set up Prettier and ESLint matching strict codebase rules.
2.  **Providers & Styles Configuration**:
    *   Implement `<ThemeProvider>` (`providers/ThemeProvider.tsx`) wrapping system palettes.
    *   Implement `<ReduxProvider>` (`providers/ReduxProvider.tsx`) configuring the Redux store with hooks (`store/hooks.ts`).
    *   Implement `<AppProvider>` (`providers/AppProvider.tsx`) aggregating Redux, Theme, and Toast alerts.
    *   Populate `styles/animations.css`, `styles/variables.css`, and `styles/utilities.css` for micro-interactions and transitions.
3.  **Layout Templates (Navbar & Footer)**:
    *   Build layout container grid (`components/common/container.tsx`).
    *   Build `components/layout/header.tsx` with dynamic search inputs, wishlist/cart item counts, and account session navigators.
    *   Build `components/layout/footer.tsx` with category index listings, legal policies link mappings, and newsletter newsletter inputs.

---

## Phase 2: Authentication & Profile Management

### 2.1 Backend Implementation
1.  **User Model & DTOs**:
    *   Define `User` Mongoose schema (`src/modules/users/models/user.model.ts`) with email, names, mobile, role enum (`customer`, `admin`), addresses sub-array, and wishlist references.
    *   Create request DTOs (`create-user.dto.ts`, `update-user.dto.ts`) and Zod validations (`auth.validation.ts`).
2.  **OTP & Auth Services**:
    *   Implement `AuthService` (`src/modules/auth/services/auth.service.ts`) handling OTP creation, validation status, and token lifecycle management.
    *   Write email/SMS transporter services (`src/shared/email/` & `src/shared/sms/`) sending 6-digit OTP codes.
3.  **Controllers & Routing**:
    *   Implement `AuthController` calling OTP generation and OTP verification.
    *   Bypass authentication checks on Google OAuth verify callback redirect.
    *   Create security middleware (`src/middlewares/auth.middleware.ts`) verifying JWT header signatures and mapping payload context to `req.user`.

### 2.2 Frontend Implementation
1.  **Redux Auth Slice**:
    *   Build `features/auth/store/auth-slice.ts` tracking `user`, `token`, loading states, and active logins.
2.  **UI Pages & OTP Components**:
    *   Create dynamic login form (`app/(auth)/login/page.tsx`) triggering OTP dispatch to email.
    *   Implement numeric OTP Dialog code entry popup component (`features/auth/components/otp-form.tsx`).
    *   Design user sign-up page (`app/(auth)/register/page.tsx`) collecting basic profile profiles (names, mobile).
3.  **Profile & Address Book Management**:
    *   Implement customer dashboard layouts (`app/(customer)/account/layout.tsx`).
    *   Create profile editing view (`app/(customer)/account/profile/page.tsx`) permitting details updates and management of multiple shipping addresses via Address Card components (`components/forms/address-form.tsx`).

---

## Phase 3: Catalog, Categories & Faceted Search

### 3.1 Backend Implementation
1.  **Schemas & Database Models**:
    *   Define Category schema (`src/modules/categories/models/category.model.ts`) with parent/child relations.
    *   Define Product schema (`src/modules/products/models/product.model.ts`) supporting variants (SKU, price, compareAtPrice, stock, and attributes: metal karat/cosmetic shade).
2.  **Search & Facet Aggregations**:
    *   Configure MongoDB compound text indexes across product title, brand, and tags.
    *   Build advanced pipeline query filters inside `ProductRepository` returning category matches, price ranges, brands, rating averages, and dynamic availability sorting.
3.  **Controllers & Operations Routing**:
    *   Expose paginated public listings routes (`/api/products` & `/api/products/:slug`).
    *   Create admin product creation routes supporting variant mapping configurations and validation.

### 3.2 Frontend Implementation
1.  **Redux Catalog Slice**:
    *   Build `store/productsSlice.ts` and `store/categoriesSlice.ts` to manage search terms, selected facets, and paginated product collections.
2.  **Components & Widgets**:
    *   Build presentational catalog page (`app/(public)/shop/page.tsx`).
    *   Implement Filter Sidebar component (`features/products/components/filter-sidebar.tsx`) parsing price sliders, categories, and brands.
    *   Build Product Detail page (`app/(public)/shop/[slug]/page.tsx`) wrapping image Zoom Gallery (`components/ui/zoom-gallery.tsx`) and swatches selectors (`features/products/components/variant-selector.tsx`).

---

## Phase 4: Shopping Cart & Dynamic Coupons

### 4.1 Backend Implementation
1.  **Coupons Model & Validations**:
    *   Build Coupon schema (`src/modules/coupons/models/coupon.model.ts`) tracking codes, discount values (percent/absolute), validity dates, thresholds, and limits.
    *   Implement validations endpoints `/api/coupons/validate` returning discount rates.
2.  **Cart Database Persistence**:
    *   Although cart state is primarily maintained client-side, implement API endpoint `/api/cart/sync` permitting customers to persist cart details to their user profile upon authentication.

### 4.2 Frontend Implementation
1.  **Redux Cart Slice**:
    *   Create `features/cart/store/cart-slice.ts` managing client operations: addition, quantity limit validation checks, updates, and coupon state.
    *   Add Redux middleware synchronizing active cart states with browser `localStorage`.
2.  **Cart Drawer & Summary UI**:
    *   Build dynamic slide-over Cart Drawer (`features/cart/components/cart-drawer.tsx`).
    *   Build full cart review summary page (`app/(public)/cart/page.tsx`) showcasing checkout checkout items, subtotals, and coupon apply boxes (`features/cart/components/coupon-code.tsx`).

---

## Phase 5: Checkout & Payment Gateway Integration

### 5.1 Backend Implementation
1.  **Order Model**:
    *   Define Order schema (`src/modules/orders/models/order.model.ts`) mapping items, shipping addresses, payment details, subtotal, tax, discounts, final totals, tracking statuses, and reference numbers.
2.  **Payment Integrations**:
    *   Initialize SDK integrations in `src/config/stripe.ts` and `src/config/razorpay.ts`.
    *   Build checkout endpoint `/api/orders/create` locking catalog inventory.
    *   Build verification endpoint `/api/orders/verify` validating webhook signatures to prevent fraud.
    *   Integrate Cash on Delivery (COD) checks based on shipping ZIP code constraints.

### 5.2 Frontend Implementation
1.  **Checkout Interface**:
    *   Build checkout page (`app/(public)/checkout/page.tsx`).
    *   Design multi-step layouts: Shipping Address Selector $\rightarrow$ Order Summary review $\rightarrow$ Payment Gateways Selection (Stripe vs Razorpay vs COD).
2.  **Payment Components Integration**:
    *   Write Stripe Elements wrapper forms (`features/checkout/components/stripe-form.tsx`).
    *   Implement Razorpay SDK load scripts (`features/checkout/components/razorpay-button.tsx`).
    *   Build order success page (`app/(customer)/account/orders/[orderId]/page.tsx`) mapping tracking details.

---

## Phase 6: Admin Dashboard & Inventory Controls

### 6.1 Backend Implementation
1.  **Dashboard Analytics aggregations**:
    *   Build endpoint `/api/admin/dashboard/stats` compiling sales metrics (GMV, order rates, average cart sizes) and inventory alerts.
2.  **Admin CRUD Controls**:
    *   Implement security check middleware (`src/middlewares/admin.middleware.ts`) enforcing `role === 'admin'`.
    *   Add admin routes for editing categories, products, inventory records, and coupons.
    *   Expose orders dashboard endpoints allowing managers to update fulfillment statuses (Pending, Processing, Shipped, Delivered, Cancelled) and input tracking information.

### 6.2 Frontend Implementation
1.  **Admin Portal Layout**:
    *   Build admin routing shell layouts (`app/admin/layout.tsx`) mapping sidebar menu controls.
    *   Create analytics home panel (`app/admin/page.tsx`) mapping visual charts.
2.  **Admin Forms & CRUD Lists**:
    *   Build list tables supporting search, filters, and status modification dialog forms.
    *   Create new product and category creation forms (`app/admin/products/new/page.tsx`) featuring file upload dropzones.

---

## Phase 7: CMS / Banners, SEO, & Marketing Integrations

### 7.1 Backend Implementation
1.  **CMS Configuration Models**:
    *   Define CMS schemas (`src/modules/cms/models/cms.model.ts`) storing carousel banner configs, FAQs, and brand stories.
2.  **Media Upload Engine**:
    *   Configure `multer` and `cloudinary` wrappers (`src/config/multer.config.ts`, `src/config/cloudinary.config.ts`).
    *   Create `/api/upload` endpoint routing file streams to Cloudinary folder destinations (`storage/products`, `storage/categories`).

### 7.2 Frontend Implementation
1.  **Dynamic Homepage Composition (Widgets)**:
    *   Build Homepage (`app/(public)/page.tsx`) rendering components from `/widgets/`.
    *   Implement dynamic sliders inside `HeroWidget` (`widgets/Hero/index.tsx`) matching CMS DB banner entries.
    *   Implement category sliders inside `FeaturedCategoriesWidget`.
2.  **SEO & Analytics Integration**:
    *   Implement JSON-LD structured schemas (`components/common/seo.tsx`) generating Google rich product snippets.
    *   Add Google Analytics and Meta Pixel track scripts.
    *   Inject dynamic metadata keys into product details layout files.

---

## Phase 8: Testing, Logs, & Production Deployments

### 8.1 Backend Infrastructure Hardening
1.  **Background Workers & Queues**:
    *   Configure BullMQ/Redis connections (`src/config/redis.config.ts`) running queues for notifications.
    *   Write database backup routines (`src/scripts/backup-db.ts`) and file cache cleanup tasks (`src/jobs/clean-temp.job.ts`).
2.  **API Hardening**:
    *   Configure `helmet` headers, CORS origins, and request limits rules.
    *   Write Jest unit test suites for products services and mock integration tests (`tests/integration/`).

### 8.2 Frontend & Launch Preparations
1.  **Lighthouse Audit Fixes**:
    *   Convert assets to WebP format, configure responsive sizes, and use correct Next.js image loading properties.
    *   Verify WCAG 2.1 compliance.
2.  **Git & Deployment Configs**:
    *   Set up Git hooks using Husky and lint-staged on staging.
    *   Deploy backend to AWS Elastic Beanstalk (with MongoDB Atlas) and frontend app to Vercel CDN.
