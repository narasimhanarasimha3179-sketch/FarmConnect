# FarmConnect – Technical System Architecture

## 1. System Overview
FarmConnect is an integrated, secure, Android-first agricultural commerce, advisory, and market assistance platform designed to connect four distinct stakeholder roles:
1. **Farmers** (Crop producers seeking market access, weather insights, soil advisories, and farming inputs)
2. **Buyers** (Wholesalers, retailers, and consumers procuring fresh crops directly from farmers)
3. **Sellers** (Agri-input merchants selling seeds, fertilizers, pesticides, tools, and machinery)
4. **Administrators** (Platform moderators managing users, verifying sellers/farmers, moderating content, and overseeing transactions)

```
+-------------------------------------------------------------------------+
|                  FARMCONNECT ANDROID MOBILE CLIENT                      |
|                  (React Native 0.74.1 / Expo SDK 51)                    |
|                                                                         |
|  [Farmer Dashboard]   [Buyer Dashboard]   [Seller Hub]   [Admin Panel]  |
|  [Voice & Multilingual UI (EN, KN, HI)]   [Camera Vision AI Assistant]  |
+------------------------------------+------------------------------------+
                                     | (HTTPS / Secure REST APIs)
                                     v
+------------------------------------+------------------------------------+
|                      FARMCONNECT BACKEND SERVER                         |
|                     (Node.js / Express / Modular)                       |
|                                                                         |
|  +-------------------+  +--------------------+  +--------------------+  |
|  | Auth & RBAC (JWT) |  | Agri-Commerce Core |  | Produce Market Core|  |
|  +-------------------+  +--------------------+  +--------------------+  |
|  | Weather Engine    |  | Live Mandi Prices  |  | AI Advisory Engine |  |
|  +-------------------+  +--------------------+  +--------------------+  |
|  | Soil & Pest Guides|  | Schemes Directory  |  | Payment & Escrow   |  |
|  +-------------------+  +--------------------+  +--------------------+  |
+------------------------------------+------------------------------------+
                                     |
               +---------------------+---------------------+
               |                                           |
               v                                           v
+--------------+---------------+           +---------------+---------------+
|    DATABASE & CACHE TIER     |           |    EXTERNAL INTEGRATIONS      |
|                              |           |                               |
| - Relational Store (SQLite/  |           | - AGMARKNET / Govt Mandi APIs |
|   PostgreSQL: 25+ Entities)  |           | - OpenWeatherMap / IMD API    |
| - Secure File Store (Assets) |           | - Gemini / Vision AI Models   |
| - In-Memory Cache (Prices/   |           | - Payment Gateway (Razorpay)  |
|   Weather Records)           |           | - Push / SMS Gateways         |
+------------------------------+           +-------------------------------+
```

---

## 2. Mobile Frontend Architecture (Android-First)

### Technology Stack
- **Framework:** React Native 0.74.1 with Expo SDK 51.
- **Routing & Navigation:** `@react-navigation/native` with `@react-navigation/native-stack` and `@react-navigation/bottom-tabs`.
- **Localization:** `i18next` / `react-i18next` supporting English (`en`), Kannada (`kn`), and Hindi (`hi`).
- **Audio / Voice:** `expo-speech` (Text-to-Speech) and `expo-av` / native STT for farmer accessibility.
- **Camera & Hardware:** `expo-camera`, `expo-image-picker`, and `expo-location`.
- **Offline / Storage:** `expo-secure-store` for authentication tokens; `AsyncStorage` for offline caching of weather, recent mandi prices, and cached advisories.

### Mobile Directory Structure
```
mobile-android/
├── App.js                     # Root entry point & Top-level Navigation Provider
├── app.json                   # Expo application configuration
├── package.json               # Dependencies and scripts
└── src/
    ├── api/                   # Central API clients and Axios interceptors
    ├── assets/                # Logos, icons, agri illustrations, placeholder imagery
    ├── components/            # Reusable UI widgets (Buttons, Cards, Inputs, Loaders)
    ├── constants/             # Design tokens (Colors, Typography, Layout spacing)
    ├── context/               # AuthContext, LanguageContext, CartContext, ThemeContext
    ├── i18n/                  # Localization files (en.json, kn.json, hi.json)
    ├── navigation/            # Navigation stacks (AuthStack, RoleTabNavigators)
    ├── screens/
    │   ├── auth/              # Login, Register, ForgotPassword, OTP screens
    │   ├── farmer/            # Farmer dashboard, crop listing, soil health, advisories
    │   ├── buyer/             # Marketplace, catalog, search, cart, checkout, orders
    │   ├── seller/            # Inventory manager, product creation, sales reports
    │   ├── admin/             # Verification queue, user management, dispute center
    │   └── common/            # Weather screen, mandi prices, AI chatbot, camera AI, library
    └── utils/                 # Formatters (currency, dates), validation helpers
```

### Design System Tokens
- **Primary / Brand:** Forest Green (`#14532d`), Leaf Green (`#16a34a`), Emerald Accent (`#059669`).
- **Secondary / Accent:** Harvest Amber (`#d97706`), Warm Yellow (`#fef08a`), Earth Brown (`#78350f`).
- **Backgrounds:** Clean Agriculture Gray (`#f8fafc`), Surface Card (`#ffffff`), Muted (`#f1f5f9`).
- **Typography:** High-contrast, clean sans-serif (System Roboto on Android) with large legible headings suited for outdoor phone visibility.

---

## 3. Backend API Architecture

### Architectural Principles
- **Clean Layered Architecture:** Controllers handle HTTP requests -> Services contain business logic -> Models manage database access.
- **Strict Role-Based Access Control (RBAC):** Middleware validates JWT tokens and restricts endpoint access by role:
  - `FARMER`: Produce listings, farm profile, soil logs, personalized advisories.
  - `BUYER`: Cart management, orders, crop/product purchases, reviews.
  - `SELLER`: Inventory CRUD, product stock updates, order fulfilment.
  - `ADMIN`: System-wide moderation, seller verification, scheme/library CMS, analytics.
- **Security-First:** `helmet` for secure headers, `express-rate-limit` against brute-force, `cors` whitelisting, parameter sanitization against SQL/NoSQL injection.

### Backend Directory Structure
```
backend/
├── package.json
├── server.js                  # Entry point (port listener, cluster/process hooks)
├── src/
│   ├── app.js                 # Express app initialization, middleware registration
│   ├── config/                # Environment variables, DB connection, third-party keys
│   ├── constants/             # Role definitions, order statuses, error codes
│   ├── controllers/           # Route handler logic for each module
│   ├── middleware/            # authGuard, roleGuard, errorHandler, rateLimiter, uploader
│   ├── models/                # Database entities / schemas / ORM models
│   ├── routes/                # Modular route declarations
│   ├── services/              # External integrations (Weather, Mandi, AI, SMS, Payment)
│   └── utils/                 # Crypto helpers, validation schemas, logger
└── tests/                     # Unit and integration test suites
```

---

## 4. Database Architecture (Phase 26 Entities)

The database schema supports the complete agricultural lifecycle with 25 key entities:

### 1. Identity & Profiles
- `Users`: `id`, `name`, `email`, `phone`, `password_hash`, `role` (FARMER/BUYER/SELLER/ADMIN), `status`, `avatar_url`, `created_at`, `updated_at`.
- `FarmerProfiles`: `id`, `user_id`, `state`, `district`, `taluk`, `village`, `land_size_acres`, `soil_type`, `primary_crops`, `experience_years`, `language_pref`.
- `BuyerProfiles`: `id`, `user_id`, `business_name`, `buyer_type` (Individual, Retailer, Wholesaler, Exporter), `delivery_address`, `gst_number`.
- `SellerProfiles`: `id`, `user_id`, `shop_name`, `license_number`, `is_verified`, `verification_docs`, `store_address`, `rating`.

### 2. Agricultural E-Commerce (Agri Inputs)
- `Categories`: `id`, `name`, `slug`, `icon_url`, `description`.
- `Products`: `id`, `seller_id`, `category_id`, `title`, `description`, `price`, `stock_quantity`, `unit`, `images_json`, `status`, `created_at`.
- `Cart`: `id`, `user_id`, `items_json`, `updated_at`.
- `Wishlist`: `id`, `user_id`, `product_id`, `created_at`.

### 3. Crop Marketplace (Farmer Produce)
- `Crops`: `id`, `farmer_id`, `crop_name`, `variety`, `quantity`, `unit` (Quintal/Kg/Ton), `expected_price`, `location`, `harvest_date`, `quality_grade`, `images_json`, `description`, `status` (Available, Sold, Reserved).

### 4. Transactions & Fulfilment
- `Orders`: `id`, `order_number`, `buyer_id`, `seller_or_farmer_id`, `order_type` (PRODUCT / CROP), `total_amount`, `order_status` (PENDING, ACCEPTED, PACKED, SHIPPED, DELIVERED, CANCELLED), `shipping_address`, `created_at`.
- `OrderItems`: `id`, `order_id`, `item_type`, `item_id`, `title`, `quantity`, `unit_price`, `total_price`.
- `Payments`: `id`, `order_id`, `transaction_id`, `payment_method` (UPI/Card/COD), `amount`, `status` (PENDING, SUCCESS, FAILED, REFUNDED), `receipt_url`, `created_at`.
- `Reviews`: `id`, `user_id`, `target_type` (PRODUCT/SELLER/CROP), `target_id`, `rating` (1-5), `comment`, `created_at`.

### 5. Agricultural Data & Intelligence
- `MarketPrices`: `id`, `commodity`, `variety`, `state`, `district`, `market_mandi`, `min_price`, `max_price`, `modal_price`, `arrival_date`, `source`.
- `WeatherRecords`: `id`, `location_key`, `latitude`, `longitude`, `temp_c`, `humidity`, `rainfall_mm`, `wind_speed`, `forecast_json`, `advisory`, `fetched_at`.
- `SoilRecords`: `id`, `farmer_id`, `test_date`, `soil_type`, `ph_level`, `nitrogen`, `phosphorus`, `potassium`, `organic_carbon`, `recommendations_json`.
- `PestInformation`: `id`, `crop_name`, `pest_name`, `symptoms`, `causes`, `prevention`, `ipm_controls`, `chemical_treatments`, `images_json`.
- `DiseaseInformation`: `id`, `crop_name`, `disease_name`, `symptoms`, `pathogen_type`, `biological_controls`, `chemical_treatments`, `images_json`.
- `Schemes`: `id`, `title`, `state` (Central/Karnataka/Other), `category`, `eligibility`, `benefits`, `required_documents`, `application_url`, `deadline`, `status`.
- `LibraryResources`: `id`, `title`, `category`, `description`, `content_body`, `media_url`, `source`, `language`, `created_at`.

### 6. Social, AI & Governance
- `CommunityPosts`: `id`, `author_id`, `title`, `content`, `image_url`, `tags_json`, `likes_count`, `created_at`.
- `Comments`: `id`, `post_id`, `user_id`, `content`, `created_at`.
- `AIConversations`: `id`, `user_id`, `session_id`, `role` (user/assistant), `message_text`, `context_data_json`, `created_at`.
- `Notifications`: `id`, `user_id`, `title`, `body`, `type` (ORDER, PRICE_ALERT, WEATHER, SCHEME, SYSTEM), `is_read`, `data_json`, `created_at`.
- `AuditLogs`: `id`, `user_id`, `action`, `resource`, `ip_address`, `details_json`, `timestamp`.

---

## 5. Security & Privacy Framework
- **Password Protection:** Standard bcrypt hashing with minimum work factor of 10.
- **JWT Authentication:** Short-lived access tokens with secure refresh tokens stored on the client via `expo-secure-store`.
- **RBAC Enforcement:** Route-level middleware ensures users can only access their authorized domain.
- **Input Validation:** Strict payload validation using declarative schemas preventing malformed data and injection.
- **File Upload Security:** File type validation (JPEG/PNG/PDF), file size limits, and sanitization before storage.
