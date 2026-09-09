# 👥 FarmConnect — Role-Based Access Control (RBAC) Matrix

## 1. Defined Platform Roles

* **Farmer (`farmer`):** Primary producer listing crops, requesting bids, accessing AI disease diagnostics, weather forecasts, and purchasing farm supplies.
* **Buyer / Trader (`buyer`):** Wholesale commodity purchaser, food processor, or retail trader browsing farm listings, submitting price bids, and arranging logistics.
* **Agri-Input Seller (`seller`):** Certified vendor supplying physical inputs (seeds, bio-fertilizers, organic pesticides, irrigation equipment) to the e-commerce catalog.
* **Agricultural Expert (`expert`):** Verified agronomist providing consultation, review of complex plant pathology scans, and regional agronomic advisories.
* **Administrator (`admin`):** Platform supervisor managing user verifications, moderating marketplace listings, reviewing dispute claims, and overseeing system health.

---

## 2. Granular Permissions Matrix

| Feature Module / Action | Farmer | Buyer | Seller | Expert | Admin |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Browse Mandi Prices & Trends** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **View Weather & Crop Advisory** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Run Camera AI Leaf Diagnosis** | ✅ | ❌ | ❌ | ✅ | ✅ |
| **Create Crop Yield Listing** | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Manage Own Crop Lot (Edit/Close)** | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Submit Price Bid on Crop** | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Accept / Reject Buyer Bid** | ✅ | ❌ | ❌ | ❌ | ✅ |
| **List Input Product in E-Commerce** | ❌ | ❌ | ✅ | ❌ | ✅ |
| **Manage Input Inventory & Pricing** | ❌ | ❌ | ✅ | ❌ | ✅ |
| **Purchase Input Supplies (Cart/Checkout)** | ✅ | ✅ | ❌ | ❌ | ✅ |
| **Submit Expert Consultation Notes** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Verify Seller / Expert Credentials** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Moderate Flagged Listings / Reviews** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Access System Analytics & Logs** | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 3. Enforcement Strategy

* **Token Validation:** Every protected API request carries a JWT/Firebase bearer token containing the user's encrypted `uid` and verified `role`.
* **Route Middleware:** Express controllers enforce endpoint authorization using a declarative gatekeeper middleware:
  ```javascript
  const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Access forbidden: insufficient role permissions' });
      }
      next();
    };
  };