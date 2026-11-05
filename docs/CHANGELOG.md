# FarmConnect – Changelog

All notable changes to the FarmConnect project will be documented in this file.
This project adheres to **STRICT ANTIGRAVITY DEVELOPMENT RULES** with permanent feature preservation and incremental progression.

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
  - `backend/tests/auth.test.js` validating all 11 auth criteria (health check, farmer registration, duplicate prevention, phone/email login, invalid password rejection, protected `/me`, RBAC permission guards, buyer/seller/admin registration, and forgot/reset password).
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
