# Frontend Architecture & Modular Directory Structure
## Project: Jewellery & Cosmetics E-commerce Web App (Sanab)

This document outlines the complete modular, feature-based directory structure for the Next.js (App Router), TypeScript, Tailwind CSS, and Redux Toolkit frontend. It adopts a highly scalable architectural pattern using independent feature capsules, a dedicated widgets layer for page composition, strict component organization, and standardized folders for configurations, types, Zod validations, and services.

---

## 1. Directory Tree Overview

```text
frontend/
├── app/                           # Next.js App Router (Routing, Layouts, Page entry points)
│   ├── (public)/                  # Public customer-facing routes (grouped route category)
│   │   ├── page.tsx               # Homepage (Landing page composed using Widgets)
│   │   ├── shop/
│   │   │   ├── page.tsx           # Faceted Product Catalog page
│   │   │   └── [slug]/
│   │   │       └── page.tsx       # Product details page with image zoom
│   │   ├── categories/
│   │   │   └── page.tsx           # Categories listing page
│   │   ├── wishlist/
│   │   │   └── page.tsx           # User Wishlist page
│   │   ├── cart/
│   │   │   └── page.tsx           # Shopping Cart page
│   │   └── checkout/
│   │       └── page.tsx           # Checkout shipping address & billing screen
│   ├── (auth)/                    # Customer Authentication routes
│   │   ├── login/
│   │   │   └── page.tsx           # OTP login page
│   │   └── register/
│   │       └── page.tsx           # Registration page
│   ├── (customer)/                # Customer account pages (restricted to logged in users)
│   │   └── account/
│   │       ├── layout.tsx         # Account dashboard sidebar layout
│   │       ├── profile/
│   │       │   └── page.tsx       # Profile info and active addresses management
│   │       └── orders/
│   │           ├── page.tsx       # List of past orders
│   │           └── [orderId]/
│   │               └── page.tsx   # Specific order tracking detail page
│   ├── admin/                     # Admin operations portal (restricted to role = 'admin')
│   │   ├── layout.tsx             # Admin shell navigation sidebar layout
│   │   ├── page.tsx               # Analytics KPIs & sales reports page
│   │   ├── products/              # Products listing and CRUD admin views
│   │   │   ├── page.tsx
│   │   │   └── new/
│   │   │       └── page.tsx
│   │   ├── orders/                # Orders management list view
│   │   │   └── page.tsx
│   │   └── cms/             # CMS management (banners & coupons & FAQs)
│   │       └── page.tsx
│   ├── api/                       # Next.js Route Handlers (for proxying or serverless tasks)
│   ├── layout.tsx                 # Root layout (Html structure, global fonts, Providers wrap)
│   ├── not-found.tsx              # Custom 404 page
│   ├── error.tsx                  # Global error boundary page
│   ├── loading.tsx                # Page-level loader/spinner fallback
│   └── globals.css                # Tailwind import and theme variables root
│
├── components/                    # Global Shared UI Components (Pure, Presentational, Reusable)
│   ├── ui/                        # Low-level primitives (shadcn components only)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── card.tsx
│   │   └── select.tsx
│   ├── layout/                    # Global shell structures
│   │   ├── header.tsx             # Primary navigation navbar (search, cart counter, profile menu)
│   │   ├── footer.tsx             # Brand footer containing policy links and newsletter form
│   │   └── sidebar.tsx            # Collapsible filters or mobile navigation sidebar
│   ├── navigation/                # Multi-page navigation elements
│   │   ├── breadcrumb.tsx
│   │   └── pagination.tsx
│   ├── cards/                     # General display cards
│   │   ├── product-card.tsx       # Unified card displaying product image, title, price, and badges
│   │   ├── category-card.tsx      # Highlighting individual jewellery/cosmetics collections
│   │   └── review-card.tsx        # Customer review card with star rating
│   ├── forms/                     # Shared multi-field forms
│   │   ├── address-form.tsx       # Address creation and update form
│   │   └── contact-form.tsx       # Standard contact email submit form
│   ├── sections/                  # Presentational static layouts
│   │   ├── hero-banner.tsx
│   │   └── brand-story.tsx
│   ├── feedback/                  # State indicators
│   │   ├── empty-state.tsx        # Displays when lists (wishlist, cart) are empty
│   │   ├── error-state.tsx        # Inline API failure alerts
│   │   └── skeletons/             # Loading skeletons for products grid and text blocks
│   ├── common/                    # Generic wrapping containers
│   │   ├── container.tsx          # Responsive max-width wrapper
│   │   ├── section-title.tsx      # Headings with secondary subtitles
│   │   └── seo.tsx                # Meta tags and OpenGraph injection
│   └── icons/                     # SVG custom icon wrappers
│
├── widgets/                       # Homogenous compositions of features & layout sections (Homepage)
│   ├── Hero/                      # Interactive campaign banner carousel widget
│   ├── FeaturedCategories/        # Category grids (Jewellery vs. Cosmetics entry cards)
│   ├── BestSellers/               # Product grids mapped with top orders data
│   ├── NewArrivals/               # Horizontal product lists showing fresh SKUs
│   ├── LimitedOffers/             # Countdown discount promotional cards
│   ├── BrandStory/                # Premium narrative widget with media backgrounds
│   ├── CustomerReviews/           # Interactive scrolling testimonial carousels
│   └── Newsletter/                # Email subscription box widget
│
├── features/                      # Independent Domain Feature Modules (Domain capsules)
│   ├── auth/                      # Authentication Feature Module
│   │   ├── api/                   # Auth-specific network requests
│   │   ├── components/            # Auth-specific UI (OTP input fields, social login buttons)
│   │   ├── hooks/                 # Custom authentication helpers (e.g. useAuthToken)
│   │   ├── services/              # OTP validation logic & session managers
│   │   ├── store/                 # Auth Redux state slice & credentials store
│   │   ├── types/                 # JWT tokens and user model structures
│   │   ├── schemas/               # Client-side validations (Zod schemas for email validation)
│   │   └── index.ts               # Feature public API export entry
│   │
│   ├── products/                  # Product Operations Feature Module
│   │   ├── api/
│   │   ├── components/            # ZoomGallery, VariantSelectors, ColorSwatches
│   │   ├── hooks/                 # useProductFilters, useProductVariant
│   │   ├── services/              # Fetching related items, matching variant configurations
│   │   ├── store/                 # Products caching and filter state management
│   │   ├── types/                 # Product, variant, metal karat, cosmetic shade interfaces
│   │   ├── schemas/
│   │   └── index.ts
│   │
│   ├── cart/                      # Cart Feature Module
│   │   ├── api/
│   │   ├── components/            # CartDrawer, CartSummary, QuantityToggle
│   │   ├── store/                 # Cart list slice with sync to local storage/API
│   │   └── index.ts
│   │
│   └── checkout/                  # Checkout & Payments Feature Module
│       ├── api/
│       ├── components/            # StripePaymentForm, RazorpayCheckoutButton
│       ├── services/              # Payment verification routines
│       ├── store/                 # Billing state & coupon application slices
│       └── index.ts
│
├── config/                        # Global App Configuration Declarations
│   ├── site.ts                    # Site meta details, SEO fallbacks, branding configurations
│   ├── navigation.ts              # Header/Footer menu trees and subcategory redirects
│   ├── theme.ts                   # Styling specifications, fonts, system defaults
│   ├── social.ts                  # Brand social media channel links (Instagram, WhatsApp, FB)
│   └── api.ts                     # API URLs, headers, and rate limits
│
├── constants/                     # Centralized immutable project constants
│   ├── routes.ts                  # Application route pathways (e.g., CLIENT_ROUTES.SHOP, ADMIN_ROUTES.DASHBOARD)
│   ├── query-keys.ts              # Keys for caching strategies
│   ├── roles.ts                   # Role definitions (e.g., customer, admin)
│   ├── storage.ts                 # Local storage identifier keys (e.g., token, wishlist, cart)
│   └── colors.ts                  # Dynamic color palette configs
│
├── types/                         # Shared TypeScript Declarations
│   ├── product.ts
│   ├── category.ts
│   ├── order.ts
│   ├── user.ts
│   ├── api.ts                     # Unified API request/response wrappers
│   └── pagination.ts              # Page information interfaces
│
├── validations/                   # Unified Frontend Zod Validation Schemas
│   ├── auth.ts                    # Login validation schema
│   ├── address.ts                 # Address forms validations
│   ├── checkout.ts                # Checkout payment forms schemas
│   └── contact.ts                 # Contact messages validation rules
│
├── services/                      # Decoupled Data Fetching and Services Layer (No React UI code)
│   ├── axios.ts                   # Shared axios client setup (with error handlers and auth interceptors)
│   ├── product.service.ts         # Handles API communications for products
│   ├── category.service.ts        # Handles API communications for categories
│   ├── order.service.ts           # Handles API communications for orders
│   └── coupon.service.ts          # Handles API communications for coupon verification
│
├── store/                         # Global Redux Store State configuration
│   ├── index.ts                   # Store initialization and typing hooks
│   ├── rootReducer.ts             # Merges domain-specific feature reducers
│   ├── productsSlice.ts           # Global store slices for shared states
│   └── categoriesSlice.ts         # Categories store slice for menus
│
├── providers/                     # React Context and Global Wrappers
│   ├── ThemeProvider.tsx          # Wrapper for dark/light mode context
│   ├── ReduxProvider.tsx          # Injects the global Redux state store
│   └── AppProvider.tsx            # Main parent wrapper enclosing Theme, Redux, and Toast context
│
├── lib/                           # Generic Utility Library Initializations
│   ├── utils.ts                   # CSS merge functions (clsx + tailwind-merge)
│   ├── env.ts                     # Runtime environment variables checking/validation
│   ├── seo.ts                     # Meta tags generation function
│   ├── cookies.ts                 # Client-side session cookie management (JWT tokens)
│   └── auth.ts                    # Token decoding and expiry utilities
│
├── hooks/                         # Global Shared Hooks (Pure, utility hooks only)
│   ├── useDebounce.ts             # Throttling search entries
│   ├── useMediaQuery.ts           # Screen breakpoint matching
│   ├── useDisclosure.ts           # Toggles modal/drawer open-close states
│   └── useMounted.ts              # Handles hydration/mounting state checks
│
├── styles/                        # Custom stylesheet components
│   ├── animations.css             # Micro-interactions, hover slides, zoom actions
│   ├── variables.css              # Styling themes, palettes, responsive spacings
│   └── utilities.css              # Custom Tailwind layout utility helper overrides
│
├── public/                        # Static assets (Directly served assets)
│   ├── images/
│   ├── logos/                     # Brand logo assets (desktop, mobile, favicon)
│   ├── icons/                     # Payment widgets and security indicators
│   ├── products/                  # Demo/Fallback product catalog files
│   └── banners/                   # Hero carousels and promotional cards
│
├── middleware.ts                  # Route-level authorization interception
├── .env.example                   # Local environment file templates
├── .env.local                     # Ignored local environment definitions
├── commitlint.config.js           # Git commit message standardizer
├── lint-staged.config.js          # Runs prettier/eslint on staged changes before commit
├── .husky/                        # Pre-commit git hooks controls
├── package.json
├── tsconfig.json
└── README.md
```

---

## 2. Key Architecture Details

### 2.1 The Feature-Modular Encapsulation
Rather than separating components, logic, and state definitions across global folders, each domain (e.g., `products`, `auth`) has its own encapsulated feature folder.
*   All logic inside `features/products/` is dedicated to products.
*   Other features or global components access its functionality only through imports defined in `features/products/index.ts` (acting as the public API gatekeeper).

### 2.2 Widgets Layer
Widgets compose feature-level components and presentational components into reusable sections on pages. This keeps page layouts (such as `app/(public)/page.tsx`) highly readable:
```tsx
import { HeroWidget } from '@/widgets/Hero';
import { FeaturedCategoriesWidget } from '@/widgets/FeaturedCategories';
import { BestSellersWidget } from '@/widgets/BestSellers';
import { CustomerReviewsWidget } from '@/widgets/CustomerReviews';

export default function HomePage() {
  return (
    <>
      <HeroWidget />
      <FeaturedCategoriesWidget />
      <BestSellersWidget />
      <CustomerReviewsWidget />
    </>
  );
}
```

### 2.3 Strict Component Separation
To prevent clutter, `components/` is organized strictly:
*   `components/ui/`: Contains raw UI primitives installed via shadcn (e.g., `button.tsx`, `input.tsx`).
*   `components/cards/`, `components/forms/`, `components/feedback/`: Contain generic, presentational, or layout-specific UI elements that do not contain core business domain states.

### 2.4 Decoupled Services & Validations
*   `services/`: Restricts React rendering code. It handles core HTTP REST requests, axios interceptors, token injections, and custom error formats.
*   `validations/`: Contains Zod validation rules that are shared across forms and request payloads.
