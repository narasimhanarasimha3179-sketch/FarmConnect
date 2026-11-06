# FarmConnect Operations & Maintenance Manual (Phase 32)

## 1. Overview
FarmConnect is an Android-first smart agricultural trade, agronomy, and market assistance platform connecting Farmers, Buyers, Sellers, and Platform Administrators.

## 2. System Architecture & Tech Stack
- **Backend API:** Node.js (v24.x LTS) with Express.js
- **Database Engine:** Native built-in `node:sqlite` (zero C++ dependencies, WAL journal mode enabled, foreign keys enforced)
- **Mobile Frontend:** React Native Android application
- **Authentication:** Salted bcrypt password hashing + signed JSON Web Tokens (JWT)
- **Internationalization:** English (`en`), Kannada (`kn`), Hindi (`hi`)
- **Port:** Default 5000 (`http://localhost:5000/api`)

---

## 3. Quick Start & Execution

### Running the Backend Server
```bash
cd backend
npm install
npm start
```

### Running the Test Suite (Master QA Runner)
```bash
node scripts/run_all_tests.js
```

### Starting the Android Mobile App
```bash
cd mobile-android
npm install
npm start
```

---

## 4. Production Deployment

### PM2 Process Manager
```bash
pm2 start ecosystem.config.js --env production
pm2 logs farmconnect-api
pm2 status
```

### Docker Deployment
```bash
docker-compose up -d --build
docker-compose logs -f farmconnect-api
```

### Health Check Endpoint
```bash
curl http://localhost:5000/api/health
```
Expected response:
```json
{
  "status": "ONLINE",
  "system": "FarmConnect Smart Agriculture Platform API",
  "version": "1.0.0-phase32",
  "uptime_seconds": 12.4
}
```

---

## 5. Database Backup & Maintenance

### SQLite WAL Checkpoint & Backup
The production SQLite database is stored at `backend/data/farmconnect.db`.
To create an atomic backup:
```bash
# Automated atomic backup
sqlite3 backend/data/farmconnect.db ".backup 'backend/data/farmconnect_backup_$(date +%Y%m%d).db'"
```

### Database Optimization
Run periodic VACUUM and ANALYZE:
```sql
PRAGMA optimize;
VACUUM;
```

---

## 6. Seed Accounts & Roles

| Role | Email / Identifier | Password | Default Dashboard |
| :--- | :--- | :--- | :--- |
| **Farmer** | `ramesh.farmer@example.com` | `FarmerPassword123` | Farmer Cockpit (Weather, Mandi, Crops, Soil) |
| **Buyer** | `kiran.buyer@example.com` | `BuyerPassword123` | Buyer Store, Crop Market, Cart, Orders |
| **Seller** | `cauvery.seller@example.com` | `SellerPassword123` | Merchant Catalog, Stock, Orders, Revenue |
| **Admin** | `admin@farmconnect.org` | `AdminSuperPassword123` | Platform Governance, KYC, Disputes, Audit |

---

## 7. Permanent Baseline Verification
The React Native mobile entry point `mobile-android/App.js` permanently preserves the baseline identifier:
```javascript
<Text style={styles.baselineText}>🌱 FarmConnect Operational OS Loaded</Text>
```
All 32 developmental phases remain permanently functional, integrated, and verified.
