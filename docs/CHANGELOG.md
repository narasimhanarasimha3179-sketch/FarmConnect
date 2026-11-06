# FarmConnect – Changelog

All notable changes to the FarmConnect project will be documented in this file.
This project adheres to **STRICT ANTIGRAVITY DEVELOPMENT RULES** with permanent feature preservation and incremental progression.

---

## [Phase 11, Phase 12, Phase 13] - Agri-Science Knowledge, Soil Health & Pest IPM - 2026-11-06

### Added
- **Phase 11: Crop Cultivation & Farming Assistance:**
  - `backend/src/controllers/cropAssistanceController.js` & `backend/src/routes/cropAssistanceRoutes.js`:
    - `GET /api/crop-assistance/guides` & `GET /api/crop-assistance/guides/:id`: Stage-by-stage agronomic roadmaps covering land preparation, seed selection, sowing depths, irrigation stages, and split fertilizer schedules.
    - `GET /api/crop-assistance/calendar`: Monthly seasonal calendar with active field operations and recommended crops.
- **Phase 12: Soil Health System & Precision NPK Calculator:**
  - `backend/src/controllers/soilController.js` & `backend/src/routes/soilRoutes.js`:
    - `GET /api/soil/reports` & `POST /api/soil/reports`: Laboratory soil health cards recording pH, Nitrogen, Phosphorus, Potassium, and Organic Carbon with automated fertility ratings.
    - `POST /api/soil/npk-calculator`: Precision agronomic fertilizer dosage calculator computing exact 50kg bags of Urea, DAP, and MOP tailored to target crop and field acreage.
- **Phase 13: Pest & Disease Assistance & IPM Diagnostics:**
  - `backend/src/controllers/pestDiseaseController.js` & `backend/src/routes/pestDiseaseRoutes.js`:
    - `GET /api/pest-disease` & `GET /api/pest-disease/:id`: Pest and plant disease profiles with biological parasitoid controls (e.g. *Trichogramma*) and CIBRC approved chemical treatments.
    - `POST /api/pest-disease/diagnose`: Rule-based symptom matching diagnosis engine with confidence scoring.
- **Mobile Knowledge Center:**
  - `mobile-android/src/screens/knowledge/AgriScienceScreen.js`: 3-tab unified hub for Crop Roadmaps, Soil Health Cards & Interactive NPK Dosage Calculator, and Pest Symptom Diagnosis.
- **Automated Verification:**
  - `backend/tests/agri_science.test.js` (22 automated tests passing).
  - `mobile-android/__tests__/phase11_13.test.js` verifying integration and baseline preservation.

---

## [Phase 9 & Phase 10] - Live Mandi Prices & Agro-Weather System - 2026-11-06

### Added
- **Phase 9: Live Agricultural Mandi Telemetry Subsystem:**
  - `backend/src/controllers/mandiController.js` & `backend/src/routes/mandiRoutes.js`:
    - `GET /api/mandi/rates`: Live APMC rates ticker with district, commodity, and multi-mandi filtering.
    - `GET /api/mandi/commodities`: Aggregated state-wide average modal rates across reporting mandis.
    - `GET /api/mandi/history`: Chronological historical price trend data points for chart rendering and market trend classification (`UP`, `DOWN`, `STABLE`).
    - `GET /api/mandi/comparison`: Cross-mandi comparison evaluating prices across Mandya, Maddur, Mysuru, Hubli, Kolar, and Raichur APMCs.
    - `POST /api/mandi/alerts`, `GET /api/mandi/alerts`, `DELETE /api/mandi/alerts/:id`: Target price alert system.
  - `mobile-android/src/screens/mandi/MandiPriceScreen.js`:
    - Mandi rate cards with Min/Modal/Max price bands, 7-day bar chart trend visualization, inter-mandi comparison panel, and price alert creation modal.
- **Phase 10: Agricultural Weather System:**
  - `backend/src/controllers/weatherController.js` & `backend/src/routes/weatherRoutes.js`:
    - `GET /api/weather/current`: District-level meteorological telemetry with Celsius temperature, relative humidity, wind speed, and rain probability.
    - `GET /api/weather/forecast`: Multi-day daily forecast breakdown for agricultural planning.
    - `GET /api/weather/advisories`: Real-time agronomic guidance based on weather parameters (irrigation schedule, pest/fungal risk, spraying conditions).
    - `GET /api/weather/districts`: Multi-district meteorological coverage across Karnataka.
  - `mobile-android/src/screens/weather/WeatherScreen.js`:
    - Weather hero card with temperature, humidity, wind, and rain indicators; 4-day daily forecast cards; and smart agronomic field advisories with urgency indicators.
- **Automated Verification:**
  - `backend/tests/mandi_weather.test.js` (24 automated tests passing).
  - `mobile-android/__tests__/phase9_10.test.js` verifying integration and baseline preservation.

---

## [Phase 7 & Phase 8] - Agricultural E-Commerce & Direct Crop Marketplace - 2026-11-06

### Added
- **Phase 7: Agricultural E-Commerce Subsystem:**
  - `backend/src/controllers/ecommerceController.js` & `backend/src/routes/ecommerceRoutes.js`:
    - Full coverage across all 10 verified agricultural categories: Seeds, Fertilizers, Bio-Fertilizers, Pesticides, Farming Equipment, Agricultural Tools, Irrigation Products, Organic Products, Crop Protection, Other Supplies.
    - `GET /api/ecommerce/categories` with real-time active product count.
    - `GET /api/ecommerce/products` with text search, category filtering, min/max price range, stock status, and sorting (`price_asc`, `price_desc`, `rating_desc`, `newest`).
    - `GET /api/ecommerce/products/:id` with seller credentials, verified customer reviews, and related recommendations.
    - `POST /api/ecommerce/reviews` with customer ratings (1-5 stars) and dynamic rating recalculation.
  - `mobile-android/src/screens/ecommerce/ProductCatalogScreen.js`:
    - Multi-category pills, keyword search, price/rating sorting, product specification modal, and seamless cart addition.
- **Phase 8: Direct Crop Marketplace Subsystem:**
  - `backend/src/controllers/cropMarketController.js` & `backend/src/routes/cropMarketRoutes.js`:
    - `GET /api/crop-market/listings` & `GET /api/crop-market/listings/:id`: Harvest listings from verified farmers with quality grades (`Grade A`, `Grade B`), mandi delivery locations, and harvest dates.
    - `POST /api/crop-market/listings` & `PUT /api/crop-market/listings/:id`: Farmer crop listing publisher and inventory updater.
    - `POST /api/crop-market/enquiries` & `GET /api/crop-market/farmer/enquiries` & `PUT /api/crop-market/enquiries/:id/status`: Direct buyer-to-farmer price bidding, quantity negotiation, and offer acceptance.
  - `mobile-android/src/screens/cropmarket/CropMarketplaceScreen.js`:
    - Harvest produce marketplace with lot sizes, quality badges, APMC yard delivery tags, "+ List Produce" modal for farmers, and "Make an Offer / Bid" negotiation modal for buyers.
- **Automated Verification:**
  - `backend/tests/ecommerce_cropmarket.test.js` (22 end-to-end tests passing).
  - `mobile-android/__tests__/phase7_8.test.js` verifying code presence and baseline preservation.

---

## [Phase 6] - Admin Dashboard & Platform Governance - 2026-11-06

### Added
- **Backend Admin Governance Subsystem:**
  - `backend/src/controllers/adminController.js` and `backend/src/routes/adminRoutes.js`:
    - `GET /api/admin/dashboard` – Real-time aggregated platform telemetry (total GMV, completed orders, multi-role user counts, pending KYCs, active products, open disputes).
    - `GET /api/admin/users` & `PUT /api/admin/users/:id/status` – Multi-role user governance directory with filtering, search, and one-tap account suspension/reactivation.
    - `GET /api/admin/sellers` & `PUT /api/admin/sellers/:id/verify` – Merchant KYC verification queue with license audits and status toggling (`VERIFIED`, `REJECTED`, `PENDING`).
    - `GET /api/admin/complaints` & `PUT /api/admin/complaints/:id` – Farmer/Buyer grievance resolution log with dispute resolution notes.
    - `GET /api/admin/audit-logs` – Immutable system audit trail logging actions, actors, targets, and timestamps.
    - `GET /api/admin/mandi-prices` & `POST /api/admin/mandi-prices` – Mandi commodity price administration and real-time APMC updates.
- **Backend Automated Test Suite:**
  - `backend/tests/admin.test.js` validating all 17 criteria (admin login, dashboard stats, RBAC 403 guard for non-admins, user directory, suspension/reactivation, seller verification, complaint resolution, mandi price creation, and audit trail).
- **Mobile Admin UI:**
  - `mobile-android/src/screens/admin/AdminDashboardScreen.js` upgraded with 5 tabs:
    - Overview Tab: 4 KPI metric cards (Total GMV, Orders, Registered Users, Pending KYC), Ecosystem participant breakdown, Quick operations, and recent audit events.
    - Seller KYC Queue Tab: Merchant registry cards displaying store name, proprietor contact, license number, GSTIN, and one-tap "Approve KYC" / "Reject KYC" controls.
    - User Governance Directory Tab: Role filter chips (`ALL`, `FARMER`, `BUYER`, `SELLER`, `ADMIN`), text search, and Suspend/Reactivate action buttons.
    - Grievance & Dispute Resolution Tab: Detailed complaint cards with status badges and an interactive "Resolve Dispute" modal capturing APMC arbitration notes.
    - Platform Audit Trail Tab: Last 50 immutable system events with action badges, timestamps, and actor identifiers.
- **Mobile Integration Tests:**
  - `mobile-android/__tests__/phase6.test.js` verifying integration and baseline preservation.

---

## [Phase 5] - Seller System - 2026-11-05

### Added
- **Backend Seller Subsystem:**
  - `backend/src/controllers/sellerController.js` and `backend/src/routes/sellerRoutes.js`:
    - `GET /api/seller/dashboard` – Merchant stats (gross revenue, pending dispatches, active items, low stock alerts) and customer orders.
    - `GET /api/seller/products` – Inventory catalog for the merchant.
    - `POST /api/seller/products` – Creates new agricultural product in SQLite.
    - `PUT /api/seller/products/:id` – Updates product pricing, stock quantity, description, and category.
    - `DELETE /api/seller/products/:id` – Removes item from store inventory.
    - `GET /api/seller/orders` – Lists all customer consignments to fulfill.
    - `PUT /api/seller/orders/:id/status` – Updates order lifecycle state (`PACKED`, `SHIPPED`, `DELIVERED`).
    - `GET /api/seller/reports` – Sales analytics & revenue reports broken down by product category.
- **Backend Automated Test Suite:**
  - `backend/tests/seller.test.js` validating all 8 criteria (dashboard retrieval, product creation, update, deletion, order status transition, sales reports, and RBAC guard).
- **Mobile Seller UI:**
  - `mobile-android/src/screens/seller/SellerDashboardScreen.js` complete merchant cockpit:
    - Verified Merchant header with license number and address.
    - 4-metric revenue and order dispatch cards.
    - Store Inventory manager with category pills, live stock counts, and delete actions.
    - Customer Orders queue with one-tap status updates ("Mark as Packed", "Mark as Shipped").
    - Category-wise sales analytics breakdown.
  - `mobile-android/src/screens/seller/AddProductModal.js` in-app product creator supporting category pills, unit definitions, and stock levels.
- **Mobile Integration Tests:**
  - `mobile-android/__tests__/phase5.test.js` validating all Phase 5 mobile and backend components.

---

## [Phase 4] - Buyer System - 2026-11-05

### Added
- **Database Schema Extensions:**
  - `products`: Product catalog for verified agricultural inputs (Seeds, Fertilizers, Tools, Equipment).
  - `crops_market`: Direct farm harvest listings from verified farmers.
  - `cart_items`: User-specific shopping cart supporting quantities, pricing, and item types.
  - `wishlist_items`: Saved crops and products for buyers.
  - `orders` & `order_items`: Complete order ledger tracking consignment numbers, shipping addresses, payment status, and fulfilment states.
  - `reviews`: Customer quality reviews and 1-5 star ratings.
- **Backend Buyer Subsystem:**
  - `backend/src/controllers/buyerController.js` and `backend/src/routes/buyerRoutes.js`:
    - `GET /api/buyer/dashboard` – Buyer dashboard stats, active orders, featured crops and products.
    - `GET /api/buyer/catalog` – Unified multi-category search with filtering (`type`, `category`) and sorting (`price_asc`, `price_desc`, `rating`).
    - `GET /api/buyer/cart`, `POST /api/buyer/cart`, `DELETE /api/buyer/cart/:id` – Full cart management.
    - `GET /api/buyer/wishlist`, `POST /api/buyer/wishlist` – Wishlist persistence.
    - `POST /api/buyer/checkout` – Order creation pipeline converting cart to confirmed orders with invoice numbering.
    - `GET /api/buyer/orders` & `GET /api/buyer/orders/:id` – Order history and 4-step tracking timeline.
    - `POST /api/buyer/reviews` – Customer rating and feedback recording.
- **Automated Backend Test Suite:**
  - `backend/tests/buyer.test.js` validating all 9 criteria.
- **Mobile Buyer UI:**
  - `mobile-android/src/screens/buyer/BuyerDashboardScreen.js` with instant search, category chips, stock info, and floating cart icon badge.
  - `mobile-android/src/screens/buyer/CartModal.js` with dynamic item quantities, subtotal calculation, delivery fee handling, and checkout form.
  - `mobile-android/src/screens/buyer/OrderTrackingModal.js` with 4-step fulfilment stepper and customer rating submission.
- **Mobile Integration Tests:**
  - `mobile-android/__tests__/phase4.test.js` validating all Phase 4 mobile and backend components.

---

## [Phase 3] - Farmer Profile & Dashboard - 2026-11-05

### Added
- **Database Schema Extensions:**
  - Expanded `farmer_profiles` with `taluk` and `location_gps` columns.
  - Created `farmer_crops` table (`id`, `user_id`, `crop_name`, `variety`, `sowing_date`, `harvest_expected`, `area_acres`, `stage`, `status`, `created_at`).
  - Created `farmer_alerts` table (`id`, `user_id`, `type`, `title`, `message`, `severity`, `created_at`).
  - Created `mandi_prices` table (`id`, `commodity`, `variety`, `state`, `district`, `market_mandi`, `min_price`, `max_price`, `modal_price`, `trend`, `arrival_date`) and seeded verified Mandya/APMC live rates.
  - Created `weather_records` table (`id`, `district`, `state`, `temp_c`, `humidity`, `condition`, `rainfall_chance`, `wind_speed_kmh`, `advisory`, `forecast_json`, `updated_at`) with micro-location agro-advisories.
- **Backend Farmer Subsystem:**
  - `backend/src/controllers/farmerController.js` and `backend/src/routes/farmerRoutes.js`:
    - `GET /api/farmer/profile` – retrieves full farmer landholding and soil profile.
    - `PUT /api/farmer/profile` – updates GPS coordinates, taluk, village, land size, and soil type.
    - `GET /api/farmer/dashboard` – aggregates weather telemetry, live APMC mandi prices, active crops, urgent farming alerts, government schemes, and library recommendations.
    - `POST /api/farmer/crops` – adds a new crop to the field cultivation schedule.
    - `DELETE /api/farmer/crops/:id` – removes or archives a crop.
- **Backend Automated Test Suite:**
  - `backend/tests/farmer.test.js` validating all 7 Farmer API criteria.
- **Mobile Farmer UI Components:**
  - `mobile-android/src/screens/farmer/FarmerProfileModal.js` deep profile editor.
  - `mobile-android/src/screens/farmer/FarmerDashboardScreen.js` comprehensive agricultural dashboard.
- **Mobile Integration Tests:**
  - `mobile-android/__tests__/phase3.test.js` validating all Phase 3 mobile and backend components.

### Changed
- `backend/src/app.js`: Mounted `farmerRoutes` at `/api/farmer`.
- `mobile-android/App.js`: Integrated `FarmerProfileModal` into the navigation flow for farmers.

---

## [Phase 2] - Authentication & Role Management - 2026-11-05

### Added
- **Backend Architecture & Database:**
  - Initialized Express/Node.js backend in `backend/` with standard production dependencies (`bcryptjs`, `cors`, `dotenv`, `express`, `jsonwebtoken`).
  - Implemented persistent ACID SQLite relational database (`backend/data/farmconnect.db`) with tables: `users`, `farmer_profiles`, `buyer_profiles`, `seller_profiles`, `password_resets`, and `audit_logs` with WAL mode and indexing.
- **Real Cryptography & Security:**
  - Standard `bcryptjs` password hashing with 10 salt rounds.
  - HMAC-SHA256 signed JWT session tokens with 7-day expiration.
  - Role-Based Access Control (RBAC) middleware supporting all 4 roles: `FARMER`, `BUYER`, `SELLER`, and `ADMIN`.
- **API Endpoints:**
  - `POST /api/auth/register` (registers user and associated role profile).
  - `POST /api/auth/login` (authenticates via phone or email + password).
  - `GET /api/auth/me` (retrieves current authenticated profile).
  - `PUT /api/auth/profile` (updates user and role-specific details).
  - `POST /api/auth/forgot-password` (generates 6-digit recovery OTP with 15-min expiry).
  - `POST /api/auth/reset-password` (verifies OTP and updates password hash).
  - `GET /api/auth/farmer-only`, `/buyer-only`, `/seller-only`, `/admin-only` (RBAC test guards).
- **Automated Backend Test Suite:**
  - `backend/tests/auth.test.js` validating all 11 auth criteria.
- **Mobile Authentication & Session Engine:**
  - `mobile-android/src/context/AuthContext.js` managing real user sessions, JWT tokens, and login/register/logout handlers.
- **Mobile Auth Screens:**
  - `mobile-android/src/screens/auth/LoginScreen.js` with instant test shortcuts for verified SQLite roles.
  - `mobile-android/src/screens/auth/RegisterScreen.js` with role selector pills and dynamic profile inputs.
  - `mobile-android/src/screens/auth/ForgotPasswordScreen.js` with 6-digit recovery OTP workflow.
- **Role-Specific Dashboards:**
  - `mobile-android/src/screens/farmer/FarmerDashboardScreen.js`
  - `mobile-android/src/screens/buyer/BuyerDashboardScreen.js`
  - `mobile-android/src/screens/seller/SellerDashboardScreen.js`
  - `mobile-android/src/screens/admin/AdminDashboardScreen.js`
  - `mobile-android/src/screens/common/ProfileScreen.js`
- **Mobile & Backend Integration Tests:**
  - `mobile-android/__tests__/phase2.test.js` validating file integrity, baseline text preservation, and 4-role routing.

### Changed
- `mobile-android/App.js`: Integrated `AuthProvider` with automatic role-based routing to custom dashboards while preserving Phase 0 baseline statement and Phase 1 Foundation showcase.

---

## [Phase 1] - Professional Project Foundation - 2026-11-05

### Added
- **Environment Configuration:** `mobile-android/src/config/env.js` supporting dynamic switching between development (`http://10.0.2.2:5000/api`) and production configurations.
- **Agriculture Design System:**
  - `mobile-android/src/theme/colors.js` featuring deep forest green (`#14532d`), leaf green (`#16a34a`), harvest amber (`#d97706`), soil brown (`#78350f`), and monsoon sky blue (`#0284c7`).
  - `mobile-android/src/theme/typography.js` with Android-calibrated font scales and weights.
  - `mobile-android/src/theme/spacing.js` providing 8pt grid tokens, touch-target radiuses, and elevation shadows.
  - `mobile-android/src/theme/index.js` exporting the unified theme system.
- **Service Layer & Utilities:**
  - `mobile-android/src/services/logger.js` structured logger with log levels (`debug`, `info`, `warn`, `error`).
  - `mobile-android/src/services/apiClient.js` normalized HTTP client with timeout handling, token authorization injection, and error formatting.
  - `mobile-android/src/utils/validation.js` form validators for Indian phone numbers (`^[6-9]\d{9}$`), email formats, password strengths, and soil pH/land size boundaries.
- **Notification Infrastructure:**
  - `mobile-android/src/context/NotificationContext.js` global toast and banner provider for success, error, warning, and info messages.
- **Reusable Common UI Components:**
  - `Button.js`: Accessible touch component (min 48dp height) supporting primary, secondary, outline, text, and danger variants.
  - `Input.js`: Accessible text input with label, validation error feedback, and password toggles.
  - `Card.js`: Elevated and bordered surface container for agricultural metrics.
  - `LoadingIndicator.js`: Contextual agricultural progress indicator with status messaging.
  - `EmptyState.js`: Friendly empty list illustration and call-to-action button.
  - `Badge.js`: Status and role indicator pills (`Farmer`, `Buyer`, `Seller`, `Admin`, `Verified`).
  - `Header.js`: Top app bar with Android status bar integration and branding.
- **Automated Verification Suite:**
  - `mobile-android/__tests__/phase1.test.js` validating all 18 files and baseline statement preservation.

### Changed
- `mobile-android/App.js`: Upgraded to interactive Phase 1 Foundation Showcase while strictly preserving the initial `🌱 FarmConnect Operational OS Loaded` baseline statement and role markers.

---

## [Phase 0] - Project Audit, Recovery & Architecture - 2026-11-05

### Added
- Created `docs/FARMCONNECT_MASTER_ROADMAP.md` capturing the complete master roadmap specifications (Part 1, Part 2, and Part 3).
- Created `docs/FARMCONNECT_PROGRESS.md` to track Phase 0 through Phase 32 execution state.
- Created `docs/PROJECT_BASELINE.md` establishing a transparent forensic audit of the existing code and technology stack.
- Created `docs/ARCHITECTURE.md` defining the complete Android-first frontend, backend REST API, and 25-entity relational database architecture.
- Created `docs/KNOWN_ISSUES.md` cataloging legacy gaps and establishing corrective strategies.
- Initialized local Git repository at project root with appropriate `.gitignore`.

### Changed
- Preserved existing `mobile-android/App.js` and `mobile-android/package.json` without deletion or destructive modifications.
- Upgraded `docs/PROJECT_BASELINE.md` from a legacy 2-line placeholder note to a complete technical audit and dependency roadmap.

### Audited & Verified
- Inspected received archive (`FarmConnect-source.zip`).
- Verified Expo SDK 51 React Native mobile-android base setup.
- Identified complete absence of backend server, database schemas, and role routing.
- Confirmed Phase 0 deliverables: complete project audit, technical architecture, and permanent documentation baseline.
