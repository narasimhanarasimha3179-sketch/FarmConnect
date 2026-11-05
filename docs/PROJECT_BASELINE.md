# FarmConnect Project Baseline

## Historical Origin Note
> Original baseline entry: `All 32 phases verified.` (Legacy Gemini session baseline assertion)

---

## 1. Executive Summary & Forensic Audit
A comprehensive audit of the received repository archive (`FarmConnect-source.zip`) was executed during Phase 0 on 2026-11-05. 

### Actual Existing State
- **Mobile Frontend:** Minimal Expo / React Native container (`mobile-android/App.js`, 12 lines) rendering a single static Text element: `🌱 FarmConnect Operational OS Loaded`.
- **Frontend Dependencies:** `expo ~51.0.0`, `react 18.2.0`, `react-native 0.74.1`.
- **Backend:** Absent. No server code, no Express/NestJS/FastAPI application exists.
- **Database & Data Models:** Absent. No PostgreSQL, MongoDB, Prisma, or SQLite schemas or migrations exist.
- **Authentication:** Absent. No JWT, session, or role handling code exists.
- **Navigation:** Absent. No React Navigation (Stack / Tab) configuration exists.
- **API Architecture:** Absent. No network service or endpoint client exists.
- **Documentation:** Only the legacy 2-line baseline marker existed before Phase 0 initialization.

---

## 2. Inventory of Discovered Assets

| Path | Purpose | Lines of Code | Status |
| :--- | :--- | :--- | :--- |
| `mobile-android/package.json` | Expo application manifest | 16 | Valid base configuration |
| `mobile-android/App.js` | Main entry point | 12 | Placeholder shell |
| `docs/PROJECT_BASELINE.md` | Baseline documentation | 2 | Expanded in Phase 0 |

---

## 3. Technology Stack Specification
To satisfy the requirements of Phases 0 through 32, the official technology stack is established as follows:

### Mobile Application (Android-First)
- **Framework:** React Native with Expo SDK 51 (Managed workflow, bare-workflow compatible).
- **Navigation:** `@react-navigation/native` with `@react-navigation/bottom-tabs` and `@react-navigation/native-stack`.
- **State Management & Data Fetching:** React Context / Zustand + Axios with central interceptors.
- **Storage:** SecureStore (`expo-secure-store`) for credentials, AsyncStorage for non-sensitive cache.
- **Device Features:** Camera (`expo-camera`), Image Picker (`expo-image-picker`), Location (`expo-location`), Speech/Audio (`expo-speech` / `expo-av`), Notifications (`expo-notifications`).
- **Styling:** Custom theme engine with agriculture-themed token system (`#14532d` deep emerald, `#16a34a` leafy green, `#fef08a` harvest yellow, neutral `#f3f4f6`).

### Backend Service (To be established in Phase 1 / Phase 27)
- **Runtime:** Node.js (v18+) with Express or Fastify.
- **Language:** TypeScript / JavaScript (Clean modular architecture).
- **Authentication:** JSON Web Tokens (JWT) with bcrypt password hashing, refresh token rotation, and role-based middleware (`FARMER`, `BUYER`, `SELLER`, `ADMIN`).
- **Validation:** Joi or Zod request validation schemas.
- **Logging & Errors:** Centralized error handler, Winston/Morgan logging.

### Database Architecture (To be established in Phase 26)
- **Primary Data Store:** SQLite / PostgreSQL (Relational schema enforcing constraints across 25+ business entities).
- **Key Schemas:** Users, Roles, FarmerProfiles, BuyerProfiles, SellerProfiles, Products, Crops, Categories, Orders, OrderItems, Payments, MandiPrices, WeatherCache, SoilReports, Diseases, Schemes, LibraryResources, CommunityPosts, Notifications, AuditLogs.

---

## 4. Gap Analysis vs Roadmap Phases (0 to 32)

| Phase | Description | Audit Status | Gap / Required Work |
| :--- | :--- | :--- | :--- |
| **Phase 0** | Audit, Recovery & Architecture | **IN PROGRESS** | Documentation, git checkpoints, architecture mapping |
| **Phase 1** | Foundation & Design System | Missing | Architecture structure, theme, API client, global components |
| **Phase 2** | Auth & 4 Roles | Missing | Register/login, JWT, bcrypt, role guard, profile endpoints |
| **Phase 3** | Farmer Dashboard | Missing | Weather widget, crop management, mandi ticker, alerts |
| **Phase 4** | Buyer System | Missing | Product catalog, cart, checkout, order tracking, wishlist |
| **Phase 5** | Seller System | Missing | Inventory, product catalog CRUD, order fulfilment, metrics |
| **Phase 6** | Admin Dashboard | Missing | Role management, KYC approval, platform moderation |
| **Phase 7** | Agri E-Commerce | Missing | Seeds, fertilizers, tools, cart, checkout pipeline |
| **Phase 8** | Crop Marketplace | Missing | Harvest listings, variety, bulk quantity, buyer inquiries |
| **Phase 9** | Mandi Live Prices | Missing | Market price ingestion (AGMARKNET/Govt APIs), price history |
| **Phase 10** | Weather System | Missing | OpenWeather/Govt API connector, rainfall, agro-advisories |
| **Phase 11** | Crop Cultivation Guides | Missing | Knowledge base categorized by crop, region, growth stage |
| **Phase 12** | Soil Health System | Missing | N-P-K, pH recording, automated fertilizer calculation |
| **Phase 13** | Pest & Disease Knowledge | Missing | Symptoms, IPM biological controls, verified guidance |
| **Phase 14** | Camera & Plant AI | Missing | Device camera integration, image upload, AI inference |
| **Phase 15** | FarmConnect AI Assistant | Missing | Conversational agricultural bot, contextual assistance |
| **Phase 16** | Multilingual (EN/KN/HI) | Missing | i18n localization dictionaries for English, Kannada, Hindi |
| **Phase 17** | Voice Interface | Missing | Speech-to-text input, text-to-speech for farmers |
| **Phase 18** | Govt Schemes Portal | Missing | Central & Karnataka state schemes, eligibility checking |
| **Phase 19** | Payment System | Missing | Payment gateway integration, verification, ledger |
| **Phase 20** | Logistics & Tracking | Missing | Order status lifecycle (placed, packed, shipped, delivered) |
| **Phase 21** | Notification Engine | Missing | In-app alerts, price triggers, weather warnings |
| **Phase 22** | Farmer Community | Missing | Discussion forum, image posts, Q&A, comments |
| **Phase 23** | Agricultural Library | Missing | Educational articles, video links, guidebooks |
| **Phase 24** | Global Search | Missing | Unified multi-entity indexed search engine |
| **Phase 25** | Security Hardening | Missing | Rate limiting, input sanitization, security headers |
| **Phase 26** | Database Completion | Missing | Schema migrations, relationship constraints, indexes |
| **Phase 27** | API Completion | Missing | REST endpoints with swagger/documentation |
| **Phase 28** | Professional UI/UX | Missing | Production design polish, animations, skeleton loaders |
| **Phase 29** | Complete Testing | Missing | Unit tests, flow integration tests, device testing |
| **Phase 30** | Performance Optimization| Missing | Image compression, list memoization, query caching |
| **Phase 31** | Production Deployment | Missing | Release APK builds, backend deployment configuration |
| **Phase 32** | Final QA & Release | Missing | End-to-end verification and documentation delivery |

---

## 5. Preservation Guarantee
Under **STRICT ANTIGRAVITY RULE 2 & RULE 4**:
- Existing code in `mobile-android/App.js` and `mobile-android/package.json` will be preserved and extended, not discarded.
- No files will be removed without explicit authorization.
- Every phase builds additively upon prior work.
