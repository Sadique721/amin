# Sanab Project Execution TODO List

This document lists the tasks required to implement the Jewellery & Cosmetics E-commerce Web App (Sanab). It will be updated as work progresses.

---

## Phase 1: Environment Setup, Tooling & Core Infrastructure

### 1.1 Backend Initial Infrastructure
- [x] **Task 1.1.1**: Setup TypeScript compiler rules and verify environment variables in `src/config/env.ts` using Zod validation.
- [x] **Task 1.1.2**: Write database connection helper in `src/database/connection.ts` and plugins (pagination query helper, auto-slug generation plugin).
- [x] **Task 1.1.3**: Configure Winston logger in `src/shared/logger/index.ts` and set up global Express error handling/not-found middlewares.
- [x] **Task 1.1.4**: Configure standard request input validator middleware (`src/middlewares/validation.middleware.ts`) powered by Zod.
- [x] **Task 1.1.5**: Wire up route aggregation in `src/routes/index.ts` and initialize listeners inside `src/app.ts` and `src/server.ts`.

### 1.2 Frontend Scaffolding & Shared Shells
- [x] **Task 1.2.1**: Validate TypeScript settings, install core UI components (shadcn), and configure lint/prettier rules.
- [x] **Task 1.2.2**: Implement global providers (`ThemeProvider`, `ReduxProvider`, `AppProvider`) and configure custom style stylesheets (`styles/*.css`).
- [x] **Task 1.2.3**: Build presentational global containers: Container wrapper, Navbar/Header (with dummy counters), and footer with brand details.

---

## Phase 2: Authentication & Profile Management
- [x] **Task 2.1**: Define Mongoose User Schema and write validation/DTO schemas.
- [x] **Task 2.2**: Implement passwordless email-OTP service routines, secure JWT provision token setups, and Google OAuth hooks.
- [x] **Task 2.3**: Build frontend Redux auth slices, dynamic OTP inputs forms UI, and profile address management screens.

---

## Phase 3: Catalog, Categories & Faceted Search
- [ ] **Task 3.1**: Create Mongoose schemas for Products (supporting variant definitions) and Categories.
- [ ] **Task 3.2**: Configure compound text search indexes and pipeline query search filters in repositories.
- [ ] **Task 3.3**: Construct Next.js catalog lists, filters sidebars, variant select components, and zoom photo galleries.

---

## Phase 4: Shopping Cart & Dynamic Coupons
- [ ] **Task 4.1**: Build backend Coupon schemas and validate-cart-discount endpoints.
- [ ] **Task 4.2**: Configure frontend cart Redux store slices with local storage persistence and dynamic coupon entry validation.

---

## Phase 5: Checkout & Payment Gateway Integration
- [ ] **Task 5.1**: Define Mongoose Order schemas and set up payment validations (Stripe and Razorpay verification signatures).
- [ ] **Task 5.2**: Embed Stripe Elements forms, Razorpay SDK buttons, and complete checkout success views.

---

## Phase 6: Admin Dashboard & Inventory Controls
- [ ] **Task 6.1**: Implement admin analytics endpoints and security checkers.
- [ ] **Task 6.2**: Design admin portal layout with charts, products/categories inventory management tables, and order fulfillment status update controls.

---

## Phase 7: CMS / Banners & SEO Integrations
- [ ] **Task 7.1**: Implement CMS schemas and uploader services mapped to Cloudinary.
- [ ] **Task 7.2**: Design homepage layouts composed of widgets and inject dynamic SEO rich-snippets schemas.

---

## Phase 8: Testing, Logs, & Production Deployments
- [ ] **Task 8.1**: Setup BullMQ queues, cron cleanups, and Jest unit/integration test suites.
- [ ] **Task 8.2**: Build performance validations, configure Vercel/AWS environments, and launch.
