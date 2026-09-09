# 🛡️ FarmConnect — Security Architecture & Data Protection

## 1. Authentication & Session Security
* **Token Standard:** JWT / Firebase ID Token validation via Firebase Admin SDK.
* **Token Transport:** Bearer tokens transmitted exclusively via HTTP Authorization headers (`Authorization: Bearer <token>`).
* **Session Lifecycle:** Short-lived access tokens (1 hour) with silent refresh token rotation.
* **Sensitive Credentials:** Passwords are never stored on platform application servers; authentication delegations are strictly routed through Firebase Auth.

---

## 2. API Authorization & Access Guards
* **Principle of Least Privilege:** Endpoints enforce strict Role-Based Access Control (RBAC) middleware checks prior to query execution.
* **IDOR Prevention:** Insecure Direct Object Reference vulnerabilities are prevented by binding document modifications to the authenticated session owner ID:
  ```javascript
  // Ensure only the listing owner can alter status or accept bids
  const crop = await CropListing.findOne({ _id: req.params.id, farmerId: req.user._id });